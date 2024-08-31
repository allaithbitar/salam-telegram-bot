import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SCENES, STRINGS } from "../constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";

import {
  updateUserPreferences,
  removeAnyRelatedCurrentChats,
  updateConnectsHistory,
} from "@db/actions.js";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards.js";
import { appService } from "@utils/app.service.js";

export const providerChatScene = new Scenes.BaseScene(
  SCENES.PROVIDER_CHAT_SCENE,
);

providerChatScene.enter(async (ctx) => {
  try {
    await ctx.reply(
      formatSystemMessage(STRINGS.WAITING_FOR_A_CONSUMER),
      generateProviderChatScreenkeyboard(
        appService.getIsInChat(getUserId(ctx)),
      ),
    );
  } catch (error) {
    return replyError(error, ctx);
  }
});

providerChatScene.on(message("text"), async (ctx) => {
  try {
    const consumerId = appService.getPartner(getUserId(ctx));

    if (
      ![
        STRINGS.END_CHAT,
        STRINGS.END_CHAT_STOP_PROVIDING,
        STRINGS.STOP_PROVIDING,
        STRINGS.REFRESH,
      ].includes(ctx.message.text)
    ) {
      if (!consumerId)
        return ctx.reply(
          formatSystemMessage(STRINGS.YOU_ARE_NOT_CONNECTED_WTIH_ANY_CONSUMER),
        );

      return ctx.telegram.sendMessage(
        consumerId,
        formatSystemMessage(ctx.message.text, "provider"),
      );
    }

    switch (ctx.message.text) {
      case STRINGS.END_CHAT: {
        if (consumerId) {
          await updateConnectsHistory(consumerId, getUserId(ctx));
        }

        await Promise.all([
          ctx.reply(formatSystemMessage(STRINGS.LEAVING)),
          removeAnyRelatedCurrentChats(getUserId(ctx)),
          updateUserPreferences(getUserId(ctx), {
            is_busy: false,
          }),
        ]);

        return Promise.all([
          ctx.reply(
            formatSystemMessage(STRINGS.CONVERSATION_HAS_BEEN_ENDED),
            generateProviderChatScreenkeyboard(false),
          ),
          ...(consumerId
            ? [
                ctx.telegram.sendMessage(
                  consumerId,
                  formatSystemMessage(STRINGS.PROVIDER_HAS_ENDED_CHAT),
                ),
              ]
            : []),
        ]);
      }

      case STRINGS.STOP_PROVIDING: {
        await Promise.all([
          updateUserPreferences(getUserId(ctx), {
            is_providing: false,
          }),
          ctx.scene.leave(),
        ]);
        return ctx.scene.enter(SCENES.MAIN_SCENE);
      }

      case STRINGS.END_CHAT_STOP_PROVIDING: {
        if (consumerId) {
          await updateConnectsHistory(consumerId, getUserId(ctx));
        }

        await ctx.reply(formatSystemMessage(STRINGS.LEAVING)),
          await Promise.all([
            removeAnyRelatedCurrentChats(getUserId(ctx)),
            updateUserPreferences(getUserId(ctx), {
              is_providing: false,
              is_busy: false,
            }),
          ]);

        if (consumerId) {
          await ctx.telegram.sendMessage(
            consumerId,
            formatSystemMessage(STRINGS.PROVIDER_HAS_ENDED_CHAT),
          );
        }

        await ctx.scene.leave();
        return ctx.scene.enter(SCENES.MAIN_SCENE);
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
    return replyError(error, ctx);
  }
});
