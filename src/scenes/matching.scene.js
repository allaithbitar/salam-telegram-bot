import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";
import {
  createChat,
  getCurrentUserTypeAndStatus,
  getLastChatTgId,
  getRandomAvailableProviderTgId,
  removeAnyRelatedCurrentChats,
  updateUserPreferences,
} from "@db/actions.js";
import { appService } from "@utils/app.service";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards";
import { CHAT_SCREEN_KEYBOARD } from "./chat.scene";

export const matchingScene = new Scenes.BaseScene(SCENES.MATCHING_SCENE);

export const LEAVE_UNHANDLED_CHAT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback(STRINGS.LEAVE_NO_BRACKETS, STRINGS.LEAVE),
]);

const getMessageSentToConnectedProvider = (
  isConnectingToLastProvider,
  isConnectingToASpecifiedProvider,
) => {
  if (isConnectingToLastProvider) {
    return STRINGS.PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_CONSUMER;
  }
  if (isConnectingToASpecifiedProvider) {
    return STRINGS.PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_CONSUMER_THAT_HAS_CHOSEN_YOU;
  }
  return STRINGS.YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER;
};

const getMessageSentToConsumerSuccessConnect = (
  isConnectingToLastProvider,
  isConnectingToASpecifiedProvider,
) => {
  console.log({ isConnectingToLastProvider, isConnectingToASpecifiedProvider });
  if (isConnectingToLastProvider) {
    return STRINGS.CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_PROVIDER;
  }
  if (isConnectingToASpecifiedProvider) {
    return STRINGS.CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_SPECIFIED_PROVIDER;
  }
  return STRINGS.YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER;
};

const handleCreateChatAndPair = async (
  ctx,
  providerId,
  isConnectingToLastProvider,
  isConnectingToASpecifiedProvider,
) => {
  await updateUserPreferences(providerId, { is_busy: true });

  const { error: errorInCreatingChat } = await createChat({
    providerId: providerId,
    consumerId: getUserId(ctx),
  });

  // conflict error which means a user is already in a chat
  if (errorInCreatingChat) {
    await updateUserPreferences(providerId, { is_busy: false });
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
        getMessageSentToConnectedProvider(
          isConnectingToLastProvider,
          isConnectingToASpecifiedProvider,
        ),
      ),
      generateProviderChatScreenkeyboard(true),
    ),
    ctx.reply(
      formatSystemMessage(
        getMessageSentToConsumerSuccessConnect(
          isConnectingToLastProvider,
          isConnectingToASpecifiedProvider,
        ),
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

    const specifiedProviderId = ctx.scene.state.specifiedProviderId;

    if (shouldTryToConnectToTheLastProvider || specifiedProviderId) {
      await ctx.reply(
        specifiedProviderId
          ? STRINGS.TRYING_TO_CONNECT_TO_SPECIFIED_PROVIDER
          : STRINGS.TRYING_TO_CONNECT_TO_LAST_PROVIDER,
      );

      let targetProviderId = specifiedProviderId;
      console.log({ shouldTryToConnectToTheLastProvider, specifiedProviderId });
      if (shouldTryToConnectToTheLastProvider) {
        const { lastChatTgId } = await getLastChatTgId(getUserId(ctx));
        targetProviderId = lastChatTgId;
      }

      const {
        isAvailable: isLastProviderAvailable,
        isBusy: isLastProviderBusy,
      } = await getCurrentUserTypeAndStatus(targetProviderId);

      if (isLastProviderAvailable && !isLastProviderBusy) {
        return handleCreateChatAndPair(
          ctx,
          targetProviderId,
          !!shouldTryToConnectToTheLastProvider,
          !!specifiedProviderId,
        );
      }

      await ctx.reply(
        formatSystemMessage(
          specifiedProviderId
            ? STRINGS.SPECIFIED_PROVIDER_NOT_CURRENTLY_AVAIABLE
            : STRINGS.LAST_PROVIDER_NOT_CURRENTLY_AVAILABLE,
        ),
      );
      await ctx.scene.leave();
      return ctx.scene.enter(
        specifiedProviderId ? SCENES.CONNECTS_LIST : SCENES.MAIN_SCENE,
      );
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
