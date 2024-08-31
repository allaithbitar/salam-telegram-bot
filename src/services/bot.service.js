import { SCENES } from "@constants/index";
import { chatScene } from "@scenes/chat.scene";
import { connectsListScene } from "@scenes/connects-list.scene";
import { enterScene } from "@scenes/enter.scene";
import { mainScene } from "@scenes/main.scene";
import { matchingScene } from "@scenes/matching.scene";
import { providerChatScene } from "@scenes/provider-chat.scene";
import { Postgres } from "@telegraf/session/pg";
import { replyError } from "@utils/index";
import { Scenes, session, Telegraf } from "telegraf";

const TOKEN = process.env.BOT_TOKEN;

class BotService {
  async startBot() {
    return new Promise((res, rej) => {
      try {
        console.log("Launcing Bot");
        const store = Postgres({
          port: process.env.BOT_SESSION_DB_PORT,
          table: process.env.BOT_SESSION_TABLE_NAME,
          host: process.env.BOT_SESSION_DB_HOST,
          database: process.env.BOT_SESSION_DB_NAME,
          user: process.env.BOT_SESSION_DB_USER,
          password: process.env.BOT_SESSION_DB_PASSWORD,
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
        ]);

        const bot = new Telegraf(TOKEN);
        bot.use(session());
        bot.use(stage.middleware());
        bot.start((ctx) => {
          return ctx.scene.enter(SCENES.ENTER_SCENE);
        });

        bot.catch((err, ctx) => {
          console.log(err);
          return replyError(ctx);
        });

        bot.launch({}, () => {
          console.log("Bot Launched Successfully");
          res(bot);
        });
      } catch (error) {
        rej(error);
      }
    });
  }
}

export const botService = new BotService();
