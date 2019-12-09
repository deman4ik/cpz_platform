import { Extra } from "telegraf";

function getRobotsMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.my"),
          JSON.stringify({ a: "myRobots" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.add"),
          JSON.stringify({ a: "addRobots" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.perfomance"),
          JSON.stringify({ a: "perfRobots" }),
          false
        )
      ]
    ];

    return m.inlineKeyboard(buttons);
  });
}
