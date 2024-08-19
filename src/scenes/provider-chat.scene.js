import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SCENES, STRINGS } from "../constants/index.js";
import { getUserId } from "@utils/index.js";

import {
  removeActiveProvider,
  removeAnyRelatedCurrentChats,
} from "@db/actions.js";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards.js";
import { appService } from "@utils/app.service.js";

export const providerChatScene = new Scenes.BaseScene(
  SCENES.PROVIDER_CHAT_SCENE,
);

providerChatScene.enter(async (ctx) => {
  await ctx.reply(
    STRINGS.WAITING_FOR_A_CONSUMER,
    generateProviderChatScreenkeyboard(appService.getIsInChat(getUserId(ctx))),
  );
});

providerChatScene.on(message("text"), async (ctx) => {
  const consumerId = appService.getPartner(getUserId(ctx));

  if (
    ![STRINGS.END_CHAT, STRINGS.END_CHAT_STOP_PROVIDING].includes(
      ctx.message.text,
    )
  ) {
    if (!consumerId) {
      await ctx.reply(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_CONSUMER);
    } else {
      await ctx.telegram.sendMessage(consumerId, ctx.message.text);
    }
  } else {
    if (consumerId) {
      await ctx.telegram.sendMessage(
        consumerId,
        STRINGS.PROVIDER_HAS_ENDED_CHAT,
      );
    }
    switch (ctx.message.text) {
      case STRINGS.END_CHAT: {
        await Promise.all([
          ctx.reply(STRINGS.LEAVING),
          removeAnyRelatedCurrentChats(getUserId(ctx)),
        ]);
        await ctx.reply(
          STRINGS.CONVERSATION_HAS_BEEN_ENDED,
          generateProviderChatScreenkeyboard(false),
        );

        return;
      }
      case STRINGS.END_CHAT_STOP_PROVIDING: {
        await Promise.all([
          ctx.reply(STRINGS.LEAVING),
          removeAnyRelatedCurrentChats(getUserId(ctx)),
          removeActiveProvider(getUserId(ctx)),
        ]);
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MAIN_SCENE);
      }
    }
  }
});
