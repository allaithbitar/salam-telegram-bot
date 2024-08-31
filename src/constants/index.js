export const SCENES = {
  ENTER_SCENE: "ENTER_SCENE",
  MATCHING_SCENE: "MATCHING_SCENE",
  MAIN_SCENE: "MAIN_SCENE",
  CHAT_SCENE: "CHAT_SCENE",
  PROVIDER_CHAT_SCENE: "PROVIDER_CHAT_SCENE",
  CONNECTS_LIST: "CONNECTS_LIST",
};

export const ACTIONS = {
  CONNECT: "CONNECT",
  START_PROVIDING: "START_PROVIDING",
  STOP_PROVIDING: "STOP_PROVIDING",
};
export const STRINGS = {
  WELCOME_MESSAGE: "WELCOME_MESSAGE",
  LOADING: "جار التحميل ...",
  MAIN_MENU: "القائمة الرئيسية :",
  START_PROVIDING: "[ السماح باستلام طلبات محادثة ]",
  STOP_PROVIDING: "[ إيقاف استلام الطلبات ]",
  CONNECT_TO_PROVIDER: "[ محاولة التواصل ]",
  LEAVE: "[ المغادرة ]",
  END_CHAT: "[ إنهاء المحاثة ]",
  END_CHAT_STOP_PROVIDING: "[ إنهاء المحادثة و إيقاف استلام الطلبات ]",
  NO_PROVIDERS_AVAIABLE: "لا يتوفر اي متطوعين حاليا",
  ALREADY_IN_CHAT:
    "يُظهر نظامنا أنك حاليًا في محادثة، إذا كنت تعتقد أن هذا خطأ، فيرجى الضغط على الزر أدناه لمغادرة أي محادثات متبقية.",
  LEAVING_CHATS: "جار ترك أي محادثات متبقية...",
  LEAVE_NO_BRACKETS: "مغادرة",
  LEAVING: "جار المغادرة",
  SOMETHING_WENT_WRONG: "حصل خطأ ما",
  PROVIDER_IS_NO_MORE: "لم يعد المتطوع متوفرا",
  CONSUMER_HAS_LEFT: "قام الشخص المجهول بإنهاء المحادثة",
  // PROVIDER_HAS_LEFT: "غادر المتطوع المحادثة",
  LOOKING_FOR_A_PROVIDER: "جار البحث عن متطوع...",
  YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER: "تم ربطك مع شخص مجهول",
  YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER: "تم ربطك مع متطوع",
  WAITING_FOR_A_CONSUMER: "بانتظار محاولة شخص التواصل...",
  YOU_ARE_NOT_CONNECTED_WTIH_ANY_CONSUMER: "لست بمحادثة مع اي شخص",
  CONVERSATION_HAS_BEEN_ENDED: "تم إنهاء المحادثة",
  PROVIDER_HAS_ENDED_CHAT: "قام المتطوع بإنهاء المحادثة",
  CONTINUE: "متابعة",
  REFRESH: "[ تحديث ]",
  CONNECT_TO_LAST_PROVIDER: "[ محاولة التواصل مع اخر متطوع تم التواصل معه ]",
  LAST_PROVIDER_NOT_CURRENTLY_AVAILABLE: "المتطوع غير متوفر حاليا",
  SPECIFIED_PROVIDER_NOT_CURRENTLY_AVAIABLE: "هذا المتطوع غير متوفر حاليا",
  TRYING_TO_CONNECT_TO_LAST_PROVIDER: "جار محاولة التواصل مع اخر متطوع...",
  TRYING_TO_CONNECT_TO_SPECIFIED_PROVIDER:
    "جار محاولة التواصل مع المتطوع المختار...",
  PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_CONSUMER:
    "تم ربطك مع شخص مجهول عن طريق محاولة ربطه مع اخر متطوع تواصل معه",
  PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_CONSUMER_THAT_HAS_CHOSEN_YOU:
    "تم ربطك مع مستفيد قام باختيارك من قائمة اتصالاته السابقة",

  CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_PROVIDER:
    "تم ربطك مع اخر متطوع تم التواصل معه",
  CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_SPECIFIED_PROVIDER:
    "تم ربطك مع المتطوع الذي قمت باختياره",

  SEND_COMPLAIN: "[ إرسال شكوى ]",
  YOU_CAN_COMPLAIN_HERE:
    "يمكنك إرسال شكوى على البوت التالي بالضغط على الزر ادناه",
  COMPLAIN: "إرسال شكوى",
  VIEW_CONNECTS_LIST: "[ عرض المتطوعين الذين تم التواصل معهم مسبقا ]",
  CONNECTS_LIST:
    "قائمة المتطوعين الذين قمت بالتواصل معهم مسبقا, قم بالضغط على متطوع لمحاولة التواصل معه:",
  GO_BACK_TO_MAIN_MENU: "[ العودة للقائمة الرئيسية ]",
};

export const BROADCAST_TYPE = {
  CHAT_CREATED: "CHAT_CREATED",
  CHAT_ENDED: "CHAT_ENDED",
  PROVIDER_ACTIVE: "PROVIDER_ACTIVE",
  PROVIDER_INACTIVE: "PROVIDER_INACTIVE",
};

export const USER_TYPE_ENUM = {
  Consumer: "Consumer",
  Provider: "Provider",
  Specialist: "Specialist",
};

export const USER_TYPE_ENUM_TO_READABLE = {
  Consumer: "مستفيد",
  Provider: "متطوع",
  Specialist: "مختص",
};
