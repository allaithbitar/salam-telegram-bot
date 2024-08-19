import { getAllCurrentChats } from "@db/actions";
import { currentChatsChannel } from "@db/index";

export class AppService {
  _localCurrentConnects = new Map();
  // _avaiableProvider
  async connectProviderWithConsumer({ providerId, consumerId }) {
    this._localCurrentConnects.set(providerId.toString(), consumerId);
    this._localCurrentConnects.set(consumerId.toString(), providerId);
  }

  // tryConnectToRandomProvider(consumerId) {
  //   if (this._avaiableProvider.size) {
  //     const randomProviderId = this.getRandomProvider();
  //     this.connectProviderWithConsumer({
  //       providerId: parseInt(randomProviderId),
  //       consumerId,
  //     });
  //     console.warn(
  //       `connected providerId: ${randomProviderId}, consumerId: ${consumerId}`,
  //     );
  //     return { connected: true, reason: "" };
  //   } else {
  //     console.warn(`failed to connect consumerId: ${consumerId}`);
  //     return {
  //       connected: false,
  //       reason: "There are no avaiable providers at the moment",
  //     };
  //   }
  // }

  // getRandomProvider() {
  //   const providers = Array.from(this._avaiableProvider);
  //   return providers[Math.floor(Math.random() * providers.length)][0];
  // }

  getPartner(userId) {
    return this._localCurrentConnects.get(String(userId));
  }

  // getIsProvider(userId) {
  //   return this._avaiableProvider.has(String(userId));
  // }

  getIsInChat(providerId) {
    return this._localCurrentConnects.has(String(providerId));
  }

  // removeConnectionBetweenProviderAndConsumer({ providerId, consumerId }) {
  //   this._currentConnects.delete(String(providerId));
  //   this._currentConnects.delete(String(consumerId));
  //   // this._avaiableProvider.set(String(providerId), providerId);
  // }

  removeRelatedConnections(userId) {
    const userIdString = String(userId);
    if (this._localCurrentConnects.has(userIdString)) {
      this._localCurrentConnects.delete(
        String(this._localCurrentConnects.get(userIdString) ?? 0),
      );
      this._localCurrentConnects.delete(userIdString);
    }
  }

  handleDbChangeEvent(event) {
    const { table, old, eventType, new: newState } = event;
    switch (table) {
      case "current_chats": {
        if (eventType === "DELETE") {
          const { consumer_id, provider_id } = old;
          this.removeRelatedConnections(consumer_id);
          this.removeRelatedConnections(provider_id);
          return;
        }
        if (eventType === "INSERT") {
          const { consumer_id, provider_id } = newState;
          this.connectProviderWithConsumer({
            providerId: provider_id,
            consumerId: consumer_id,
          });
          return;
        }
      }
    }
  }

  constructor() {
    currentChatsChannel
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
  async syncLocalState() {
    const { data, error } = await getAllCurrentChats();
    if (!error && data) {
      for (const chat of data) {
        const { provider_id, consumer_id } = chat;
        this.connectProviderWithConsumer({
          consumerId: consumer_id,
          providerId: provider_id,
        });
      }
    }
  }
}

export const appService = new AppService();
