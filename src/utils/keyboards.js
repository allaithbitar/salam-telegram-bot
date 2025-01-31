import { STRINGS } from "@constants/index";
import { Markup } from "telegraf";

export const generateProviderChatScreenkeyboard = (allowEndingChat) =>
  Markup.keyboard(
    [
      ...(allowEndingChat ? [STRINGS.END_CHAT] : []),
      allowEndingChat
        ? STRINGS.END_CHAT_STOP_PROVIDING
        : STRINGS.STOP_PROVIDING,
      // STRINGS.REFRESH,
    ],
    {
      columns: 1,
    },
  )
    .resize()
    .oneTime();

export const PROVIDER_CHAT_SCENE_COMMANDS = {
  end_chat: "end_chat",
  end_chat_stop_providing: "end_chat_stop_providing",
  stop_providing: "stop_providing",
};

export const GenerateProviderChatSceneCommandsMenu = (isInChat) => {
  if (isInChat) {
    return [
      {
        command: PROVIDER_CHAT_SCENE_COMMANDS.end_chat,
        description: STRINGS.END_CHAT,
      },
      {
        command: PROVIDER_CHAT_SCENE_COMMANDS.end_chat_stop_providing,
        description: STRINGS.END_CHAT_STOP_PROVIDING,
      },
    ];
  }
  return [
    {
      command: PROVIDER_CHAT_SCENE_COMMANDS.stop_providing,
      description: STRINGS.STOP_PROVIDING,
    },
  ];
};
