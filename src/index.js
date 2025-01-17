import { appService } from "@utils/app.service";
import { botService } from "services/bot.service";
import apiService from "services/api.service";

const BootstrapApp = async () => {
  try {
    // appService.su(dbUpdatesChannel);
    await appService.syncLocalState(apiService.getAllOnGoingChats);
    const bot = await botService.startBot();
    process.on("SIGINT", () => bot.stop("SIGINT"));
    process.on("SIGTERM", () => {
      process.exit();
    });
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

BootstrapApp();
