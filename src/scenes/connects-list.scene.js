import { SCENES, STRINGS } from "@constants/index";
import { getConsumerConnectsList } from "@db/actions";
import { getChatId, getMessageId, getUserId, replyError } from "@utils/index";
import { Markup, Scenes } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";
import { button } from "telegraf/markup";

export const connectsListScene = new Scenes.BaseScene(SCENES.CONNECTS_LIST);

connectsListScene.enter(async (ctx) => {
  try {
    await ctx.reply(
      STRINGS.LOADING,
      Markup.keyboard([[STRINGS.GO_BACK_TO_MAIN_MENU]]).resize(),
    );
    const { data: connectsList } = await getConsumerConnectsList(
      getUserId(ctx),
    );
    console.log(connectsList);
    await ctx.reply(
      STRINGS.CONNECTS_LIST,
      Markup.inlineKeyboard(
        connectsList.map((c) => Markup.button.callback(c.nickname, c.user)),
      ),
    );
  } catch (error) {
    replyError(error, ctx);
  }
});

connectsListScene.on(message("text"), async (ctx) => {
  try {
    await ctx.scene.leave();
    await ctx.scene.enter(SCENES.MAIN_SCENE);
  } catch (error) {
    replyError(error, ctx);
  }
});

connectsListScene.on(callbackQuery("data"), async (ctx) => {
  await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));
  await ctx.answerCbQuery();
  const providerId = ctx.callbackQuery.data;
  await ctx.scene.leave();
  return ctx.scene.enter(SCENES.MATCHING_SCENE, {
    specifiedProviderId: providerId,
  });
});
