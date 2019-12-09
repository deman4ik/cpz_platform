import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { chunkArray } from "../../../utils/helpers";
import { getMainKeyboard } from "../keyboard";

function getAssetsMenu(
  assets: {
    asset: string;
    currency: string;
  }[]
) {
  return Extra.HTML().markup((m: any) => {
    const buttons = assets.map(asset =>
      m.callbackButton(
        `${asset.asset}/${asset.currency}`,
        JSON.stringify({ a: "asset", p: `${asset.asset}/${asset.currency}` }),
        false
      )
    );
    const chunkedButtons = chunkArray(buttons, 3);
    return m.inlineKeyboard(chunkedButtons);
  });
}

function getSignalsListMenu(
  robots: { id: string; name: string; subscribed: boolean }[]
) {
  return Extra.HTML().markup((m: any) => {
    const buttons = robots.map(({ name, id, subscribed }) => [
      m.callbackButton(
        `${name} ${subscribed === true ? "✅" : ""}`,
        JSON.stringify({ a: "robot", p: id }),
        false
      )
    ]);

    return m.inlineKeyboard(buttons);
  });
}

async function searchSignalsEnter(ctx: any) {
  try {
    let assets: {
      asset: string;
      currency: string;
    }[];
    if (ctx.scene.state.assets) assets = ctx.scene.state.assets;
    else {
      assets = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.getAvailableSignalAssets`
      );
      ctx.scene.state.assets = assets;
    }
    if (!assets || !Array.isArray(assets) || assets.length < 0) {
      throw new Error("Failed to load signal assets");
    }

    if (ctx.scene.state.reply)
      return ctx.reply(
        ctx.i18n.t("scenes.searchSignals.selectAsset"),
        getAssetsMenu(assets)
      );
    return ctx.editMessageText(
      ctx.i18n.t("scenes.searchSignals.selectAsset"),
      getAssetsMenu(assets)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function searchSignalsSelectedAsset(ctx: any) {
  try {
    const { p: selectedAsset } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.selectedAsset = selectedAsset;
    const [asset, currency] = selectedAsset.split("/");
    const robots = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.getSignalRobots`,
      {
        asset,
        currency
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    if (!robots || !Array.isArray(robots) || robots.length === 0) {
      throw new Error("Failed to load signal robots");
    }
    this.logger.info(robots);
    return ctx.editMessageText(
      ctx.i18n.t("scenes.searchSignals.selectRobot", { asset: selectedAsset }),
      getSignalsListMenu(robots)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function searchSignalsSelectedRobot(ctx: any) {
  try {
    const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      robotId,
      prevScene: cpz.TelegramScene.SEARCH_SIGNALS,
      prevState: { assets: ctx.scene.state.assets, reply: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function searchSignalsBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SIGNALS);
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
  searchSignalsSelectedAsset,
  searchSignalsSelectedRobot,
  searchSignalsBack,
  searchSignalsLeave
};
