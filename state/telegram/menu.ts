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
    const buttons = robots.map(({ code, id }) => [
      m.callbackButton(code, JSON.stringify({ a: "robot", p: id }), false)
    ]);

    return m.inlineKeyboard(buttons);
  });
}

export { getAssetsMenu, getSignalsMenu };
