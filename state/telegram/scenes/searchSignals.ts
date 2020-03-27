import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { chunkArray } from "../../../utils/helpers";
import { getMainKeyboard } from "../keyboard";
import { formatExchange } from "../../../utils/naming";

function getExchangesMenu(ctx: any) {
  const exchanges: { exchange: string }[] = ctx.scene.state.exchanges;
  return Extra.HTML().markup((m: any) => {
    const buttons = exchanges.map(({ exchange }) =>
      m.callbackButton(
        formatExchange(exchange),
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

function getAssetsMenu(ctx: any) {
  const assets: {
    asset: string;
    currency: string;
  }[] = ctx.scene.state.assets;
  return Extra.HTML().markup((m: any) => {
    const buttons = assets.map(asset =>
      m.callbackButton(
        `${asset.asset}/${asset.currency}`,
        JSON.stringify({ a: "asset", p: `${asset.asset}/${asset.currency}` }),
        false
      )
    );
    const chunkedButtons = chunkArray(buttons, 3);
    return m.inlineKeyboard([
      ...chunkedButtons,
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back", p: "selectExchange" }),
          false
        )
      ]
    ]);
  });
}

function getSignalsListMenu(ctx: any) {
  const robots: { id: string; name: string; subscribed: boolean }[] =
    ctx.scene.state.robots;
  return Extra.HTML().markup((m: any) => {
    const buttons = robots.map(({ name, id, subscribed }) => [
      m.callbackButton(
        `${name} ${subscribed === true ? "✅" : ""}`,
        JSON.stringify({ a: "robot", p: id }),
        false
      )
    ]);

    return m.inlineKeyboard([
      ...buttons,
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back", p: "selectAsset" }),
          false
        )
      ]
    ]);
  });
}

async function searchSignalsEnter(ctx: any) {
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
        ctx.i18n.t("scenes.searchSignals.selectExchange"),
        getExchangesMenu(ctx)
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.searchSignals.selectExchange"),
      getExchangesMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function searchSignalsSelectAsset(ctx: any) {
  try {
    let assets: {
      asset: string;
      currency: string;
    }[];

    if (!ctx.scene.state.exchange) {
      const { p: exchange } = JSON.parse(ctx.callbackQuery.data);
      ctx.scene.state.exchange = exchange;
    }
    assets = await this.broker.call(
      `${cpz.Service.DB_ROBOTS}.getAvailableAssets`,
      {
        signals: true,
        exchange: ctx.scene.state.exchange
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.assets = assets;

    if (!assets || !Array.isArray(assets) || assets.length < 0) {
      throw new Error("Failed to load signal assets");
    }
    ctx.scene.state.selectedAsset = null;

    return ctx.editMessageText(
      ctx.i18n.t("scenes.searchSignals.selectAsset", {
        exchange: formatExchange(ctx.scene.state.exchange)
      }),
      getAssetsMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function searchSignalsSelectRobot(ctx: any) {
  try {
    if (!ctx.scene.state.selectedAsset) {
      const { p: selectedAsset } = JSON.parse(ctx.callbackQuery.data);
      ctx.scene.state.selectedAsset = selectedAsset;
    }
    const [asset, currency] = ctx.scene.state.selectedAsset.split("/");
    ctx.scene.state.robots = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.getSignalRobots`,
      {
        exchange: ctx.scene.state.exchange,
        asset,
        currency
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
      ctx.i18n.t("scenes.searchSignals.selectRobot", {
        exchange: formatExchange(ctx.scene.state.exchange),
        asset: ctx.scene.state.selectedAsset
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

async function searchSignalsOpenRobot(ctx: any) {
  try {
    const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      robotId,
      edit: true,
      prevScene: cpz.TelegramScene.SEARCH_SIGNALS,
      prevState: { ...ctx.scene.state, stage: "selectRobot" }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function searchSignalsBack(ctx: any) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = JSON.parse(ctx.callbackQuery.data);
      if (data && data.p) {
        ctx.scene.state.stage = data.p;
        if (ctx.scene.state.stage === "selectAsset")
          return searchSignalsSelectAsset.call(this, ctx);
        if (ctx.scene.state.stage === "selectRobot") {
          return searchSignalsSelectRobot.call(this, ctx);
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

async function searchSignalsBackEdit(ctx: any) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      const data = JSON.parse(ctx.callbackQuery.data);
      if (data && data.p) {
        ctx.scene.state.stage = data.p;
        ctx.scene.state.edit = true;
        if (ctx.scene.state.stage === "selectAsset")
          return searchSignalsSelectAsset.call(this, ctx);
        if (ctx.scene.state.stage === "selectRobot") {
          return searchSignalsSelectRobot.call(this, ctx);
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

async function searchSignalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  searchSignalsEnter,
  searchSignalsSelectAsset,
  searchSignalsSelectRobot,
  searchSignalsOpenRobot,
  searchSignalsBack,
  searchSignalsBackEdit,
  searchSignalsLeave
};
