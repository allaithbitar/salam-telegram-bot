import { appService } from "@utils/app.service";
import { botService } from "services/bot.service";
import { dbUpdatesChannel } from "./db";
import { getAllActiveProviders, getAllCurrentChats } from "@db/actions";

const BootstrapApp = async () => {
  try {
    appService.subscribeToDbUpdatesChannel(dbUpdatesChannel);
    await appService.syncLocalState(getAllCurrentChats, getAllActiveProviders);
    const bot = await botService.startBot();
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    console.log(error);
  }
};

BootstrapApp();
