import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

function getExchangesMenu(ctx: any) {
  const { exchanges }: { exchanges: cpz.Exchange[] } = ctx.scene.state;
  return Extra.HTML().markup((m: any) => {
    const buttons = exchanges.map(({ code }) => [
      m.callbackButton(
        `${code}`,
        JSON.stringify({ a: "exchange", p: code }),
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

async function addUserExAccEnter(ctx: any) {
  try {
    if (ctx.scene.state.selectedExchange)
      return addUserExAccSelectedExchange.call(this, ctx);
    if (!ctx.scene.state.exchanges)
      ctx.scene.state.exchanges = await this.broker.call(
        `${cpz.Service.DB_EXCHANGES}.find`,
        {
          fields: ["code"],
          query: {
            available: 5
          }
        }
      );
    if (ctx.scene.state.edit) {
      return ctx.editMessageText(
        ctx.i18n.t("scenes.addUserExAcc.chooseExchange"),
        getExchangesMenu(ctx)
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.addUserExAcc.chooseExchange"),
      getExchangesMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserExAccSelectedExchange(ctx: any) {
  try {
    let exchange: string;

    if (ctx.scene.state.selectedExchange)
      exchange = ctx.scene.state.selectedExchange;
    else {
      ({ p: exchange } = JSON.parse(ctx.callbackQuery.data));
      ctx.scene.state.selectedExchange = exchange;
    }
    ctx.scene.state.stage = "key";
    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(
        ctx.i18n.t("scenes.addUserExAcc.enterAPIKey", { exchange }),
        Extra.HTML()
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.addUserExAcc.enterAPIKey", { exchange }),
      Extra.HTML()
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserExAccSubmited(ctx: any) {
  try {
    const exchange: string = ctx.scene.state.selectedExchange;
    if (ctx.scene.state.stage === "key") {
      ctx.scene.state.key = ctx.message.text;
      ctx.scene.state.stage = "secret";
      return ctx.reply(
        ctx.i18n.t("scenes.addUserExAcc.enterAPISecret", { exchange }),
        Extra.HTML()
      );
    } else if (ctx.scene.state.stage === "secret") {
      ctx.scene.state.secret = ctx.message.text;
    } else {
      return addUserExAccSelectedExchange.call(this, ctx);
    }

    await ctx.reply(
      ctx.i18n.t("scenes.addUserExAcc.check", { exchange }),
      Extra.HTML()
    );

    const {
      key,
      secret
    }: {
      key: string;
      secret: string;
    } = ctx.scene.state;

    const { success, result, error } = await this.broker.call(
      `${cpz.Service.DB_USER_EXCHANGE_ACCS}.upsert`,
      {
        exchange,
        keys: { key, secret }
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    if (success) {
      await ctx.reply(
        ctx.i18n.t("scenes.addUserExAcc.success", { name: result }),
        Extra.HTML()
      );
      await addUserExAccBack.call(this, ctx);
    } else {
      await ctx.reply(
        ctx.i18n.t("scenes.addUserExAcc.failed", {
          exchange,
          error: error || ctx.i18n.t("unknownError")
        }),
        Extra.HTML()
      );
      ctx.scene.state.key = null;
      ctx.scene.state.secret = null;
      ctx.scene.state.stage = null;
      await addUserExAccSelectedExchange.call(this, ctx);
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserExAccBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(ctx.scene.state.prevScene, ctx.scene.state.prevState);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserExAccLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  addUserExAccEnter,
  addUserExAccSelectedExchange,
  addUserExAccSubmited,
  addUserExAccBack,
  addUserExAccLeave
};
