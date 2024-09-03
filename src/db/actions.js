import { USER_TYPE_ENUM } from "@constants/index";
import { cloudDb } from ".";
import { generateNickname } from "@utils/index";
// import { redisDB } from "./redis";

export const updateUserPreferences = async (tgId, properties) => {
  return cloudDb
    .from("bot_user_preferences")
    .update(properties)
    .eq("user", tgId)
    .throwOnError();
};

export const getRandomAvailableProviderTgId = async (
  providerType = USER_TYPE_ENUM.Provider,
) => {
  const res = await cloudDb.rpc("get_random_provider_or_specialist", {
    p_user_type: providerType,
  });
  return res.data?.id;
};

export const createChat = async ({ providerId, consumerId }) => {
  const { data: usersData } = await cloudDb
    .from("bot_user_preferences")
    .select("nickname,user,user_type")
    .in("user", [consumerId, providerId]);
  const _provider = usersData.find(
    (u) => u.user_type !== USER_TYPE_ENUM.Consumer,
  );

  const _consumer = usersData.find(
    (u) => u.user_type === USER_TYPE_ENUM.Consumer,
  );

  return cloudDb.from("bot_current_chats").insert({
    provider_id: _provider.user,
    provider_nickname: _provider.nickname,
    consumer_id: _consumer.user,
    consumer_nickname: _consumer.nickname,
  });
};

// export const getLastChatTgId = async (tgId, eqProperty = "consumer_id") => {
//   const { data: lastChatData } = await cloudDb
//     .from("bot_connects_history")
//     .select("provider_id")
//     .eq(eqProperty, tgId)
//     .order("created_at", {
//       ascending: false,
//     })
//     .limit(1);
//
//   return lastChatData?.[0]?.provider_id;
// };

export const getCurrentUserTypeAndStatus = async (tgId) => {
  const { data } = await cloudDb
    .from("bot_user_preferences")
    .select("user_type, is_providing, is_busy, nickname")
    .eq("user", tgId);

  if (data && data[0]) {
    const { user_type, is_providing, is_busy, nickname } = data[0];
    return {
      canProvide: [USER_TYPE_ENUM.Provider, USER_TYPE_ENUM.Specialist].includes(
        user_type,
      ),
      isAvailable: is_providing,
      isBusy: is_busy,
      nickname,
    };
  }
  return { canProvide: false, isAvailable: false, isBusy: false, nickname: "" };
};

export const getAllCurrentChats = () =>
  cloudDb.from("bot_current_chats").select();

export const removeAnyRelatedCurrentChats = (userId) =>
  cloudDb
    .from("bot_current_chats")
    .delete()
    .or(`consumer_id.eq.${userId},provider_id.eq.${userId}`);

export const registerUser = async ({
  tg_id,
  username,
  first_name,
  last_name,
}) => {
  await cloudDb
    .from("bot_users")
    .insert({
      tg_id,
      username,
      first_name,
      last_name,
    })
    .throwOnError();

  await cloudDb
    .from("bot_user_preferences")
    .insert({ nickname: generateNickname(), user: tg_id })
    .select("id")
    .throwOnError();
};

export const getIsRegisteredUser = (tgId) =>
  cloudDb.from("bot_users").select("tg_id").eq("tg_id", tgId);

export const updateConnectsHistory = async (consumerId, providerId) => {
  const res = await cloudDb.from("bot_connects_history").upsert({
    provider_id: providerId,
    consumer_id: consumerId,
  });
  return res;
};

export const getConsumerConnectsList = async (consumerId) => {
  const { data: connectIds } = await cloudDb
    .from("bot_connects_history")
    .select("provider_id")
    .eq("consumer_id", consumerId)
    .throwOnError();

  return await cloudDb
    .from("bot_user_preferences")
    .select("nickname,user")
    .in(
      "user",
      connectIds.map((c) => c.provider_id),
    );
};

export const getAllActiveProviders = () =>
  cloudDb
    .from("bot_user_preferences")
    .select("nickname,user,user_type,will_to_provide,is_busy,is_providing")
    .eq("is_providing", true);

export const getDashboardUserId = (tgId) =>
  cloudDb
    .from("bot_dashboard_users")
    .select("id,role")
    .eq("bot_user_id", tgId)
    .throwOnError();
