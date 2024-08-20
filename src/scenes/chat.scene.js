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
import { removeAnyRelatedCurrentChats, updateLastChatTgId } from "@db/actions";
import { appService } from "@utils/app.service";

export const chatScene = new Scenes.BaseScene(SCENES.CHAT_SCENE);

const leaveSceneAndEndChat = async (ctx) => {
  await updateLastChatTgId(
    getUserId(ctx),
    appService.getPartner(getUserId(ctx)),
  );
  await removeAnyRelatedCurrentChats(getUserId(ctx));
  await ctx.scene.leave();
  return ctx.scene.enter(SCENES.MAIN_SCENE);
};

export const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .oneTime();

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = appService.getPartner(getUserId(ctx));
    if (ctx.message.text !== STRINGS.LEAVE) {
      if (providerId) {
        return ctx.telegram.sendMessage(
          providerId,
          formatSystemMessage(ctx.message.text, "consumer"),
        );
      }
      return ctx.reply(
        formatSystemMessage(STRINGS.PROVIDER_IS_NO_MORE),
        CHAT_SCREEN_KEYBOARD,
      );
    }

    await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.LEAVING));

    if (providerId) {
      await ctx.telegram.sendMessage(
        providerId,
        formatSystemMessage(STRINGS.CONSUMER_HAS_LEFT),
        generateProviderChatScreenkeyboard(false),
      );
    }
    return leaveSceneAndEndChat(ctx);
  } catch (error) {
    return replyError(error);
  }
});
