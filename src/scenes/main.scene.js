import { SCENES, STRINGS } from "@constants/index";
import {
  updateUserPreferences,
  getCurrentUserTypeAndStatus,
  getLastChatTgId,
} from "@db/actions";
import { formatSystemMessage, getUserId, replyError } from "@utils/index";
import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

export const mainScene = new Scenes.BaseScene(SCENES.MAIN_SCENE);

const getMainSceneProviderKeyboard = (isCurrentlyProviding) => {
  return Markup.keyboard([
    isCurrentlyProviding ? STRINGS.STOP_PROVIDING : STRINGS.START_PROVIDING,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();
};

const getMainSceneConsumerKeyboard = (shouldShowConnectToLastProviderButton) =>
  Markup.keyboard([
    STRINGS.CONNECT_TO_PROVIDER,
    ...(shouldShowConnectToLastProviderButton
      ? [STRINGS.CONNECT_TO_LAST_PROVIDER]
      : []),

    STRINGS.SEND_COMPLAIN,
    STRINGS.VIEW_CONNECTS_LIST,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();

mainScene.enter(async (ctx) => {
  let lastChatTgId;
  try {
    const { canProvide, isAvailable } = await getCurrentUserTypeAndStatus(
      getUserId(ctx),
    );
    if (!canProvide) {
      lastChatTgId = await getLastChatTgId(getUserId(ctx));
    }

    return ctx.reply(
      formatSystemMessage(STRINGS.MAIN_MENU),
      canProvide
        ? getMainSceneProviderKeyboard(isAvailable)
        : getMainSceneConsumerKeyboard(!!lastChatTgId),
    );
  } catch (error) {
    return replyError(error, ctx);
  }
});

mainScene.on(message("text"), async (ctx) => {
  try {
    switch (ctx.message.text) {
      case STRINGS.CONNECT_TO_PROVIDER: {
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.MATCHING_SCENE);
      }
      case STRINGS.CONNECT_TO_LAST_PROVIDER: {
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.MATCHING_SCENE, {
          tryConnectToLastProvider: true,
        });
      }

      case STRINGS.START_PROVIDING: {
        await Promise.all([
          updateUserPreferences(getUserId(ctx), {
            is_providing: true,
            is_busy: false,
          }),
          ctx.reply(formatSystemMessage(STRINGS.LOADING)),
        ]);
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
      }
      case STRINGS.STOP_PROVIDING: {
        await Promise.all([
          updateUserPreferences(getUserId(ctx), {
            is_providing: false,
            is_busy: false,
          }),
          ctx.scene.leave(),
        ]);
        return ctx.scene.enter(SCENES.MAIN_SCENE);
      }
      case STRINGS.SEND_COMPLAIN: {
        return ctx.reply(
          formatSystemMessage(STRINGS.YOU_CAN_COMPLAIN_HERE),
          Markup.inlineKeyboard([
            Markup.button.url(
              STRINGS.COMPLAIN,
              "https://t.me/Salam_initiative_bot",
            ),
          ]),
        );
      }
      case STRINGS.VIEW_CONNECTS_LIST: {
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.CONNECTS_LIST);
      }

      case STRINGS.REFRESH: {
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.MAIN_SCENE);
      }
    }
  } catch (error) {
    return replyError(error, ctx);
  }
});
