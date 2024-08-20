import { createClient } from "@supabase/supabase-js";

export const cloudDb = createClient(
  process.env.SUPERBASE_URL,
  process.env.SUPERBASE_KEY,
);

export const dbUpdatesChannel = cloudDb.channel("current_chats");
