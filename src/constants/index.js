export const SCENES = {
  ENTER_SCENE: "ENTER_SCENE",
  MATCHING_SCENE: "MATCHING_SCENE",
  MAIN_SCENE: "MAIN_SCENE",
  CHAT_SCENE: "CHAT_SCENE",
  PROVIDER_CHAT_SCENE: "PROVIDER_CHAT_SCENE",
  CONNECTS_LIST: "CONNECTS_LIST",
  RATING_SCENE: "RATING_SCENE",
};

export const ACTIONS = {
  CONNECT: "CONNECT",
  START_PROVIDING: "START_PROVIDING",
  STOP_PROVIDING: "STOP_PROVIDING",
};
export const STRINGS = {
  WELCOME_MESSAGE: `📌 تعليمات استخدام بوت سلام للدعم النفسي الأولي والاستشارات

مرحبًا بك في بوت سلام، مساحة آمنة للحصول على دعم نفسي أولي واستشارات متخصصة بسرية تامة.

لطفًا، التزم بالتعليمات لضمان أفضل تجربة لك وللمقدمين.

1️⃣ اختيار نوع الدعم:
يمكنك اختيار نوع المساعدة التي تحتاجها:
▫️ رعاية نفسية أولية: يقدمها طلاب مختصون في المجال النفسي.
▫️ استشارة متخصصة: يقدمها مختصون ذوو خبرة.

2️⃣ التحضير قبل بدء المحادثة:
▫️ حدد السؤال أو المشكلة التي تحتاج لمناقشتها، وحاول كتابتها بوضوح قبل بدء الجلسة.
▫️ المحادثة مدتها 15 دقيقة فقط لضمان حصول الجميع على فرصة للاستفادة.
▫️ يحق لمقدم الدعم إنهاء الجلسة بعد انتهاء الوقت دون استثناء.

3️⃣ الخصوصية والأمان:
▫️ لا تتم مشاركة أي معلومات شخصية (رقم الهاتف، العنوان، الحسابات الشخصية).
▫️ هويتك محمية بالكامل، ولا يمكن لأي شخص معرفة بياناتك.
▫️ أي إساءة أو تجاوز للحدود سيتم التعامل معه فورًا بالحظر النهائي.

📩 التزم بهذه التعليمات لضمان تجربة آمنة ومريحة للجميع.


نحن هنا لدعمك بكل احترام ومسؤولية. 🤍`,
  LOADING: "جار التحميل ...",
  MAIN_MENU: "القائمة الرئيسية :",
  START_PROVIDING: "السماح باستلام طلبات محادثة",
  STOP_PROVIDING: "إيقاف استلام الطلبات",
  PROVIDING_STOPPED: "تم إيقاف إستلام الطلبات",
  CONNECT_TO_PROVIDER: "محاولة التواصل مع مقدم رعاية نفسية",
  CONNECT_TO_SPECIALIST: "محاولة التواصل مع مقدم استشارة متخصصة",
  LEAVE: "المغادرة",
  END_CHAT: "إنهاء المحاثة",
  END_CHAT_STOP_PROVIDING: "إنهاء المحادثة و إيقاف استلام الطلبات",
  NO_PROVIDERS_AVAILABLE: `نأسف، لا يوجد حاليًا مقدم رعاية نفسية أولية متاح.
يمكنك المحاولة مرة أخرى يوم السبت الساعة 6 مساءً بتوقيت دمشق للحصول على الدعم. 🤍`,
  NO_SPECIALIST_AVAILABLE: `نأسف، لا يوجد حاليًا مقدم استشارة متخصصة متاح.
يمكنك البحث عن مقدم رعاية نفسية أولية الآن للحصول على دعم. 🤍`,

  ALREADY_IN_CHAT:
    "يُظهر نظامنا أنك حاليًا في محادثة، إذا كنت تعتقد أن هذا خطأ، فيرجى الضغط على الزر أدناه لمغادرة أي محادثات متبقية.",
  LEAVING_CHATS: "جار ترك أي محادثات متبقية...",
  LEAVE_NO_BRACKETS: "مغادرة",
  LEAVING: "جار المغادرة",
  SOMETHING_WENT_WRONG: "حصل خطأ ما",
  // PROVIDER_IS_NO_MORE: "لم يعد المتطوع متوفرا",
  /* USER_HAS_LEFT: (nickname) => `قام المستخدم ${nickname} بإنهاء المحادثة`, */
  // PROVIDER_HAS_LEFT: "غادر المتطوع المحادثة",
  LOOKING_FOR_A_PROVIDER: "جار البحث عن متطوع...",
  YOU_HAVE_BEEN_LINKED_WITH_A_CONSUMER: "تم ربطك مع المستخدم",
  YOU_HAVE_BEEN_LINKED_WTIH_A_PROVIDER: "تم ربطك مع مقدم الرعاية النفسية",
  YOU_HAVE_BEEN_LINKED_WTIH_A_SPECIALIST:
    "تم ربطك مع مقدم الاستشارة النفسية المتخصص",
  WAITING_FOR_A_CONSUMER: "بانتظار محاولة شخص التواصل...",
  YOU_ARE_NOT_CONNECTED_WTIH_ANY_USER: "لست بمحادثة مع اي شخص",
  CONVERSATION_HAS_BEEN_ENDED: "تم إنهاء المحادثة",
  PROVIDER_HAS_ENDED_CHAT: "قام المتطوع بإنهاء المحادثة",
  THE_OTHER_SIDE_HAS_LEFT: "قام الطرف الاخر بمغادرة المحادثة",
  CONTINUE: "موافقة و متابعة",
  REFRESH: "تحديث",
  REFRESH_DONE: "تم التحديث",
  CONNECT_TO_LAST_PROVIDER: "محاولة التواصل مع اخر متطوع تم التواصل معه",
  LAST_PROVIDER_NOT_CURRENTLY_AVAILABLE: "المتطوع غير متوفر حاليا",
  SPECIFIED_PROVIDER_NOT_CURRENTLY_AVAIABLE:
    "الشخص الذي قمت باختياره ليس متوفر حاليا",
  TRYING_TO_CONNECT_TO_LAST_PROVIDER: "جار محاولة التواصل مع اخر متطوع...",
  TRYING_TO_CONNECT_TO_SPECIFIED_PROVIDER:
    "جار محاولة التواصل مع المتطوع المختار...",
  PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_CONSUMER:
    "تم ربطك مع شخص مجهول عن طريق محاولة ربطه مع اخر متطوع تواصل معه",
  PROVIDER_YOU_HAVE_BEEN_LINKED_WTIH_CONSUMER_THAT_HAS_CHOSEN_YOU: (
    consumerNickname,
  ) =>
    `تم ربطك مع المستخدم ${consumerNickname} الذي قام باختيارك من قائمة اتصالاته السابقة`,

  CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_LAST_PROVIDER:
    "تم ربطك مع اخر متطوع تم التواصل معه",
  CONSUMER_YOU_HAVE_BEEN_LINKED_WTIH_SPECIFIED_PROVIDER: "تم ربطك مع المتطوع",

  SEND_COMPLAIN: "إرسال شكوى",
  YOU_CAN_COMPLAIN_HERE:
    "يمكنك إرسال شكوى على البوت التالي بالضغط على الزر ادناه",
  COMPLAIN: "إرسال شكوى",
  VIEW_CONNECTS_LIST: "عرض الذين تم التواصل معهم مسبقا",
  CONNECTS_LIST:
    "قائمة المتطوعين الذين قمت بالتواصل معهم مسبقا, قم بالضغط على متطوع لمحاولة التواصل معه:",
  NO_CONNECTS_LIST: "لم تقم بالتواصل مع اي متطوع بعد",
  GO_BACK_TO_MAIN_MENU: "العودة للقائمة الرئيسية",
  ACCOUNT_SETTINGS: "تفضيلات المستخدم",
  ACCOUNT_SETTINGS_MESSAGE:
    "من أجل تغيير تفضيلات المتسخدم ( الاسم المستعار , التوافر بتقديم الرعاية ) يمكنك استخدام الرابط ادناه.\n بعد الانتهاء قم بالضغط على /refresh من اجل ان يتم مزامنة التفضيلات.",
  DASHBOARD_ACCOUNT_NOT_FOUND:
    "لم يتم العثور على حساب لوحة التحكم لهذا الحساب, رجاء قم بالتواصل مع الادمن من أجل إنشاء حساب لك",
  EDIT: "تعديل",
  ONLY_TEXT_ALLOWED: "لا يسمح الا بإرسال الرسائل العادية",
  WOULD_YOU_LIKE_TO_RATE: `كيف تقيّم الخدمة التي حصلت عليها؟ ⭐️

▫️ من 1 إلى 5
(حيث 5 تعني "ممتاز" و1 تعني "بحاجة لتحسين").


رأيك يهمنا ويساعدنا في تحسين تجربتك. ✨`,
  NOT_THIS_TIME: "ليس الأن",
  YOU_HAVE_BEEN_BLOCKED: `🚫 تم حظرك من استخدام بوت سلام

لقد تم حظرك بسبب مخالفة قواعد الاستخدام أو التجاوز في السلوك داخل البوت. نحن نوفر مساحة آمنة للدعم النفسي، ونحرص على احترام الجميع داخل هذا المجتمع.

إذا كنت تعتقد أن هناك خطأ في هذا الإجراء، يمكنك التواصل معنا عبر القنوات الرسمية. 🤍`,
  REACTIONS_DONT_SHOW: "التفاعل على رسالة لا يظهر للطرف الاخر",
  ACCOUNT_INFO: "معلومات الحساب",
  INFO_MESSAGE: `يمكنك استخدام التعليمات التالية من زر القائمة في الاسفل :

-  /connect_to_provider 
محاولة التواصل مع مقدم رعاية نفسية

- /connections_list
عرض الذين تم التواصل معهم مسبقا

- /report
إرسال شكوى

- /refresh
تحديث`,
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
export const DASHBOARD_USER_ROLE = {
  Admin: "Admin",
  Provider: "Provider",
};
