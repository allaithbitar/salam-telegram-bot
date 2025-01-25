import { Scenes, Markup } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SCENES, STRINGS } from "@constants/index";
import {
  formatSystemMessage,
  getChatId,
  getMessageId,
  replyError,
} from "@utils/index";
import apiService from "services/api.service";

export const ratingScene = new Scenes.BaseScene(SCENES.RATING_SCENE);

ratingScene.enter(async (ctx) => {
  await ctx.reply(
    formatSystemMessage(STRINGS.WOULD_YOU_LIKE_TO_RATE),
    Markup.inlineKeyboard([
      [
        Markup.button.callback(1, 1),
        Markup.button.callback(2, 2),
        Markup.button.callback(3, 3),
        Markup.button.callback(4, 4),
        Markup.button.callback(5, 5),
      ],
      [Markup.button.callback(STRINGS.NOT_THIS_TIME, STRINGS.NOT_THIS_TIME)],
    ]),
  );
});

ratingScene.on(callbackQuery("data"), async (ctx) => {
  try {
    const providerId = ctx.scene.state.providerId;
    const rate = ctx.callbackQuery.data;

    if (rate === STRINGS.NOT_THIS_TIME) {
      await ctx.answerCbQuery();

      await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));

      await ctx.scene.leave();

      await ctx.scene.enter(SCENES.MAIN_SCENE);

      return;
    }

    await apiService.addRating(providerId, rate);

    await ctx.answerCbQuery();

    await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));

    await await ctx.scene.leave();

    await ctx.scene.enter(SCENES.MAIN_SCENE);

    return;
  } catch (error) {
    await ctx.answerCbQuery();

    await replyError(error, ctx);

    return;
  }

  // await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));
  // await ctx.scene.leave();
  // await ctx.scene.enter(SCENES.MATCHING_SCENE, {
  //   specifiedProviderId: providerId,
  //   connectToType: user_type,
  // });
});
