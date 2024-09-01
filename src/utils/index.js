import { STRINGS } from "@constants/index";
import { fmt } from "telegraf/format";

export const getUserId = (ctx) =>
  ctx?.update?.message?.from?.id || ctx?.update?.callback_query?.from?.id || 0;

export const getUserFirstName = (ctx) =>
  ctx?.update?.message?.from?.first_name ||
  ctx?.update?.message?.chat?.first_name ||
  ctx?.update?.callback_query?.from?.first_name ||
  ctx?.update?.callback_query?.chat?.first_name ||
  "";

export const getUserLastName = (ctx) =>
  ctx?.update?.message?.from?.last_name ||
  ctx?.update?.message?.chat?.last_name ||
  ctx?.update?.callback_query?.from?.last_name ||
  ctx?.update?.callback_query?.chat?.last_name ||
  "";

export const getUserName = (ctx) =>
  ctx?.update?.message?.from?.username ||
  ctx?.update?.message?.chat?.username ||
  ctx?.update?.callback_query?.from?.username ||
  ctx?.update?.callback_query?.chat?.username ||
  "";

export const getMessageFromId = (ctx) => ctx?.message?.from?.id;

export const getMessageText = (ctx) =>
  (
    ctx?.message?.text ??
    ctx?.update?.message?.text ??
    ctx?.update?.callback_query?.message?.text ??
    ""
  ).trim();

export const getMessageId = (ctx) =>
  ctx?.message?.id ??
  ctx?.message?.message_id ??
  ctx?.update?.message?.message_id ??
  ctx?.update?.callback_query?.message?.message_id ??
  0;

export const getChatId = (ctx) => ctx.chat?.id ?? 0;

export const replyWithClearKeyboard = (ctx, message) => {
  return ctx.reply(message, {
    reply_markup: { remove_keyboard: true },
  });
};

export const addRemoveKeyboardToMarkup = (replayMarkup) => ({
  ...replayMarkup,
  remove_keyboard: true,
});

export const replyError = (error, ctx) => {
  console.log(error);
  let errorMessage;

  if (typeof error === "string") {
    errorMessage = error;
  }

  errorMessage =
    errorMessage ??
    error?.error?.message ??
    error.message ??
    STRINGS.SOMETHING_WENT_WRONG;
  return ctx.reply(formatSystemMessage(`ERROR: ${errorMessage}`));
};

export const getDbData = (dbRes) => dbRes.data;

export const removeInlineKeyboardMessageByMessegeId = (ctx, messageId) =>
  ctx.telegram.editMessageReplyMarkup(
    getChatId(ctx),
    messageId,
    undefined,
    undefined,
  );

const payloadMessageKey = "###_SALAM_BOT_###";

export const createMessageWithPayload = (messageText, type, payload) => {
  return `${payloadMessageKey}[#]${messageText}[#]${type}[#]${payload}`;
};

export const isPayloadMessage = (messageText) => {
  return messageText.startsWith(payloadMessageKey);
};

export const extractMessagePayload = (messageText) => {
  const [, message, type, payload] = messageText.split("[#]");
  return { message, type, payload };
};

export const MESSAGE_PAYLOAD_TYPES = {
  CONSUMER_CONNECTED_TO_PROVIDER: "CONSUMER_CONNECTED_TO_PROVIDER",
};

export const formatSystemMessage = (messageText, from = "system", nickname) => {
  const fromMap = {
    system: "👨🏻‍💻",
    consumer: "الشخص المجهول",
    provider: "المتطوع",
  };
  return fmt`${nickname ? "" : fromMap[from]}${nickname ? `[ ${nickname} ] :\n` : ""}${messageText}`;
};

export class BotError extends Error {
  constructor(cause, overrideMessage) {
    super(overrideMessage ?? "SystemError", { cause });
  }
}

const getRandomNumberInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateNickname = () => {
  let name = "";
  for (let i = 0; i < 10; i++) {
    name += String.fromCharCode(getRandomNumberInRange(65, 90));
  }
  return name;
};
