import { SCENES, STRINGS } from "@constants/index";
import {
  getUserFirstName,
  getUserId,
  getUserLastName,
  getUserName,
  replyError,
} from "@utils/index";
import apiService from "services/api.service";
import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";

const ENTER_SCREEN_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback(STRINGS.CONTINUE, STRINGS.CONTINUE),
]);

export const enterScene = new Scenes.BaseScene(SCENES.ENTER_SCENE);

enterScene.enter(async (ctx) => {
  try {
    const isRegistered = await apiService.getIsRegisteredUser(getUserId(ctx));
    if (isRegistered) {
      await apiService.syncUserNames({
        tg_id: getUserId(ctx),
        username: getUserName(ctx),
        first_name: getUserFirstName(ctx),
        last_name: getUserLastName(ctx),
      });
      return ctx.scene.enter(SCENES.MAIN_SCENE);
    }
    await ctx.reply(STRINGS.WELCOME_MESSAGE, ENTER_SCREEN_KEYBOARD);
    return;
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});

enterScene.on(callbackQuery("data"), async (ctx) => {
  try {
    if (ctx.callbackQuery.data === STRINGS.CONTINUE) {
      await apiService.registerUser({
        tg_id: getUserId(ctx),
        username: getUserName(ctx),
        first_name: getUserFirstName(ctx),
        last_name: getUserLastName(ctx),
      });
      await ctx.answerCbQuery();
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.MAIN_SCENE);
      return;
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
