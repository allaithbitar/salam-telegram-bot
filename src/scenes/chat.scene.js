import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import {
  formatSystemMessage,
  getUserId,
  replyError,
  replyWithClearKeyboard,
} from "@utils/index.js";
import { SCENES, STRINGS } from "@constants/index";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards";
import {
  removeAnyRelatedCurrentChats,
  updateConnectsHistory,
  updateUserPreferences,
} from "@db/actions";
import { appService } from "@utils/app.service";

export const chatScene = new Scenes.BaseScene(SCENES.CHAT_SCENE);

const leaveSceneAndEndChat = async (ctx) => {
  const providerId = appService.getPartner(getUserId(ctx))?.id;
  if (providerId) {
    await updateConnectsHistory(getUserId(ctx), providerId);
    await updateUserPreferences(providerId, {
      is_busy: false,
    });
  }

  await removeAnyRelatedCurrentChats(getUserId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MAIN_SCENE);
  return;
};

export const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .oneTime();

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = appService.getPartner(getUserId(ctx))?.id;

    if (ctx.message.text !== STRINGS.LEAVE) {
      const consumerNickname = appService.getMe(getUserId(ctx))?.nickname;
      if (providerId) {
        await ctx.telegram.sendMessage(
          providerId,
          formatSystemMessage(ctx.message.text, "consumer", consumerNickname),
        );
        return;
      }
      await ctx.reply(
        formatSystemMessage(STRINGS.PROVIDER_IS_NO_MORE),
        CHAT_SCREEN_KEYBOARD,
      );
      return;
    }

    await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.LEAVING));

    if (providerId) {
      await ctx.telegram.sendMessage(
        providerId,
        formatSystemMessage(STRINGS.CONSUMER_HAS_LEFT),
        generateProviderChatScreenkeyboard(false),
      );
    }
    await leaveSceneAndEndChat(ctx);
    return;
  } catch (error) {
    return replyError(error);
  }
});
