import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

function getUserExAccsMenu(ctx: any) {
  const {
    userExAccs
  }: { userExAccs: cpz.UserExchangeAccount[] } = ctx.scene.state;
  return Extra.HTML().markup((m: any) => {
    const userExAccButtons = userExAccs.map(({ name, id }) => [
      m.callbackButton(
        `${name}`,
        JSON.stringify({ a: "userExAcc", p: id }),
        false
      )
    ]);
    const buttons = userExAccButtons;
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

async function addUserRobotEnter(ctx: any) {
  try {
    if (ctx.scene.state.userExAccId)
      return addUserRobotSelectedAcc.call(this, ctx);
    const {
      robotInfo: { exchange, code }
    }: {
      robotInfo: cpz.RobotInfo;
    } = ctx.scene.state.selectedRobot;

    const userExAccs: cpz.UserExchangeAccount[] = await this.broker.call(
      `${cpz.Service.DB_USER_EXCHANGE_ACCS}.find`,
      {
        query: {
          exchange,
          userId: ctx.session.user.id
        }
      }
    );

    if (userExAccs && Array.isArray(userExAccs) && userExAccs.length > 0) {
      ctx.scene.state.userExAccs = userExAccs;

      if (ctx.scene.state.edit) {
        ctx.scene.state.edit = false;
        return ctx.editMessageText(
          ctx.i18n.t("scenes.addUserRobot.selectExAcc", {
            exchange,
            code
          }),
          getUserExAccsMenu(ctx)
        );
      }
      return ctx.editMessageText(
        ctx.i18n.t("scenes.addUserRobot.selectExAcc", {
          exchange,
          code
        }),
        getUserExAccsMenu(ctx)
      );
    } else {
      await ctx.reply(
        ctx.i18n.t("scenes.addUserRobot.noneExAccs", {
          code,
          exchange
        }),
        Extra.HTML()
      );
      ctx.scene.state.silent = true;
      return ctx.scene.enter(cpz.TelegramScene.ADD_USER_EX_ACC, {
        selectedExchange: exchange,
        prevScene: cpz.TelegramScene.USER_ROBOT,
        prevState: ctx.scene.state.prevState
      });
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserRobotSelectedAcc(ctx: any) {
  try {
    if (!ctx.scene.state.userExAccId) {
      const { p: userExAccId } = JSON.parse(ctx.callbackQuery.data);
      ctx.scene.state.userExAccId = userExAccId;
    }

    const {
      robotInfo,
      market
    }: {
      robotInfo: cpz.RobotInfo;
      market: cpz.Market;
    } = ctx.scene.state.selectedRobot;
    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(
        ctx.i18n.t("scenes.addUserRobot.enterVolume", {
          code: robotInfo.code,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
    }

    return ctx.editMessageText(
      ctx.i18n.t("scenes.addUserRobot.enterVolume", {
        code: robotInfo.code,
        asset: robotInfo.asset,
        minVolume: market.limits.amount.min
      }),
      Extra.HTML()
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserRobotConfirm(ctx: any) {
  try {
    if (!ctx.scene.state.userExAccId) return addUserRobotEnter.call(this, ctx);

    const { id: robotId } = ctx.scene.state.selectedRobot.robotInfo;
    let volume: number;
    let error: string;
    try {
      volume = parseFloat(ctx.message.text);
      if (isNaN(volume)) error = "Volume is not a number";
    } catch (e) {
      error = e.message;
    }

    if (!error) {
      ({ error } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.create`,
        {
          robotId,
          userExAccId: ctx.scene.state.userExAccId,
          settings: {
            volume
          }
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      ));
    }

    if (error) {
      const {
        robotInfo,
        market
      }: {
        robotInfo: cpz.RobotInfo;
        market: cpz.Market;
      } = ctx.scene.state.selectedRobot;
      await ctx.reply(
        ctx.i18n.t("scenes.addUserRobot.wrongVolume", {
          code: robotInfo.code,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
      ctx.scene.state.reply = true;
      return addUserRobotSelectedAcc.call(this, ctx);
    }

    const {
      robotInfo,
      userRobotInfo,
      market
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
      market: cpz.Market;
    } = await this.broker.call(
      `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
      {
        robotId: ctx.scene.state.selectedRobot.robotInfo.id
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };
    await ctx.reply(
      ctx.i18n.t("scenes.addUserRobot.success", {
        code: ctx.scene.state.selectedRobot.robotInfo.code,
        volume,
        asset: ctx.scene.state.selectedRobot.robotInfo.asset
      }),
      Extra.HTML()
    );
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.START_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      prevState: ctx.scene.state.prevState
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserRobotBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.USER_ROBOT, {
      ...ctx.scene.state.prevState,
      edit: false,
      reload: true
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function addUserRobotLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  addUserRobotEnter,
  addUserRobotSelectedAcc,
  addUserRobotConfirm,
  addUserRobotBack,
  addUserRobotLeave
};
