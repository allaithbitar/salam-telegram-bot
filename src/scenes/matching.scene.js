import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";
import {
  createChat,
  getCurrentUserTypeAndStatus,
  getRandomAvailableProviderTgId,
  removeAnyRelatedCurrentChats,
} from "@db/actions.js";
import { appService } from "@utils/app.service";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards";
import { CHAT_SCREEN_KEYBOARD } from "./chat.scene";

export const matchingScene = new Scenes.BaseScene(SCENES.MATCHING_SCENE);

export const LEAVE_UNHANDLED_CHAT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback(STRINGS.LEAVE_NO_BRACKETS, STRINGS.LEAVE),
]);

const handleCreateChatAndPair = async (
  ctx,
  providerId,
  isConnectingToLastProvider,
) => {
  const { error: errorInCreatingChat } = await createChat({
    providerId: providerId,
    consumerId: getUserId(ctx),
  });

  // conflict error which means a user is already in a chat
  if (errorInCreatingChat) {
    return ctx.reply(
      formatSystemMessage(STRINGS.ALREADY_IN_CHAT),
      LEAVE_UNHANDLED_CHAT_KEYBOARD,
    );
  }
  const _providerId = appService.getPartner(getUserId(ctx)) || providerId;

  await Promise.all([
    ctx.telegram.sendMessage(
      _providerId,
      formatSystemMessage(
        isConnectingToLastProvider
          ? STRINGS.PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_CONSUMER
          : STRINGS.YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER,
      ),
      generateProviderChatScreenkeyboard(true),
    ),
    await ctx.reply(
      formatSystemMessage(
        isConnectingToLastProvider
          ? STRINGS.CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_PROVIDER
          : STRINGS.YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER,
      ),
      CHAT_SCREEN_KEYBOARD,
    ),
  ]);

  await ctx.scene.leave();
  return await ctx.scene.enter(SCENES.CHAT_SCENE, {
    initialProviderId: _providerId,
  });
};

matchingScene.enter(async (ctx) => {
  try {
    const shouldTryToConnectToTheLastProvider =
      ctx.scene.state?.tryConnectToLastProvider;

    if (shouldTryToConnectToTheLastProvider) {
      await ctx.reply(STRINGS.TRYING_TO_CONNECT_TO_LAST_PROVIDER);

      const { lastChatTgId: lastConsumerChatTgId } =
        await getCurrentUserTypeAndStatus(getUserId(ctx));

      const { isAvailable: isLastProviderAvailable } =
        await getCurrentUserTypeAndStatus(lastConsumerChatTgId);

      if (isLastProviderAvailable) {
        return handleCreateChatAndPair(ctx, lastConsumerChatTgId, true);
      }

      await ctx.reply(
        formatSystemMessage(STRINGS.LAST_PROVIDER_NOT_CURRENTLY_AVAILABLE),
      );
      await ctx.scene.leave();
      return ctx.scene.enter(SCENES.MAIN_SCENE);
    }

    await ctx.reply(formatSystemMessage(STRINGS.LOOKING_FOR_A_PROVIDER));

    const randomProviderId = await getRandomAvailableProviderTgId();

    if (!randomProviderId) {
      await ctx.reply(formatSystemMessage(STRINGS.NO_PROVIDERS_AVAIABLE));
      await ctx.scene.leave();
      return ctx.scene.enter(SCENES.MAIN_SCENE);
    }
    return handleCreateChatAndPair(ctx, randomProviderId);
  } catch (error) {
    return replyError(error);
  }
});

matchingScene.on(callbackQuery("data"), async (ctx) => {
  try {
    Promise.all([
      ctx.reply(formatSystemMessage(STRINGS.LEAVING)),
      removeAnyRelatedCurrentChats(getUserId(ctx)),
      ctx.scene.leave(),
    ]);
    return ctx.scene.enter(SCENES.MAIN_SCENE);
  } catch (error) {
    return replyError(error);
  }
});
