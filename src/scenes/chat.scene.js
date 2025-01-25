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

const endChatAndEnterRatingScene = async (ctx) => {
  let providerId = await appService.getMatchId(getUserId(ctx));

  if (!providerId) {
    providerId = (await apiService.getLasChatProviderId(getUserId(ctx)))
      ?.provider_id;
  }

  // await apiService.updateConnectsHistory({
  //   consumer_id: getUserId(ctx),
  //   providerId,
  // });

  await apiService.updateUserActiveState({
    tg_id: providerId,
    is_busy: false,
  });

  await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));
  await appService.removeRelatedConnections(getUserId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.RATING_SCENE, {
    providerId,
  });
  // await ctx.scene.enter(SCENES.MAIN_SCENE);
  return;
};

export const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
  .resize()
  .oneTime();

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = await appService.getMatchId(getUserId(ctx));

    if (ctx.message.text !== STRINGS.LEAVE) {
      // const consumerNickname = await appService.getUserNicknameFromInMemoryDb(
      //   getUserId(ctx),
      // );

      if (providerId) {
        await ctx.telegram.sendMessage(providerId, ctx.message.text, {
          reply_parameters: {
            message_id: ctx.message.reply_to_message?.message_id,
            chat_id: ctx.message?.reply_to_message?.chat?.id,
          },
        });
        return;
      }
      await ctx.reply(
        formatSystemMessage(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_USER),
        CHAT_SCREEN_KEYBOARD,
      );
      return;
    }

    await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.LEAVING));

    if (providerId) {
      await ctx.telegram.sendMessage(
        providerId,
        formatSystemMessage(STRINGS.THE_OTHER_SIDE_HAS_LEFT),
        generateProviderChatScreenkeyboard(false),
      );
    }

    // await replyWithClearKeyboard(
    //   ctx,
    //   formatSystemMessage(STRINGS.WOULD_YOU_LIKE_TO_RATE),
    // );
    await endChatAndEnterRatingScene(ctx);
    return;
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
