import { SCENES, STRINGS, USER_TYPE_ENUM } from "@constants/index";
import { appService } from "@utils/app.service";
import {
  formatSystemMessage,
  getUserId,
  replyError,
  replyWithClearKeyboard,
  setScoppedCommandsMenu,
  // replyWithClearKeyboard,
} from "@utils/index";
import apiService from "services/api.service";
import { Markup, Scenes } from "telegraf";

export const mainScene = new Scenes.BaseScene(SCENES.MAIN_SCENE);

// const getMainSceneProviderKeyboard = (isCurrentlyProviding) => {
//   return Markup.keyboard([
//     isCurrentlyProviding ? STRINGS.STOP_PROVIDING : STRINGS.START_PROVIDING,
//     STRINGS.ACCOUNT_SETTINGS,
//     STRINGS.REFRESH,
//   ])
//     .resize()
//     .oneTime();
// };

// const getMainSceneConsumerKeyboard = () =>
//   Markup.keyboard([
//     STRINGS.CONNECT_TO_PROVIDER,
//     STRINGS.CONNECT_TO_SPECIALIST,
//     STRINGS.VIEW_CONNECTS_LIST,
//     STRINGS.SEND_COMPLAIN,
//     STRINGS.REFRESH,
//   ])
//     .resize()
//     .oneTime();

const COMMANDS = {
  start_providing: "start_providing",
  stop_providing: "stop_providing",
  account_settings: "account_settings",
  refresh: "refresh",
  connect_to_provider: "connect_to_provider",
  connect_to_specialist: "connect_to_specialist",
  connections_list: "connections_list",
  report: "report",
  account_info: "account_info",
};

const PROVIDER_COMMANDS_MENU = [
  {
    command: "start_providing",
    description: STRINGS.START_PROVIDING,
  },
  // {
  //   command: "stop_providing",
  //   description: STRINGS.STOP_PROVIDING,
  // },
  {
    command: "account_info",
    description: STRINGS.ACCOUNT_INFO,
  },
  {
    command: "account_settings",
    description: STRINGS.ACCOUNT_SETTINGS,
  },
  {
    command: "refresh",
    description: STRINGS.REFRESH,
  },
];

const CONSUMER_COMMANDS_MENU = [
  {
    command: "connect_to_provider",
    description: STRINGS.CONNECT_TO_PROVIDER,
  },
  // {
  //   command: "connect_to_specialist",
  //   description: STRINGS.CONNECT_TO_SPECIALIST,
  // },
  {
    command: "connections_list",
    description: STRINGS.VIEW_CONNECTS_LIST,
  },
  {
    command: "report",
    description: STRINGS.SEND_COMPLAIN,
  },
  {
    command: "refresh",
    description: STRINGS.REFRESH,
  },
];

mainScene.enter(async (ctx) => {
  try {
    const { user_type, is_providing, is_busy, is_blocked } =
      (await apiService.getUserPreferences(getUserId(ctx))) || {};

    if (is_blocked) {
      await setScoppedCommandsMenu(ctx, getUserId(ctx), [
        {
          command: "refresh",
          description: STRINGS.REFRESH,
        },
      ]);
      await ctx.reply(formatSystemMessage(STRINGS.YOU_HAVE_BEEN_BLOCKED));
      return;
    }

    const canProvide = [
      USER_TYPE_ENUM.Specialist,
      USER_TYPE_ENUM.Provider,
    ].includes(user_type);

    if (canProvide) {
      await setScoppedCommandsMenu(ctx, getUserId(ctx), PROVIDER_COMMANDS_MENU);
    } else {
      await setScoppedCommandsMenu(ctx, getUserId(ctx), CONSUMER_COMMANDS_MENU);
    }

    if (is_busy) {
      await apiService.removeAllRelatedOnGoingChats(getUserId(ctx));

      await appService.removeRelatedConnections(getUserId(ctx));

      await apiService.updateUserActiveState({
        tg_id: getUserId(ctx),
        is_busy: false,
      });
    }

    // await ctx.reply(
    //   formatSystemMessage(`${STRINGS.MAIN_MENU}\nالاسم المستعار : ${nickname}`),
    //   canProvide
    //     ? getMainSceneProviderKeyboard(is_providing)
    //     : getMainSceneConsumerKeyboard(),
    // );

    if (is_providing) {
      await ctx.scene.leave();
      await ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
    }
    return;
  } catch (error) {
    return replyError(error, ctx);
  }
});

mainScene.command(COMMANDS.connect_to_provider, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MATCHING_SCENE, {
    connectToType: USER_TYPE_ENUM.Provider,
  });
});

mainScene.command(COMMANDS.connect_to_specialist, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MATCHING_SCENE, {
    connectToType: USER_TYPE_ENUM.Specialist,
  });
  return;
});

mainScene.command(COMMANDS.report, async (ctx) => {
  await ctx.reply(
    formatSystemMessage(STRINGS.YOU_CAN_COMPLAIN_HERE),
    Markup.inlineKeyboard([
      Markup.button.url(STRINGS.COMPLAIN, "https://t.me/Salam_initiative_bot"),
    ]),
  );
  return;
});

mainScene.command(COMMANDS.connections_list, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.CONNECTS_LIST);
  return;
});

mainScene.command(COMMANDS.start_providing, async (ctx) => {
  await ctx.reply(formatSystemMessage(STRINGS.LOADING));

  await apiService.updateUserActiveState({
    tg_id: getUserId(ctx),
    is_providing: true,
    is_busy: false,
  });

  await ctx.scene.leave();

  await ctx.scene.enter(SCENES.PROVIDER_CHAT_SCENE);
  return;
});

mainScene.command(COMMANDS.stop_providing, async (ctx) => {
  await apiService.updateUserActiveState({
    tg_id: getUserId(ctx),
    is_providing: false,
    is_busy: false,
  });

  await ctx.scene.leave();

  await ctx.scene.enter(SCENES.MAIN_SCENE);
  return;
});

mainScene.command(COMMANDS.account_settings, async (ctx) => {
  try {
    const token = await apiService.generateDashboardAuthToken(getUserId(ctx));

    if (!token) {
      await ctx.reply(formatSystemMessage(STRINGS.DASHBOARD_ACCOUNT_NOT_FOUND));
    }

    const dashboardUrl = `http://${process.env.DASHBOARD_HOST}/auth?token=${encodeURIComponent(token)}`;

    await ctx.reply(
      formatSystemMessage(STRINGS.ACCOUNT_SETTINGS_MESSAGE),
      Markup.inlineKeyboard([Markup.button.url(STRINGS.EDIT, dashboardUrl)]),
    );
    // await ctx.reply(formatSystemMessage(dashboardUrl));
  } catch (error) {
    await replyError(error, ctx);
  }
  return;
});

mainScene.command(COMMANDS.account_info, async (ctx) => {
  try {
    const info = await apiService.GetUserAccountInfo(getUserId(ctx));
    await ctx.reply(
      formatSystemMessage(`تاريخ الانضمام : ${Intl.DateTimeFormat("ar-SY").format(new Date(info.created_at))}
الاسم المستعار : ${info.nickname}
الأولوية في تقديم الرعاية : ${info.will_to_provide}
عدد الأشخاص المختلفين الذين تم التواصل معهم : ${info.connects_count}
التقييم : ${!isNaN(Number(info.rating)) ? Number(info.rating) : "لا يوجد تقييم بعد"}
`),
    );
  } catch (error) {
    console.error(error);
  }
  return;
});

mainScene.command(COMMANDS.refresh, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(SCENES.MAIN_SCENE);
  await replyWithClearKeyboard(ctx, formatSystemMessage(STRINGS.REFRESH_DONE));
  return;
});

// mainScene.on(message("text"), async (ctx) => {
//   try {
//     switch (ctx.message.text) {
//       case STRINGS.CONNECT_TO_PROVIDER: {
//         return;
//       }
//
//       case STRINGS.CONNECT_TO_SPECIALIST: {
//         return;
//       }
//
//       // case STRINGS.CONNECT_TO_LAST_PROVIDER: {
//       //   await ctx.scene.leave();
//       //   await ctx.scene.enter(SCENES.MATCHING_SCENE);
//       //   return;
//       // }
//
//       case STRINGS.START_PROVIDING: {
//         return;
//       }
//
//       case STRINGS.STOP_PROVIDING: {
//         return;
//       }
//
//       case STRINGS.SEND_COMPLAIN: {
//         return;
//       }
//       case STRINGS.VIEW_CONNECTS_LIST: {
//         return;
//       }
//
//       case STRINGS.ACCOUNT_SETTINGS: {
//         // await ctx.reply(formatSystemMessage("تحت_التطوير"));
//         // return;
//         return;
//       }
//       // return;
//
//       case STRINGS.REFRESH: {
//         return;
//       }
//     }
//   } catch (error) {
//     await replyError(error, ctx);
//     return;
//   }
// });
