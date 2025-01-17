import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";

import { appService } from "@utils/app.service";
import { generateProviderChatScreenkeyboard } from "@utils/keyboards";
import { CHAT_SCREEN_KEYBOARD } from "./chat.scene";
import apiService from "services/api.service";

export const matchingScene = new Scenes.BaseScene(SCENES.MATCHING_SCENE);

export const LEAVE_UNHANDLED_CHAT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback(STRINGS.LEAVE_NO_BRACKETS, STRINGS.LEAVE),
]);

const getMessageSentToConnectedProvider = (
  isConnectingToASpecifiedProvider,
  consumerNickname,
) => {
  if (isConnectingToASpecifiedProvider) {
    return STRINGS.PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_CONSUMER_THAT_HAS_CHOSEN_YOU(
      consumerNickname,
    );
  }
  return STRINGS.YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER;
};

const getMessageSentToConsumerSuccessConnect = (
  isConnectingToASpecifiedProvider,
  providerNickname,
) => {
  if (isConnectingToASpecifiedProvider) {
    return `${STRINGS.CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_SPECIFIED_PROVIDER} ${providerNickname}`;
  }
  return STRINGS.YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER;
};

const handleCreateChatAndPair = async (
  ctx,
  providerId,
  isConnectingToASpecifiedProvider,
) => {
  await apiService.updateUserActiveState({ tg_id: providerId, is_busy: true });

  const { error: errorInCreatingChat } = await apiService.createChat({
    provider_id: providerId,
    consumer_id: getUserId(ctx),
  });
  // conflict error which means a user is already in a chat
  if (errorInCreatingChat) {
    await apiService.updateUserActiveState({
      is_busy: false,
      tg_id: providerId,
    });
    await ctx.reply(
      formatSystemMessage(STRINGS.ALREADY_IN_CHAT),
      LEAVE_UNHANDLED_CHAT_KEYBOARD,
    );
    return;
  }

  // const provider = await appService.getPartnerAsync(getUserId(ctx));
  // const consumer = await appService.getMe(getUserId(ctx));
  const consumer = await apiService.getUserPreferences(getUserId(ctx));

  const provider = await apiService.getUserPreferences(providerId);

  await appService.registerUserInMemoryDb(consumer.user, consumer.nickname);
  await appService.registerUserInMemoryDb(provider.user, provider.nickname);

  await appService.pairUsers(consumer.user, provider.user);
  await ctx.telegram.sendMessage(
    provider.user,
    formatSystemMessage(
      getMessageSentToConnectedProvider(
        isConnectingToASpecifiedProvider,
        consumer.nickname,
      ),
    ),
    generateProviderChatScreenkeyboard(true),
  );

  await ctx.reply(
    formatSystemMessage(
      getMessageSentToConsumerSuccessConnect(
        isConnectingToASpecifiedProvider,
        provider.nickname,
      ),
    ),
    CHAT_SCREEN_KEYBOARD,
  ),
    await ctx.scene.leave();
  await ctx.scene.enter(SCENES.CHAT_SCENE);
  return;
};

matchingScene.enter(async (ctx) => {
  try {
    const specifiedProviderId = ctx.scene.state.specifiedProviderId;
    if (specifiedProviderId) {
      await ctx.reply(
        formatSystemMessage(STRINGS.TRYING_TO_CONNECT_TO_SPECIFIED_PROVIDER),
      );

      const specifiedProvider =
        await apiService.getProviderByTgId(specifiedProviderId);

      if (
        specifiedProvider &&
        !specifiedProvider.is_busy &&
        specifiedProvider.is_providing
      ) {
        await handleCreateChatAndPair(
          ctx,
          specifiedProvider.user,
          !!specifiedProvider,
        );
        return;
      }

      await ctx.reply(
        formatSystemMessage(STRINGS.SPECIFIED_PROVIDER_NOT_CURRENTLY_AVAIABLE),
      );

      await ctx.scene.leave();
      await ctx.scene.enter(
        specifiedProviderId ? SCENES.CONNECTS_LIST : SCENES.MAIN_SCENE,
      );
      return;
    }

    await ctx.reply(formatSystemMessage(STRINGS.LOOKING_FOR_A_PROVIDER));

    const randomProviderId = await appService.getRandomActiveProviderTgId();

    if (!randomProviderId) {
      await ctx.reply(formatSystemMessage(STRINGS.NO_PROVIDERS_AVAIABLE));
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.MAIN_SCENE);
      return;
    }
    await handleCreateChatAndPair(ctx, randomProviderId);
    return;
  } catch (error) {
    await replyError(error);
    return;
  }
});

matchingScene.on(callbackQuery("data"), async (ctx) => {
  try {
    await ctx.reply(formatSystemMessage(STRINGS.LEAVING));
    await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));
    await ctx.scene.leave();
    await ctx.scene.enter(SCENES.MAIN_SCENE);
    return;
  } catch (error) {
    await replyError(error);
    return;
  }
});
