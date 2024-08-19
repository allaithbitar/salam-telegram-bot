import { SCENES, STRINGS } from "@constants/index";
import {
  addActiveProvider,
  getCurrentUserTypeAndStatus,
  removeActiveProvider,
} from "@db/actions";
import { getMessageId, getUserId } from "@utils/index";
import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

export const mainScene = new Scenes.BaseScene(SCENES.MAIN_SCENE);

const getMainSceneProviderKeyboard = (isCurrentlyProviding) => {
  return Markup.keyboard([
    isCurrentlyProviding ? STRINGS.STOP_PROVIDING : STRINGS.START_PROVIDING,
  ]).resize();
};

const MAIN_SCENE_CONSUMER_KEYBOARD = Markup.keyboard([
  [STRINGS.CONNECT_TO_PROVIDER],
])
  .resize()
  .oneTime();

mainScene.enter(async (ctx) => {
  const { isProvider, isAvailable } = await getCurrentUserTypeAndStatus(
    getUserId(ctx),
  );
  return ctx.reply(
    STRINGS.MAIN_MENU,
    isProvider
      ? getMainSceneProviderKeyboard(isAvailable)
      : MAIN_SCENE_CONSUMER_KEYBOARD,
  );
});

mainScene.on(message("text"), async (ctx) => {
  switch (ctx.message.text) {
    case STRINGS.CONNECT_TO_PROVIDER: {
      await ctx.scene.leave();
      return ctx.scene.enter(SCENES.MATCHING_SCENE, {
        keyboardMessageId: getMessageId(ctx),
      });
    }
    case STRINGS.START_PROVIDING: {
      Promise.all([
        addActiveProvider(getUserId(ctx)),
        ctx.reply(STRINGS.LOADING),
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
  }
});
