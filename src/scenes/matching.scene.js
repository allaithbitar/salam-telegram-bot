import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index.js";
import { getUserId, replyWithClearKeyboard } from "@utils/index.js";
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
  await ctx.reply(STRINGS.LOOKING_FOR_A_PROVIDER);
  const randomProviderId = await getRandomAvailableProviderTgId();
  if (!randomProviderId) {
    await ctx.reply(STRINGS.NO_PROVIDERS_AVAIABLE);
    await ctx.scene.leave();
    await ctx.scene.enter(SCENES.MAIN_SCENE);
  } else {
    const res = await createChat({
      providerId: randomProviderId,
      consumerId: getUserId(ctx),
    });
    if (res.error) {
      await ctx.reply(STRINGS.ALREADY_IN_CHAT, LEAVE_UNHANDLED_CHAT_KEYBOARD);
    } else {
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.CHAT_SCENE, {
        initialProviderId: randomProviderId,
      });
    }
  }
});

matchingScene.on(callbackQuery("data"), async (ctx) => {
  await replyWithClearKeyboard(ctx, STRINGS.LEAVING);
  await removeAnyRelatedCurrentChats(getUserId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MAIN_SCENE);
});
