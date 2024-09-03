import { SCENES, STRINGS } from "@constants/index";
import {
  updateUserPreferences,
  getCurrentUserTypeAndStatus,
  removeAnyRelatedCurrentChats,
  getDashboardUserId,
} from "@db/actions";
import { formatSystemMessage, getUserId, replyError } from "@utils/index";
import { encrypt } from "libs/crypto-js";
import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

export const mainScene = new Scenes.BaseScene(SCENES.MAIN_SCENE);

const getMainSceneProviderKeyboard = (isCurrentlyProviding) => {
  return Markup.keyboard([
    isCurrentlyProviding ? STRINGS.STOP_PROVIDING : STRINGS.START_PROVIDING,
    STRINGS.ACCOUNT_SETTINGS,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();
};

const getMainSceneConsumerKeyboard = () =>
  Markup.keyboard([
    STRINGS.CONNECT_TO_PROVIDER,
    STRINGS.VIEW_CONNECTS_LIST,
    STRINGS.SEND_COMPLAIN,
    STRINGS.REFRESH,
  ])
    .resize()
    .oneTime();

mainScene.enter(async (ctx) => {
  try {
    const { canProvide, isAvailable, nickname, isBusy } =
      await getCurrentUserTypeAndStatus(getUserId(ctx));

    if (isBusy) {
      await Promise.all([
        removeAnyRelatedCurrentChats(getUserId(ctx)),
        updateUserPreferences(getUserId(ctx), {
          is_busy: false,
        }),
      ]);
      await ctx.reply(
        formatSystemMessage(
          `${STRINGS.MAIN_MENU}\n${nickname}  : الاسم المستعار الذي يظهر للطرف الاخر`,
        ),
        canProvide
          ? getMainSceneProviderKeyboard(false)
          : getMainSceneConsumerKeyboard(),
      );
      return;
    }

    await ctx.reply(
      formatSystemMessage(
        `${STRINGS.MAIN_MENU}\n${nickname}  : الاسم المستعار الذي يظهر للطرف الاخر`,
      ),
      canProvide
        ? getMainSceneProviderKeyboard(isAvailable)
        : getMainSceneConsumerKeyboard(),
    );
    return;
  } catch (error) {
    return replyError(error, ctx);
  }
});

mainScene.on(message("text"), async (ctx) => {
  try {
    switch (ctx.message.text) {
      case STRINGS.CONNECT_TO_PROVIDER: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MATCHING_SCENE);
        return;
      }
      case STRINGS.CONNECT_TO_LAST_PROVIDER: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MATCHING_SCENE);
        return;
      }

      case STRINGS.START_PROVIDING: {
        await Promise.all([
          updateUserPreferences(getUserId(ctx), {
            is_providing: true,
            is_busy: false,
          }),
          ctx.reply(formatSystemMessage(STRINGS.LOADING)),
        ]);
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
        return;
      }

      case STRINGS.STOP_PROVIDING: {
        await Promise.all([
          updateUserPreferences(getUserId(ctx), {
            is_providing: false,
            is_busy: false,
          }),
          ctx.scene.leave(),
        ]);
        await ctx.scene.enter(SCENES.MAIN_SCENE);
        return;
      }

      case STRINGS.SEND_COMPLAIN: {
        await ctx.reply(
          formatSystemMessage(STRINGS.YOU_CAN_COMPLAIN_HERE),
          Markup.inlineKeyboard([
            Markup.button.url(
              STRINGS.COMPLAIN,
              "https://t.me/Salam_initiative_bot",
            ),
          ]),
        );
        return;
      }
      case STRINGS.VIEW_CONNECTS_LIST: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.CONNECTS_LIST);
        return;
      }

      case STRINGS.ACCOUNT_SETTINGS:
        {
          const { data } = await getDashboardUserId(getUserId(ctx));
          const dashboardUserId = data?.[0]?.id;
          const role = data?.[0]?.role;

          if (!dashboardUserId) {
            await ctx.reply(STRINGS.DASHBOARD_ACCOUNT_NOT_FOUND);
            return;
          }

          const token = encrypt(
            JSON.stringify({
              botUserId: getUserId(ctx),
              dashboardUserId,
              role,
            }),
          );
          const dashboardUrl = `${process.env.DASHBOARD_URL}/auth?token=${encodeURIComponent(token)}`;

          await ctx.reply(
            formatSystemMessage(STRINGS.ACCOUNT_SETTINGS_MESSAGE),
            Markup.inlineKeyboard([
              Markup.button.url(STRINGS.EDIT, dashboardUrl),
            ]),
          );
        }
        return;

      case STRINGS.REFRESH: {
        await ctx.scene.leave();
        await ctx.scene.enter(SCENES.MAIN_SCENE);
        return;
      }
    }
  } catch (error) {
    await replyError(error, ctx);
    return;
  }
});
