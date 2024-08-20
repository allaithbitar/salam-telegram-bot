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
import { removeAnyRelatedCurrentChats } from "@db/actions";
import { appService } from "@utils/app.service";

export const chatScene = new Scenes.BaseScene(SCENES.CHAT_SCENE);

const leaveSceneAndEndChat = async (ctx) => {
  await removeAnyRelatedCurrentChats(getUserId(ctx));
  await ctx.scene.leave();
  return ctx.scene.enter(SCENES.MAIN_SCENE);
};

const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .persistent();

chatScene.enter(async (ctx) => {
  try {
    const providerId =
      appService.getPartner(getUserId(ctx)) ||
      ctx.scene.state.initialProviderId;

    if (providerId) {
      await ctx.telegram.sendMessage(
        providerId,
        formatSystemMessage(STRINGS.YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER),
        generateProviderChatScreenkeyboard(true),
      );
      await ctx.reply(
        formatSystemMessage(STRINGS.YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER),
        CHAT_SCREEN_KEYBOARD,
      );
    } else {
      await ctx.reply(formatSystemMessage(STRINGS.SOMETHING_WENT_WRONG));
      return leaveSceneAndEndChat(ctx);
    }
  } catch (error) {
    return replyError(error, ctx);
  }
});

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = appService.getPartner(getUserId(ctx));
    if (ctx.message.text !== STRINGS.LEAVE) {
      if (providerId) {
        await ctx.telegram.sendMessage(
          providerId,
          formatSystemMessage(ctx.message.text, "provider"),
        );
      } else {
        await ctx.reply(
          formatSystemMessage(STRINGS.PROVIDER_IS_NO_MORE),
          CHAT_SCREEN_KEYBOARD,
        );
      }
    } else {
      await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.LEAVING));
      if (providerId) {
        await ctx.telegram.sendMessage(
          providerId,
          formatSystemMessage(STRINGS.CONSUMER_HAS_LEFT),
          generateProviderChatScreenkeyboard(false),
        );
      }
      return leaveSceneAndEndChat(ctx);
    }
  } catch (error) {
    return replyError(error);
  }
});
