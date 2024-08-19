export const mergeEventNameWithCbFnKey = (event, cbFnKey) =>
  `${event}_${cbFnKey}`;

const AUTO_CLEAN_UP_TIME = 3_600_000;

class Pubsub {
  #subsWithId = new Map();

  publish(eventWithCbFnKey, data) {
    // if (!this.#events[event]) {
    //   this.#events[event] = event;
    // }
    // Object.values(this.#subs[event] ?? {}).forEach(cb => cb(data));

    console.warn(
      "CALLED PUBLISH",
      eventWithCbFnKey,
      this.#subsWithId.get(eventWithCbFnKey),
    );

    for (const sub of this.#subsWithId.get(eventWithCbFnKey) || []) {
      console.warn("PUBLISHED TO  ", eventWithCbFnKey, sub.cbFnKey);
      sub.cb(data);
      clearTimeout(sub.autoClearTimeout);
      sub.autoClearTimeout = setTimeout(() => {
        this.unsubscribeWithKey(
          eventWithCbFnKey.slice(0, eventWithCbFnKey.lastIndexOf("_")),
          sub.cbFnKey,
        );
      }, AUTO_CLEAN_UP_TIME);
    }
    // (this.#subsWithId.get(event) || []).forEach(sub => {
    //   clear;
    //
    //   sub.cb(data);
    // });
  }

  // subscribe(event, cb) {
  //   if (!this.#subs[event]) {
  //     this.#subs[event] = [cb];
  //     return () => {
  //       this.#subs[event] = this.#subs[event].filter(f => f !== cb);
  //     };
  //   } else {
  //     this.#subs[event].push(cb);
  //     return () => {
  //       this.#subs[event] = this.#subs[event].filter(f => f !== cb);
  //     };
  //   }
  // }
  subscribeWithKey(event, cbFnKey, cb) {
    const eventWithCbFnKey = mergeEventNameWithCbFnKey(event, cbFnKey);
    if (this.#subsWithId.has(eventWithCbFnKey)) {
      this.#subsWithId.set(eventWithCbFnKey, [
        ...this.#subsWithId.get(eventWithCbFnKey),
        {
          cbFnKey,
          cb,
          autoClearTimeout: setTimeout(() => {
            console.warn("AUTO CLEARED", event, cbFnKey);
            this.unsubscribeWithKey(event, cbFnKey);
            if ((this.#subsWithId.get(eventWithCbFnKey) || []).length === 0) {
              this.#subsWithId.delete(eventWithCbFnKey);
            }
          }, AUTO_CLEAN_UP_TIME),
        },
      ]);
    } else {
      this.#subsWithId.set(eventWithCbFnKey, [{ cbFnKey, cb }]);
    }
    console.warn(
      "PUBSUB SUBSCRIBE",
      { eventWithCbFnKey, cbFnKey },
      this.#subsWithId.get(eventWithCbFnKey),
    );
  }
  unsubscribeWithKey(event, cbFnKey) {
    const eventWithCbFnKey = mergeEventNameWithCbFnKey(event, cbFnKey);
    this.#subsWithId.set(
      eventWithCbFnKey,
      (this.#subsWithId.get(eventWithCbFnKey) || []).filter((sub) => {
        if (sub.cbFnKey === cbFnKey) {
          clearTimeout(sub.autoClearTimeout);
        }
        return sub.cbFnKey !== cbFnKey;
      }),
    );
    if ((this.#subsWithId.get(eventWithCbFnKey) || []).length === 0) {
      this.#subsWithId.delete(eventWithCbFnKey);
    }

    console.warn(
      "PUBSUB UNSUBSCRIBE",
      { eventWithCbFnKey, cbFnKey },
      this.#subsWithId.get(eventWithCbFnKey),
    );
  }
  clearSubscribersForEvent(event) {
    this.#subsWithId.set(event, []);
  }
}

export const pubsub = new Pubsub();

export const PUBSUB_EVENT = {
  FORCED_MESSAGE_FROM_CONSUMER: "FORCED_MESSAGE_FROM_CONSUMER",
  FORCED_MESSAGE_FROM_PROVIDER: "FORCED_MESSAGE_FROM_PROVIDER",
  FORCE_LEAVE_FROM_CONSUMER: "FORCE_LEAVE_FROM_CONSUMER",
  FORCE_LEAVE_FROM_PROVIDER: "FORCE_LEAVE_FROM_PROVIDER",
};
