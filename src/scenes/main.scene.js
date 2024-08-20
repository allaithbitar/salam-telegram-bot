import { SCENES, STRINGS } from "@constants/index";
import {
  addActiveProvider,
  getCurrentUserTypeAndStatus,
  removeActiveProvider,
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
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();

mainScene.enter(async (ctx) => {
  try {
    const { isProvider, isAvailable, lastChatTgId } =
      await getCurrentUserTypeAndStatus(getUserId(ctx));

    return ctx.reply(
      formatSystemMessage(STRINGS.MAIN_MENU),
      isProvider
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
          addActiveProvider(getUserId(ctx)),
          ctx.reply(formatSystemMessage(STRINGS.LOADING)),
        ]);
        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
      }
      case STRINGS.STOP_PROVIDING: {
        await Promise.all([
          removeActiveProvider(getUserId(ctx)),
          ctx.scene.leave(),
        ]);
        return ctx.scene.enter(SCENES.MAIN_SCENE);
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
