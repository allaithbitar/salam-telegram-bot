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

import { appService } from "@utils/app.service";
import apiService from "services/api.service";

export const chatScene = new Scenes.BaseScene(SCENES.CHAT_SCENE);

const leaveSceneAndEndChat = async (ctx) => {
  const providerId = await appService.getMatchId(getUserId(ctx));
  if (providerId) {
    await apiService.updateConnectsHistory({
      consumer_id: getUserId(ctx),
      providerId,
    });
    await apiService.updateUserActiveState({
      tg_id: providerId,
      is_busy: false,
    });
  }

  await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));
  await appService.removeRelatedConnections(getUserId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MAIN_SCENE);
  return;
};

export const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .oneTime();

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = await appService.getMatchId(getUserId(ctx));

    if (ctx.message.text !== STRINGS.LEAVE) {
      const consumerNickname = await appService.getUserNicknameFromInMemoryDb(
        getUserId(ctx),
      );

      if (providerId) {
        await ctx.telegram.sendMessage(
          providerId,
          formatSystemMessage(ctx.message.text, "consumer", consumerNickname),
          {
            reply_parameters: {
              message_id: ctx.message.reply_to_message?.message_id,
              chat_id: ctx.message?.reply_to_message?.chat?.id,
            },
          },
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
    await replyError(error, ctx);
    return;
  }
});
