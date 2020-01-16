import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { chunkArray, round } from "../../../utils/helpers";
import { getMainKeyboard } from "../keyboard";

function getExchangesMenu(ctx: any) {
  const exchanges: { exchange: string }[] = ctx.scene.state.exchanges;
  return Extra.HTML().markup((m: any) => {
    const buttons = exchanges.map(({ exchange }) =>
      m.callbackButton(
        exchange,
        JSON.stringify({ a: "exchange", p: exchange }),
        false
      )
    );
    const chunkedButtons = chunkArray(buttons, 3);
    return m.inlineKeyboard([
      ...chunkedButtons,
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back", p: null }),
          false
        )
      ]
    ]);
  });
}

function getSignalsListMenu(ctx: any) {
  const robots: {
    id: string;
    name: string;
    profit: number;
    subscribed: boolean;
  }[] = ctx.scene.state.robots;
  return Extra.HTML().markup((m: any) => {
    const buttons = robots.map(({ name, id, profit, subscribed }) => [
      m.callbackButton(
        `${name} | ${profit > 0 ? "+" : ""}${round(profit, 2)}$ ${
          subscribed === true ? "✅" : ""
        }`,
        JSON.stringify({ a: "robot", p: id }),
        false
      )
    ]);

    return m.inlineKeyboard([
      ...buttons,
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back" }),
          false
        )
      ]
    ]);
  });
}

async function topSignalsEnter(ctx: any) {
  try {
    let exchanges: { exchange: string }[];
    if (ctx.scene.state.exchanges && !ctx.scene.state.reload)
      exchanges = ctx.scene.state.exchanges;
    else {
      exchanges = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.getAvailableExchanges`,
        {
          signals: true
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      ctx.scene.state.exchanges = exchanges;
    }
    if (!exchanges || !Array.isArray(exchanges) || exchanges.length < 0) {
      throw new Error("Failed to load trading exchanges");
    }
    ctx.scene.state.exchange = null;
    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(
        ctx.i18n.t("scenes.topSignals.selectExchange"),
        getExchangesMenu(ctx)
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.topSignals.selectExchange"),
      getExchangesMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function topSignalsSelectRobot(ctx: any) {
  try {
    if (!ctx.scene.state.exchange) {
      const { p: exchange } = JSON.parse(ctx.callbackQuery.data);
      ctx.scene.state.exchange = exchange;
    }
    ctx.scene.state.robots = await this.broker.call(
      `${cpz.Service.DB_ROBOTS}.getTopSignalRobots`,
      {
        exchange: ctx.scene.state.exchange,
        limit: 10
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );

    if (
      !ctx.scene.state.robots ||
      !Array.isArray(ctx.scene.state.robots) ||
      ctx.scene.state.robots.length === 0
    ) {
      throw new Error("Failed to load signal robots");
    }

    return ctx.editMessageText(
      ctx.i18n.t("scenes.topSignals.selectRobot", {
        exchange: ctx.scene.state.exchange
      }),
      getSignalsListMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function topSignalsOpenRobot(ctx: any) {
  try {
    const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      robotId,
      edit: true,
      prevScene: cpz.TelegramScene.TOP_SIGNALS,
      prevState: { ...ctx.scene.state, stage: "selectRobot" }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function topSignalsBack(ctx: any) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = JSON.parse(ctx.callbackQuery.data);
      if (data && data.p) {
        ctx.scene.state.stage = data.p;
        if (ctx.scene.state.stage === "selectRobot") {
          return topSignalsSelectRobot.call(this, ctx);
        }
      }
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SIGNALS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function topSignalsBackEdit(ctx: any) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = JSON.parse(ctx.callbackQuery.data);
      if (data && data.p) {
        ctx.scene.state.stage = data.p;
        ctx.scene.state.edit = true;
        if (ctx.scene.state.stage === "selectRobot") {
          return topSignalsSelectRobot.call(this, ctx);
        }
      }
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SIGNALS, { edit: true });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function topSignalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  topSignalsEnter,
  topSignalsSelectRobot,
  topSignalsOpenRobot,
  topSignalsBack,
  topSignalsBackEdit,
  topSignalsLeave
};
