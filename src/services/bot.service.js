import { SCENES, STRINGS } from "@constants/index";
import { chatScene } from "@scenes/chat.scene";
import { connectsListScene } from "@scenes/connects-list.scene";
import { enterScene } from "@scenes/enter.scene";
import { mainScene } from "@scenes/main.scene";
import { matchingScene } from "@scenes/matching.scene";
import { providerChatScene } from "@scenes/provider-chat.scene";
import { ratingScene } from "@scenes/rating.scene";
import { Postgres } from "@telegraf/session/pg";
import { formatSystemMessage, getMessageId, replyError } from "@utils/index";
import { Scenes, session, Telegraf } from "telegraf";
import { anyOf, message } from "telegraf/filters";

const TOKEN = process.env.BOT_TOKEN;

class BotService {
  async startBot() {
    return new Promise((res, rej) => {
      try {
        const store = Postgres({
          port: Number(process.env.POSTGRES_PORT),
          table: "bot_sessions",
          host: process.env.POSTGRES_HOST,
          database: process.env.POSTGRES_DB,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          onInitError: (e) => {
            console.log("Failed to use telegraf session", e);
          },
        });
        const stage = new Scenes.Stage([
          mainScene,
          matchingScene,
          chatScene,
          providerChatScene,
          enterScene,
          connectsListScene,
          ratingScene,
        ]);

        const bot = new Telegraf(TOKEN);
        bot.use(session({ store }));
        bot.use(stage.middleware());
        bot.start((ctx) => {
          return ctx.scene.enter(SCENES.ENTER_SCENE);
        });

        bot.on(
          anyOf(
            message("game"),
            message("dice"),
            message("sticker"),
            message("story"),
            message("photo"),
            message("video"),
            message("voice"),
            message("audio"),
            message("contact"),
            message("poll"),
            message("location"),
            message("document"),
            message("invoice"),
            message("venue"),
          ),
          async (ctx) => {
            await ctx.deleteMessage();
            return ctx.reply(formatSystemMessage(STRINGS.ONLY_TEXT_ALLOWED), {
              // reply_parameters: {
              //   message_id: getMessageId(ctx),
              // },
            });
          },
        );

        bot.on("message_reaction", async (ctx) =>
          ctx.reply(formatSystemMessage(STRINGS.REACTIONS_DONT_SHOW), {}),
        );

        bot.catch((_, ctx) => {
          console.error(_);
          return replyError(_, ctx);
        });

        bot.launch(
          {
            allowedUpdates: ["message", "callback_query", "message_reaction"],
          },
          () => {
            console.log("Bot Launched Successfully");
            res(bot);
          },
        );
      } catch (error) {
        rej(error);
      }
    });
  }
}

export const botService = new BotService();
