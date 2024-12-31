import { SCENES, STRINGS, USER_TYPE_ENUM } from "@constants/index";
import { appService } from "@utils/app.service";
import { formatSystemMessage, getUserId, replyError } from "@utils/index";
import { encrypt } from "libs/crypto-js";
import apiService from "services/api.service";
import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

export const mainScene = new Scenes.BaseScene(SCENES.MAIN_SCENE);

const getMainSceneProviderKeyboard = (isCurrentlyProviding) => {
  return Markup.keyboard([
    isCurrentlyProviding ? STRINGS.STOP_PROVIDING : STRINGS.START_PROVIDING,
    STRINGS.ACCOUNT_SETTINGS,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();
};

const getMainSceneConsumerKeyboard = () =>
  Markup.keyboard([
    STRINGS.CONNECT_TO_PROVIDER,
    STRINGS.VIEW_CONNECTS_LIST,
    STRINGS.SEND_COMPLAIN,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();

mainScene.enter(async (ctx) => {
  try {
    const { user_type, is_providing, nickname, is_busy } =
      (await apiService.getUserProperties(getUserId(ctx))) || {};
    const canProvide = [
      USER_TYPE_ENUM.Specialist,
      USER_TYPE_ENUM.Provider,
    ].includes(user_type);

    if (is_busy) {
      await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));

      await appService.removeRelatedConnections(getUserId(ctx));

      await apiService.updateUserActiveState({
        tg_id: getUserId(ctx),
        is_busy: false,
      });
    }

    await ctx.reply(
      formatSystemMessage(
        `${STRINGS.MAIN_MENU}\n${nickname}  : الاسم المستعار الذي يظهر للطرف الاخر`,
      ),
      canProvide
        ? getMainSceneProviderKeyboard(is_providing)
        : getMainSceneConsumerKeyboard(),
    );

    if (is_providing) {
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
    }
    return;
  } catch (error) {
    return replyError(error, ctx);
  }
});

mainScene.on(message("text"), async (ctx) => {
  try {
    switch (ctx.message.text) {
      case STRINGS.CONNECT_TO_PROVIDER: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MATCHING_SCENE);
        return;
      }
      case STRINGS.CONNECT_TO_LAST_PROVIDER: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MATCHING_SCENE);
        return;
      }

      case STRINGS.START_PROVIDING: {
        await ctx.reply(formatSystemMessage(STRINGS.LOADING));

        await apiService.updateUserActiveState({
          tg_id: getUserId(ctx),
          is_providing: true,
          is_busy: false,
        });

        await ctx.scene.leave();

        await ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
        return;
      }

      case STRINGS.STOP_PROVIDING: {
        await apiService.updateUserActiveState({
          tg_id: getUserId(ctx),
          is_providing: false,
          is_busy: false,
        });

        await ctx.scene.leave();

        await ctx.scene.enter(SCENES.MAIN_SCENE);
        return;
      }

      case STRINGS.SEND_COMPLAIN: {
        await ctx.reply(
          formatSystemMessage(STRINGS.YOU_CAN_COMPLAIN_HERE),
          Markup.inlineKeyboard([
            Markup.button.url(
              STRINGS.COMPLAIN,
              "https://t.me/Salam_initiative_bot",
            ),
          ]),
        );
        return;
      }
      case STRINGS.VIEW_CONNECTS_LIST: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.CONNECTS_LIST);
        return;
      }

      case STRINGS.ACCOUNT_SETTINGS:
        {
          const { id: dashboardUserId, role } =
            await apiService.getDashboardAccountByTgId(getUserId(ctx));

          if (!dashboardUserId) {
            await ctx.reply(STRINGS.DASHBOARD_ACCOUNT_NOT_FOUND);
            return;
          }

          const token = encrypt(
            JSON.stringify({
              botUserId: getUserId(ctx),
              dashboardUserId,
              role,
            }),
          );
          const dashboardUrl = `${process.env.DASHBOARD_URL}/auth?token=${encodeURIComponent(token)}`;

          await ctx.reply(
            formatSystemMessage(STRINGS.ACCOUNT_SETTINGS_MESSAGE),
            Markup.inlineKeyboard([
              Markup.button.url(STRINGS.EDIT, dashboardUrl),
            ]),
          );
        }
        return;

      case STRINGS.REFRESH: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MAIN_SCENE);
        return;
      }
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
