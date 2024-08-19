import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { getUserId, replyWithClearKeyboard } from "@utils/index.js";
import { SCENES, STRINGS } from "@constants/index";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards";
import { removeAnyRelatedCurrentChats } from "@db/actions";
import { appService } from "@utils/app.service";

export const chatScene = new Scenes.BaseScene(SCENES.CHAT_SCENE);

const leaveSceneAndEndChat = async (ctx) => {
  await removeAnyRelatedCurrentChats(getUserId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MAIN_SCENE);
};

const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .persistent();

chatScene.enter(async (ctx) => {
  const providerId =
    appService.getPartner(getUserId(ctx)) || ctx.scene.state.initialProviderId;

  if (providerId) {
    await ctx.telegram.sendMessage(
      providerId,
      STRINGS.YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER,
      generateProviderChatScreenkeyboard(true),
    );
    await ctx.reply(
      STRINGS.YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER,
      CHAT_SCREEN_KEYBOARD,
    );
  } else {
    await ctx.reply(STRINGS.SOMETHING_WENT_WRONG);
    await leaveSceneAndEndChat(ctx);
  }
});

chatScene.on(message("text"), async (ctx) => {
  const providerId = appService.getPartner(getUserId(ctx));
  if (ctx.message.text !== STRINGS.LEAVE) {
    if (providerId) {
      await ctx.telegram.sendMessage(providerId, ctx.message.text);
    } else {
      await ctx.reply(STRINGS.PROVIDER_IS_NO_MORE, CHAT_SCREEN_KEYBOARD);
    }
  } else {
    await replyWithClearKeyboard(ctx, STRINGS.LEAVING);
    if (providerId) {
      await ctx.telegram.sendMessage(
        providerId,
        STRINGS.CONSUMER_HAS_LEFT,
        generateProviderChatScreenkeyboard(false),
      );
    }
    await leaveSceneAndEndChat(ctx);
  }
});
