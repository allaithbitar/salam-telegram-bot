import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SCENES, STRINGS } from "../constants/index.js";
import {
  formatSystemMessage,
  getUserId,
  handleInChatMessage,
  replyError,
  setScoppedCommandsMenu,
} from "@utils/index.js";

// import { generateProviderChatScreenkeyboard } from "@utils/keyboards.js";
import { appService } from "@utils/app.service.js";
import apiService from "services/api.service.js";
import {
  GenerateProviderChatSceneCommandsMenu,
  PROVIDER_CHAT_SCENE_COMMANDS,
} from "@utils/keyboards.js";

export const providerChatScene = new Scenes.BaseScene(
  SCENES.PROVIDER_CHAT_SCENE,
);

const handleEndChat = async ({ ctx, consumerId }) => {
  await ctx.reply(formatSystemMessage(STRINGS.LEAVING));

  await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));

  await appService.removeRelatedConnections(getUserId(ctx));

  await apiService.updateUserActiveState({
    tg_id: getUserId(ctx),
    is_busy: false,
  });

  await setScoppedCommandsMenu(
    ctx,
    getUserId(ctx),
    GenerateProviderChatSceneCommandsMenu(false),
  );

  await ctx.reply(formatSystemMessage(STRINGS.CONVERSATION_HAS_BEEN_ENDED));

  if (consumerId) {
    await appService.removeRelatedConnections(consumerId);

    // await apiService.updateConnectsHistory({
    //   provider_id: getUserId(ctx),
    //   consumer_id: consumerId,
    // });

    await ctx.telegram.sendMessage(
      consumerId,
      formatSystemMessage(STRINGS.THE_OTHER_SIDE_HAS_LEFT),
    );
  }
};

const handleStopProviding = async ({ ctx }) => {
  await appService.removeRelatedConnections(getUserId(ctx));

  await apiService.updateUserActiveState({
    tg_id: getUserId(ctx),
    is_providing: false,
  });

  await ctx.scene.leave();

  await ctx.scene.enter(SCENES.MAIN_SCENE);

  await ctx.reply(formatSystemMessage(STRINGS.PROVIDING_STOPPED));
};

providerChatScene.enter(async (ctx) => {
  try {
    const isInChat = !!(await appService.getMatchId(getUserId(ctx)));

    await setScoppedCommandsMenu(
      ctx,
      getUserId(ctx),
      GenerateProviderChatSceneCommandsMenu(isInChat),
    );

    await ctx.reply(formatSystemMessage(STRINGS.WAITING_FOR_A_CONSUMER));
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});

providerChatScene.command(
  PROVIDER_CHAT_SCENE_COMMANDS.stop_providing,
  async (ctx) => {
    await handleStopProviding({ ctx });
    return;
  },
);

providerChatScene.command(
  PROVIDER_CHAT_SCENE_COMMANDS.end_chat,
  async (ctx) => {
    const consumerId = await appService.getMatchId(getUserId(ctx));
    await handleEndChat({ ctx, consumerId });
    return;
  },
);

providerChatScene.command(
  PROVIDER_CHAT_SCENE_COMMANDS.end_chat_stop_providing,
  async (ctx) => {
    const consumerId = await appService.getMatchId(getUserId(ctx));
    await handleEndChat({ ctx, consumerId });
    await handleStopProviding({ ctx });
    return;
  },
);

providerChatScene.on(message("text"), async (ctx) => {
  try {
    const consumerId = await appService.getMatchId(getUserId(ctx));

    if (!consumerId) {
      await ctx.reply(
        formatSystemMessage(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_USER),
      );

      return;
    }

    await handleInChatMessage(ctx, consumerId);

    return;
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
