import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index.js";
import { formatSystemMessage, getUserId, replyError } from "@utils/index.js";
import {
  createChat,
  getRandomAvailableProviderTgId,
  removeAnyRelatedCurrentChats,
} from "@db/actions.js";

export const matchingScene = new Scenes.BaseScene(SCENES.MATCHING_SCENE);

export const LEAVE_UNHANDLED_CHAT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback(STRINGS.LEAVE_NO_BRACKETS, STRINGS.LEAVE),
]);
matchingScene.enter(async (ctx) => {
  try {
    await ctx.reply(formatSystemMessage(STRINGS.LOOKING_FOR_A_PROVIDER));

    const randomProviderId = await getRandomAvailableProviderTgId();

    if (!randomProviderId) {
      await ctx.reply(formatSystemMessage(STRINGS.NO_PROVIDERS_AVAIABLE));
      await ctx.scene.leave();
      return ctx.scene.enter(SCENES.MAIN_SCENE);
    }

    const { error: errorInCreatingChat } = await createChat({
      providerId: randomProviderId,
      consumerId: getUserId(ctx),
    });

    // conflict error which means a user is already in a chat
    if (errorInCreatingChat) {
      return ctx.reply(
        formatSystemMessage(STRINGS.ALREADY_IN_CHAT),
        LEAVE_UNHANDLED_CHAT_KEYBOARD,
      );
    }

    await ctx.scene.leave();
    return await ctx.scene.enter(SCENES.CHAT_SCENE, {
      initialProviderId: randomProviderId,
    });
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
