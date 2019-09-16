import Telegraf, { Extra } from "telegraf";
import { cpz } from "../../types/cpz";
import { chunkArray } from "../../utils/helpers";

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

function getSignalsMenu(robots: cpz.RobotState[]) {
  return Extra.HTML().markup((m: any) => {
    const buttons = robots.map(({ name, id }) => [
      m.callbackButton(name, JSON.stringify({ a: "robot", p: id }), false)
    ]);

    return m.inlineKeyboard(buttons);
  });
}

function getSignalRobotMenu(ctx: any, robotId: string, subscribed: boolean) {
  return Extra.HTML().markup((m: any) => {
    const subscribeToggleButton = !subscribed
      ? m.callbackButton(
          ctx.i18n.t("scenes.signals.subscribeSignals"),
          JSON.stringify({ a: "subscribe", p: robotId }),
          false
        )
      : m.callbackButton(
          ctx.i18n.t("scenes.signals.unsubscribeSignals"),
          JSON.stringify({ a: "unsubscribe", p: robotId }),
          false
        );

    return m.inlineKeyboard([
      [
        m.callbackButton(
          ctx.i18n.t("robot.menuInfo"),
          JSON.stringify({ a: "info", p: robotId }),
          false
        ),
        m.callbackButton(
          ctx.i18n.t("robot.menuStats"),
          JSON.stringify({ a: "stats", p: robotId }),
          false
        ),
        m.callbackButton(
          ctx.i18n.t("robot.menuPositions"),
          JSON.stringify({ a: "pos", p: robotId }),
          false
        )
      ],
      [subscribeToggleButton]
    ]);
  });
}

export { getAssetsMenu, getSignalsMenu, getSignalRobotMenu };
