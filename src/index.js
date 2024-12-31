import { appService } from "@utils/app.service";
import { botService } from "services/bot.service";
import apiService from "services/api.service";

const BootstrapApp = async () => {
  try {
    // appService.su(dbUpdatesChannel);
    await appService.syncLocalState(apiService.getAllOnGoingChats);
    const bot = await botService.startBot();
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

BootstrapApp();
