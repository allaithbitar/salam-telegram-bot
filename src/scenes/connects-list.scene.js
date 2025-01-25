import { SCENES, STRINGS } from "@constants/index";
import {
  formatSystemMessage,
  getChatId,
  getMessageId,
  getUserId,
  replyError,
} from "@utils/index";
import apiService from "services/api.service";
import { Markup, Scenes } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";

export const connectsListScene = new Scenes.BaseScene(SCENES.CONNECTS_LIST);

connectsListScene.enter(async (ctx) => {
  try {
    await ctx.reply(
      formatSystemMessage(STRINGS.LOADING),
      Markup.keyboard([[STRINGS.GO_BACK_TO_MAIN_MENU]]).resize(),
    );
    const connectsList = await apiService.getConsumerConnectsList(
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
          connectsList.map((c) =>
            Markup.button.callback(
              c.nickname,
              JSON.stringify({
                tg_id: c.tg_id,
                user_type: c.user_type,
              }),
            ),
          ),
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
  const { tg_id: providerId, user_type } = JSON.parse(ctx.callbackQuery.data);
  await ctx.telegram.deleteMessage(getChatId(ctx), getMessageId(ctx));
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MATCHING_SCENE, {
    specifiedProviderId: providerId,
    connectToType: user_type,
  });
  return;
});
