import { createClient } from "@supabase/supabase-js";

export const cloudDb = createClient(
  process.env.SUPERBASE_URL,
  process.env.SUPERBASE_KEY,
);

export const currentChatsChannel = cloudDb.channel("current_chats");
