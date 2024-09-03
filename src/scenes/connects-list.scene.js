import { SCENES, STRINGS } from "@constants/index";
import { getConsumerConnectsList } from "@db/actions";
import {
  formatSystemMessage,
  getChatId,
  getMessageId,
  getUserId,
  replyError,
} from "@utils/index";
import { Markup, Scenes } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";

export const connectsListScene = new Scenes.BaseScene(SCENES.CONNECTS_LIST);

connectsListScene.enter(async (ctx) => {
  try {
    await ctx.reply(
      formatSystemMessage(STRINGS.LOADING),
      Markup.keyboard([[STRINGS.GO_BACK_TO_MAIN_MENU]]).resize(),
    );
    const { data: connectsList } = await getConsumerConnectsList(
      getUserId(ctx),
    );
    if (!connectsList.length) {
      await ctx.reply(formatSystemMessage(STRINGS.NO_CONNECTS_LIST));
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.MAIN_SCENE);
      return;
    } else {
      await ctx.reply(
        formatSystemMessage(STRINGS.CONNECTS_LIST),
        Markup.inlineKeyboard(
          connectsList.map((c) => Markup.button.callback(c.nickname, c.user)),
        ),
      );
      return;
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});

connectsListScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === STRINGS.GO_BACK_TO_MAIN_MENU) {
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.MAIN_SCENE);
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});

connectsListScene.on(callbackQuery("data"), async (ctx) => {
  const providerId = ctx.callbackQuery.data;
  await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MATCHING_SCENE, {
    specifiedProviderId: providerId,
  });
  return;
});
