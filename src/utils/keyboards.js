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
