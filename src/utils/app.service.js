import { USER_TYPE_ENUM } from "@constants/index";
import Valkey from "iovalkey";
import apiService from "services/api.service";

export class AppService {
  constructor(apiService) {
    this.apiService = apiService;
    this.valkey = new Valkey({ host: process.env.VALKEY_HOST });
    this.valkey.flushall();
  }
  _localCurrentConnects = new Map();
  // _activeProviders = new Map();

  async connectProviderWithConsumer({
    providerId,
    consumerId,
    providerNickname,
    consumerNickname,
  }) {
    this.valkey.set();
    this._localCurrentConnects.set(providerId.toString(), {
      id: consumerId,
      nickname: consumerNickname,
    });
    this._localCurrentConnects.set(consumerId.toString(), {
      id: providerId,
      nickname: providerNickname,
    });
  }

  getPartner(userId) {
    return this._localCurrentConnects.get(String(userId));
  }

  getPartnerAsync(userId) {
    return new Promise((res) => {
      const interval = setInterval(() => {
        const partner = this._localCurrentConnects.get(String(userId));
        if (partner) {
          clearInterval(interval);
          res(partner);
        }
      }, 500);
    });
  }

  getMe(userId) {
    return this._localCurrentConnects.get(
      String(this._localCurrentConnects.get(String(userId))?.id),
    );
  }

  // getIsProvider(userId) {
  //   return this._avaiableProvider.has(String(userId));
  // }

  getIsInChat(providerId) {
    return this._localCurrentConnects.has(String(providerId));
  }

  async getUserNicknameFromInMemoryDb(tg_id) {
    return (await this.valkey.get(tg_id)) || "";
  }

  async getMatchId(tg_id) {
    return (await this.valkey.get(`${tg_id}_current_chat`)) ?? "";
  }

  async registerUserInMemoryDb(tg_id, nickname) {
    return await this.valkey.set(tg_id, nickname);
  }

  // async removeUserFromInMemoryDb(tg_id) {
  //   return await this.valkey.del(tg_id);
  // }

  async pairUsers(tg_id1, tg_id2) {
    await this.valkey.set(`${tg_id1}_current_chat`, String(tg_id2));
    await this.valkey.set(`${tg_id2}_current_chat`, String(tg_id1));
  }

  // addOrUpdateActiveProvider(tgId, data) {
  //   this._activeProviders.set(String(tgId), data);
  // }

  // getActiveProviderByTgId(tgId) {
  //   return this._activeProviders.get(String(tgId));
  // }

  // removeActiveProvider(tgId) {
  //   this._activeProviders.delete(String(tgId));
  // }

  async getRandomActiveProviderTgId(user_type = USER_TYPE_ENUM.Provider) {
    const activeProviders = await this.apiService.getAllActiveProviders();
    const nonBusyActiveProvidersWithSpecifiedUserType = activeProviders.filter(
      (p) => [!p.is_busy, user_type === p.user_type].every(Boolean),
    );

    let maxWillToProvide = 1;

    for (const provider of nonBusyActiveProvidersWithSpecifiedUserType) {
      maxWillToProvide = Math.max(maxWillToProvide, provider.will_to_provide);
    }

    const providersWithMaxWillToProvide =
      nonBusyActiveProvidersWithSpecifiedUserType.filter(
        (p) => p.will_to_provide === maxWillToProvide,
      );

    return providersWithMaxWillToProvide[
      Math.floor(Math.random() * providersWithMaxWillToProvide.length)
    ]?.user;
  }

  // removeConnectionBetweenProviderAndConsumer({ providerId, consumerId }) {
  //   this._currentConnects.delete(String(providerId));
  //   this._currentConnects.delete(String(consumerId));
  //   // this._avaiableProvider.set(String(providerId), providerId);
  // }

  async removeRelatedConnections(tg_id) {
    const matchId = await this.valkey.get(`${tg_id}_current_chat`);
    await this.valkey.del(matchId);
    await this.valkey.del(tg_id);
    await this.valkey.del(`${tg_id}_current_chat`);
    await this.valkey.del(`${matchId}_current_chat`);

    // const userIdString = String(tg_id);
    // const partnerUserIdString = String(
    //   this._localCurrentConnects.get(userIdString),
    // );
    // this._localCurrentConnects.delete(userIdString);
    // this._localCurrentConnects.delete(partnerUserIdString);
  }

  // handleDbChangeEvent(event) {
  //   const { table, old, eventType, new: newState } = event;
  //   switch (table) {
  //     case "bot_current_chats": {
  //       if (eventType === "DELETE") {
  //         const { consumer_id, provider_id } = old;
  //         this.removeRelatedConnections(consumer_id);
  //         this.removeRelatedConnections(provider_id);
  //         return;
  //       }
  //       if (eventType === "INSERT") {
  //         const {
  //           consumer_id,
  //           provider_id,
  //           provider_nickname,
  //           consumer_nickname,
  //         } = newState;
  //         this.connectProviderWithConsumer({
  //           providerId: provider_id,
  //           consumerId: consumer_id,
  //           providerNickname: provider_nickname,
  //           consumerNickname: consumer_nickname,
  //         });
  //         this.addOrUpdateActiveProvider(provider_id, {
  //           ...this.getActiveProviderByTgId(provider_id),
  //           is_busy: true,
  //         });
  //
  //         return;
  //       }
  //       return;
  //     }
  //     case "bot_user_preferences": {
  //       if (eventType === "UPDATE") {
  //         const {
  //           is_providing,
  //           user: tgId,
  //           nickname,
  //           will_to_provide,
  //           user_type,
  //           is_busy,
  //         } = newState;
  //         if (is_providing) {
  //           this.addOrUpdateActiveProvider(tgId, {
  //             nickname,
  //             will_to_provide,
  //             user_type,
  //             is_busy,
  //             tgId,
  //           });
  //         } else {
  //           this.removeActiveProvider(tgId);
  //         }
  //         return;
  //       }
  //       return;
  //     }
  //   }
  // }

  // subscribeToDbUpdatesChannel(dbUpdatesChannel) {
  //   dbUpdatesChannel
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //       },
  //       (payload) => this.handleDbChangeEvent(payload),
  //     )
  //     .subscribe();
  // }

  // __insetActiveProvidersToInMemoryDb(activeProviders) {
  //   this.valkey.set("active_providers", JSON.stringify(activeProviders));
  //   // this._activeProviders.set(String(p.user), {
  //   //   ...p,
  //   //   tgId: p.user,
  //   // });
  // }
  // async __removeActiveProviderFromInMemoryDb(tg_id) {
  //   const providers = JSON.parse(
  //     (await this.valkey.get("active_providers")) || [],
  //   );
  //   await this.valkey.set(
  //     "active_providers",
  //     JSON.stringify(providers.map((p) => p.user !== tg_id)),
  //   );
  // }

  async __addActiveProviderToInMemoryDb(provider) {
    const providers = JSON.parse(
      (await this.valkey.get("active_providers")) || [],
    );
    providers.push(provider);

    await this.valkey.set("active_providers", JSON.stringify(providers));
  }

  async syncLocalState(currentChatsSource) {
    // this.apiService.getAllOnGoingChats()
    const { data, error } = await currentChatsSource();
    if (!error && data) {
      for (const chat of data) {
        const {
          provider_id,
          consumer_id,
          provider_nickname,
          consumer_nickname,
        } = chat;
        this.valkey.set(consumer_id, consumer_nickname);
        this.valkey.set(provider_id, provider_nickname);
        this.pairUsers(consumer_id, provider_id);
        // this.connectProviderWithConsumer({
        //   consumerId: consumer_id,
        //   providerId: provider_id,
        //   consumerNickname: consumer_nickname,
        //   providerNickname: provider_nickname,
        // });
      }
    }
  }
}

export const appService = new AppService(apiService);
