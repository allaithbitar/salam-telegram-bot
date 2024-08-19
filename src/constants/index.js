const SCENES = {
  MATCHING_SCENE: "MATCHING_SCENE",
  MAIN_SCENE: "MAIN_SCENE",
  CHAT_SCENE: "CHAT_SCENE",
  PROVIDER_CHAT_SCENE: "PROVIDER_CHAT_SCENE",
};

const ACTIONS = {
  CONNECT: "CONNECT",
  START_PROVIDING: "START_PROVIDING",
  STOP_PROVIDING: "STOP_PROVIDING",
};

const STRINGS = {
  LOADING: "جار التحميل ...",
  MAIN_MENU: "القائمة الرئيسية :",
  START_PROVIDING: "[ السماح باستلام طلبات محادثة ]",
  STOP_PROVIDING: "[ إيقاف استلام الطلبات ]",
  CONNECT_TO_PROVIDER: "[ محاول التواصل ]",
  LEAVE: "[ المغادرة ]",
  END_CHAT: "[ إنهاء المحاثة ]",
  END_CHAT_STOP_PROVIDING: "[ مغادرة المحادثة إنهاء إستلام الطابات ]",
  NO_PROVIDERS_AVAIABLE: "لا يتوفر اي متطوعين حاليا",
  ALREADY_IN_CHAT:
    "يُظهر نظامنا أنك حاليًا في محادثة، إذا كنت تعتقد أن هذا خطأ، فيرجى الضغط على الزر أدناه لمغادرة أي محادثات متبقية.",
  LEAVING_CHATS: "جار ترك أي محادثات متبقية...",
  LEAVE_NO_BRACKETS: "مغادرة",
  LEAVING: "جار المغادرة",
  SOMETHING_WENT_WRONG: "حصل خطأ ما",
  PROVIDER_IS_NO_MORE: "لم يعد المتطوع متوفرا",
  CONSUMER_HAS_LEFT: "غادر الشخص المجهول المحادثة",
  // PROVIDER_HAS_LEFT: "غادر المتطوع المحادثة",
  LOOKING_FOR_A_PROVIDER: "جار البحث عن متطوع...",
  YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER: "تم ربطك مع شخص مجهول",
  YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER: "تم ربطك مع متطوع",
  WAITING_FOR_A_CONSUMER: "بانتظار محاولة شخص التواصل...",
  YOU_ARE_NOT_CONNECTED_WTIH_ANY_CONSUMER: "لست بمحادثة مع اي شخص",
  CONVERSATION_HAS_BEEN_ENDED: "تم إنهاء المحادثة",
  PROVIDER_HAS_ENDED_CHAT: "قام المتطوع بإنهاء المحادثة",
};

const BROADCAST_TYPE = {
  CHAT_CREATED: "CHAT_CREATED",
  CHAT_ENDED: "CHAT_ENDED",
  PROVIDER_ACTIVE: "PROVIDER_ACTIVE",
  PROVIDER_INACTIVE: "PROVIDER_INACTIVE",
};

export { BROADCAST_TYPE, STRINGS, ACTIONS, SCENES };
