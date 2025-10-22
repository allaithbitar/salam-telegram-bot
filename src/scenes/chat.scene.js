import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import {
  formatSystemMessage,
  getUserId,
  handleInChatMessage,
  replyError,
  replyWithClearKeyboard,
  setScoppedCommandsMenu,
} from "@utils/index.js";
import { SCENES, STRINGS } from "@constants/index";

import { appService } from "@utils/app.service";
import apiService from "services/api.service";
import { GenerateProviderChatSceneCommandsMenu } from "@utils/keyboards";

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
  await ctx.reply(formatSystemMessage(STRINGS.CONVERSATION_HAS_BEEN_ENDED));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.RATING_SCENE, {
    providerId,
  });
  // await ctx.scene.enter(SCENES.MAIN_SCENE);
  return;
};

// export const CHAT_SCREEN_KEYBOARD = Markup.keyboard([[STRINGS.LEAVE]])
//   .resize()
//   .oneTime();

export const CONSUMER_CHAT_SCREEN_COMMANDS = {
  leave: "leave",
};

export const CONSUMER_CHAT_SCREEN_COMMANDS_MENU = [
  {
    command: "leave",
    description: STRINGS.LEAVE,
  },
];

// chatScene.on("message_reaction", async (ctx) => {
//   const reaction = ctx.messageReaction?.new_reaction;
//   const targetMessage = ctx.messageReaction?.message_id;
//   const reactionSenderId = ctx.messageReaction.chat.id;
//   console.log(ctx.messageReaction);
//   const providerId = await appService.getMatchId(reactionSenderId);
//
//   console.log({
//     reaction,
//     targetMessage,
//     providerId,
//     userId: getUserId(ctx),
//     reactionSenderId,
//   });
//
//   if (reaction && targetMessage && providerId) {
//     await ctx.telegram.setMessageReaction(providerId, targetMessage, reaction);
//     // await ctx.messageReaction(reaction);
//   }
//   // console.log(ctx.update, "123");
// });
//
chatScene.enter((ctx) => {
  setScoppedCommandsMenu(
    ctx,
    getUserId(ctx),
    CONSUMER_CHAT_SCREEN_COMMANDS_MENU,
  );
});

chatScene.command(CONSUMER_CHAT_SCREEN_COMMANDS.leave, async (ctx) => {
  const providerId = await appService.getMatchId(getUserId(ctx));
  await ctx.reply(formatSystemMessage(STRINGS.LEAVING));

  if (providerId) {
    await setScoppedCommandsMenu(
      ctx,
      providerId,
      GenerateProviderChatSceneCommandsMenu(false),
    );

    await ctx.telegram.sendMessage(
      providerId,
      formatSystemMessage(STRINGS.THE_OTHER_SIDE_HAS_LEFT),
    );
  }

  await endChatAndEnterRatingScene(ctx);
});

chatScene.on(message("text"), async (ctx) => {
  try {
    const providerId = await appService.getMatchId(getUserId(ctx));

    if (!providerId) {
      await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_USER));
      return;
    }

    await handleInChatMessage(ctx, providerId);

    return;
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
