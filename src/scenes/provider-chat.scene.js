import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SCENES, STRINGS } from "../constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";

import { generateProviderChatScreenkeyboard } from "@utils/keyboards.js";
import { appService } from "@utils/app.service.js";
import apiService from "services/api.service.js";

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

  await ctx.reply(
    formatSystemMessage(STRINGS.CONVERSATION_HAS_BEEN_ENDED),
    generateProviderChatScreenkeyboard(false),
  );

  if (consumerId) {
    await appService.removeRelatedConnections(consumerId);

    await apiService.updateConnectsHistory({
      provider_id: getUserId(ctx),
      consumer_id: consumerId,
    });

    await ctx.telegram.sendMessage(
      consumerId,
      formatSystemMessage(STRINGS.PROVIDER_HAS_ENDED_CHAT),
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
};

providerChatScene.enter(async (ctx) => {
  try {
    const isInChat = !!(await appService.getMatchId(getUserId(ctx)));
    await ctx.reply(
      formatSystemMessage(STRINGS.WAITING_FOR_A_CONSUMER),
      generateProviderChatScreenkeyboard(isInChat),
    );
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});

providerChatScene.on(message("text"), async (ctx) => {
  try {
    const consumerId = await appService.getMatchId(getUserId(ctx));

    if (
      ![
        STRINGS.END_CHAT,
        STRINGS.END_CHAT_STOP_PROVIDING,
        STRINGS.STOP_PROVIDING,
        STRINGS.REFRESH,
      ].includes(ctx.message.text)
    ) {
      if (!consumerId) {
        await ctx.reply(
          formatSystemMessage(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_CONSUMER),
        );
        return;
      }

      const providerNickname = await appService.getUserNicknameFromInMemoryDb(
        getUserId(ctx),
      );

      await ctx.telegram.sendMessage(
        consumerId,
        formatSystemMessage(ctx.message.text, "provider", providerNickname),
      );
      return;
    }

    switch (ctx.message.text) {
      case STRINGS.END_CHAT: {
        await handleEndChat({ ctx, consumerId });
        // await Promise.all([
        //   ctx.reply(formatSystemMessage(STRINGS.LEAVING)),
        //   apiService.removeAllRelatedOnGoingChats(getUserId(ctx)),
        //   apiService.updateUserActiveState({
        //     tg_id: getUserId(ctx),
        //     is_busy: false,
        //   }),
        // ]);

        return;
      }

      case STRINGS.STOP_PROVIDING: {
        await handleStopProviding({ ctx });

        return;
      }

      case STRINGS.END_CHAT_STOP_PROVIDING: {
        await handleEndChat({ ctx, consumerId });
        await handleStopProviding({ ctx });
        // if (consumerId) {
        //   await apiService.updateConnectsHistory({
        //     consumer_id: consumerId,
        //     provider_id: getUserId(ctx),
        //   });
        // }
        //
        // await ctx.reply(formatSystemMessage(STRINGS.LEAVING)),
        //   await Promise.all([
        //     apiService.removeAllRelatedOnGoingChats(getUserId(ctx)),
        //     apiService.updateUserActiveState({
        //       tg_id: getUserId(ctx),
        //       is_providing: false,
        //       is_busy: false,
        //     }),
        //   ]);
        //
        // if (consumerId) {
        //   await appService.removeRelatedConnections(consumerId);
        //
        //   await ctx.telegram.sendMessage(
        //     consumerId,
        //     formatSystemMessage(STRINGS.PROVIDER_HAS_ENDED_CHAT),
        //   );
        // }
        //
        // await appService.removeRelatedConnections(getUserId(ctx));
        //
        // await ctx.scene.leave();
        // await ctx.scene.enter(SCENES.MAIN_SCENE);
        return;
      }
      // case STRINGS.REFRESH: {
      //   await ctx.reply(
      //     formatSystemMessage(STRINGS.REFRESH),
      //     generateProviderChatScreenkeyboard(
      //       appService.getIsInChat(getUserId(ctx)),
      //     ),
      //   );
      // }
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
