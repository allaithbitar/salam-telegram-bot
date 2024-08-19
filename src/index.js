import { appService } from "@utils/app.service";
import { botService } from "services/bot.service";

const BootstrapApp = async () => {
  try {
    await appService.syncLocalState();
    const bot = await botService.startBot();
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    console.log(error);
  }
};

BootstrapApp();
