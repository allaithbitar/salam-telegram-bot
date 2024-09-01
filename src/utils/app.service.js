import { USER_TYPE_ENUM } from "@constants/index";

export class AppService {
  _localCurrentConnects = new Map();
  _activeProviders = new Map();

  async connectProviderWithConsumer({
    providerId,
    consumerId,
    providerNickname,
    consumerNickname,
  }) {
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
        console.log("WAITING");
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

  addOrUpdateActiveProvider(tgId, data) {
    this._activeProviders.set(String(tgId), data);
  }

  getActiveProviderByTgId(tgId) {
    return this._activeProviders.get(String(tgId));
  }

  removeActiveProvider(tgId) {
    this._activeProviders.delete(String(tgId));
  }

  getRandomActiveProviderTgId(user_type = USER_TYPE_ENUM.Provider) {
    const nonBusyActiveProvidersWithSpecifiedUserType = Array.from(
      this._activeProviders,
    )
      .map(([, providerData]) => providerData)
      .filter((p) => [!p.is_busy, user_type === p.user_type].every(Boolean));

    let maxWillToProvide = 3;

    for (const provider of nonBusyActiveProvidersWithSpecifiedUserType) {
      maxWillToProvide = Math.max(maxWillToProvide, provider.will_to_provide);
    }

    const providersWithMaxWillToProvide =
      nonBusyActiveProvidersWithSpecifiedUserType.filter(
        (p) => p.will_to_provide === maxWillToProvide,
      );

    return providersWithMaxWillToProvide[
      Math.floor(Math.random() * providersWithMaxWillToProvide.length)
    ]?.tgId;
  }

  // removeConnectionBetweenProviderAndConsumer({ providerId, consumerId }) {
  //   this._currentConnects.delete(String(providerId));
  //   this._currentConnects.delete(String(consumerId));
  //   // this._avaiableProvider.set(String(providerId), providerId);
  // }

  removeRelatedConnections(userId) {
    const userIdString = String(userId);
    const partnerUserIdString = String(
      this._localCurrentConnects.get(userIdString),
    );
    this._localCurrentConnects.delete(userIdString);
    this._localCurrentConnects.delete(partnerUserIdString);
  }

  handleDbChangeEvent(event) {
    console.log(event);
    const { table, old, eventType, new: newState } = event;
    switch (table) {
      case "bot_current_chats": {
        if (eventType === "DELETE") {
          const { consumer_id, provider_id } = old;
          this.removeRelatedConnections(consumer_id);
          this.removeRelatedConnections(provider_id);
          return;
        }
        if (eventType === "INSERT") {
          const {
            consumer_id,
            provider_id,
            provider_nickname,
            consumer_nickname,
          } = newState;
          this.connectProviderWithConsumer({
            providerId: provider_id,
            consumerId: consumer_id,
            providerNickname: provider_nickname,
            consumerNickname: consumer_nickname,
          });
          this.addOrUpdateActiveProvider(provider_id, {
            ...this.getActiveProviderByTgId(provider_id),
            is_busy: true,
          });

          return;
        }
        return;
      }
      case "bot_user_preferences": {
        if (eventType === "UPDATE") {
          const {
            is_providing,
            user: tgId,
            nickname,
            will_to_provide,
            user_type,
            is_busy,
          } = newState;
          if (is_providing) {
            this.addOrUpdateActiveProvider(tgId, {
              nickname,
              will_to_provide,
              user_type,
              is_busy,
              tgId,
            });
          } else {
            this.removeActiveProvider(tgId);
          }
          return;
        }
        return;
      }
    }
  }

  constructor() {}

  subscribeToDbUpdatesChannel(dbUpdatesChannel) {
    dbUpdatesChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        (payload) => this.handleDbChangeEvent(payload),
      )
      .subscribe();
  }
  async syncLocalState(currentChatsSource, currentActiveProvidersSource) {
    const { data, error } = await currentChatsSource();
    if (!error && data) {
      for (const chat of data) {
        const {
          provider_id,
          consumer_id,
          provider_nickname,
          consumer_nickname,
        } = chat;
        this.connectProviderWithConsumer({
          consumerId: consumer_id,
          providerId: provider_id,
          consumerNickname: consumer_nickname,
          providerNickname: provider_nickname,
        });
      }
    }
    const { data: activeProviders, error: activeProvidersError } =
      await currentActiveProvidersSource();
    if (activeProviders && !activeProvidersError) {
      for (const p of activeProviders) {
        this._activeProviders.set(String(p.user), {
          ...p,
          tgId: p.user,
        });
      }
    }
  }
}

export const appService = new AppService();
