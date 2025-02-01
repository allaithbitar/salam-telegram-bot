import axios from "axios";
const api = axios.create({
  baseURL: `http://${process.env.API_HOST}:${process.env.API_PORT}`,
});

class ApiService {
  async getAllActiveProviders() {
    try {
      const { data } = await api.get("GetAllActiveProviders");
      return data.data;
    } catch (error) {
      console.error("Error Loading All Active Providers", error);
      return [];
    }
  }

  async getAllOnGoingChats() {
    const { data } = await api.get("GetAllOnGoingChats");
    return data;
  }

  async getUserPreferences(tg_id) {
    try {
      const { data } = await api.get("GetUserPreferences", {
        params: { tg_id },
      });
      return data.data;
    } catch (error) {
      console.error("Error Loading User Preferences", error);
      return null;
    }
  }

  async updateUserActiveState({ tg_id, is_busy, is_providing }) {
    try {
      const { data } = await api.put("UpdateUserActiveState", {
        tg_id,
        is_busy,
        is_providing,
      });
      return data.data;
    } catch (error) {
      console.error("Error Updating User Active State", error);
      return null;
    }
  }

  async removeAllRelatedOnGoingChats(tg_id) {
    try {
      const { data } = await api.delete("RemoveAllRelatedOnGoingChats", {
        params: { tg_id },
      });
      return data.data;
    } catch (error) {
      console.error("Error Removing All Related On Going Chats", error);
      return null;
    }
  }

  async generateDashboardAuthToken(tg_id) {
    const { data } = await api.get("GenerateDashboardAuthToken", {
      params: { tg_id },
    });
    return data.data;
  }

  async registerUser({ tg_id, first_name, last_name, username }) {
    const { data } = await api.post("RegisterUser", {
      tg_id,
      first_name,
      last_name,
      username,
    });
    return data.data;
  }

  async syncUserNames({ tg_id, first_name, last_name, username }) {
    const { data } = await api.post("SyncUserNames", {
      tg_id,
      first_name,
      last_name,
      username,
    });
    return data.data;
  }

  async getIsRegisteredUser(tg_id) {
    const { data } = await api.get("GetIsUserRegistered", {
      params: { tg_id },
    });
    return data.data;
  }

  async createChat({ provider_id, consumer_id }) {
    const { data } = await api.post("CreateChat", {
      provider_id,
      consumer_id,
    });
    return data;
  }

  async updateConnectsHistory({ provider_id, consumer_id }) {
    try {
      const { data } = await api.post("UpdateConnectsHistory", {
        provider_id,
        consumer_id,
      });
      return data.data;
    } catch (error) {
      return {
        error,
      };
    }
  }

  async getConsumerConnectsList(consumer_id) {
    const { data } = await api.get("GetConsumerConnectsList", {
      params: {
        consumer_id,
      },
    });
    return data.data;
  }

  async getProviderByTgId(tg_id, user_type) {
    const { data } = await api.get("GetProviderByTgId", {
      params: {
        tg_id,
        user_type,
      },
    });
    return data.data;
  }

  async getLasChatProviderId(consumer_id) {
    const { data } = await api.get("GetLastChatProviderId", {
      params: { consumer_id },
    });
    return data.data;
  }

  async GetUserAccountInfo(tg_id) {
    const { data } = await api.get("GetUserAccountInfo", {
      params: { tg_id },
    });
    return data.data;
  }

  async addRating(provider_id, rating) {
    await api.post("AddRating", { provider_id, rating: Number(rating) });
  }
}

export default new ApiService();
