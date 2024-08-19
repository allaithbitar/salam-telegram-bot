import { cloudDb } from ".";

export const changeProviderAvilablity = (tgId, available) => {
  return cloudDb
    .from("bot_active_providers")
    .upsert({
      tg_id: tgId,
      is_available: available,
    })
    .eq("tg_id", tgId);
};

export const removeActiveProvider = (tgId) =>
  cloudDb.from("bot_active_providers").delete().eq("tg_id", tgId);

export const addActiveProvider = (tgId) =>
  cloudDb.from("bot_active_providers").insert({
    tg_id: tgId,
    is_available: true,
  });

export const getRandomAvailableProviderTgId = async () => {
  const res = await cloudDb.rpc("getRandomProvider");
  return res.data?.chat_id;
};

export const createChat = ({ providerId, consumerId }) =>
  cloudDb.from("current_chats").insert({
    provider_id: providerId,
    consumer_id: consumerId,
  });

export const getCurrentUserTypeAndStatus = async (tgId) => {
  const { data } = await cloudDb
    .from("bot_users")
    .select(
      "is_provider,bot_active_providers!bot_active_providers_tg_id_fkey (is_available)",
    )
    .eq("tg_id", tgId);
  if (data && data[0]) {
    const { is_provider, bot_active_providers } = data[0];
    return {
      isProvider: is_provider,
      isAvailable: bot_active_providers?.is_available ?? false,
    };
  }
  return { isProvider: false, isAvailable: false };
};

export const getAllCurrentChats = () => cloudDb.from("current_chats").select();

export const removeAnyRelatedCurrentChats = (userId) =>
  cloudDb
    .from("current_chats")
    .delete()
    .or(`consumer_id.eq.${userId},provider_id.eq.${userId}`);
