import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// [English, Hindi]. Use {name} placeholders for values.
const D = {
  // nav & common
  home: ["Home", "होम"], about: ["About", "परिचय"], features: ["Features", "सुविधाएँ"], login: ["Log in", "लॉग इन"], register: ["Register", "रजिस्टर"],
  myFarm: ["My Farm", "मेरा खेत"], marketplace: ["Marketplace", "मंडी"], logout: ["Log out", "लॉग आउट"], demo: ["Demo data", "डेमो डेटा"],
  switchLang: ["Switch language", "भाषा बदलें"], checkingAccess: ["Checking access…", "पहुँच जाँची जा रही है…"],
  overview: ["Overview", "सारांश"], navFields: ["Fields", "खेत"], navCrops: ["Crops", "फसलें"], navCalendar: ["Calendar", "कैलेंडर"],
  navAdvisory: ["Advisory", "सलाह"], navHealth: ["Crop health", "फसल स्वास्थ्य"], navWeather: ["Weather", "मौसम"], navFinance: ["Expenses & profit", "खर्च और मुनाफ़ा"],
  navListings: ["My listings", "मेरी सूचियाँ"], navRequests: ["Purchase requests", "खरीद अनुरोध"], navProfile: ["Profile", "प्रोफ़ाइल"],
  navNotifications: ["Notifications", "सूचनाएँ"], navKnowledge: ["Knowledge", "ज्ञान केंद्र"], navOrders: ["My orders", "मेरे ऑर्डर"],
  navAdmin: ["Admin", "एडमिन"], navManage: ["Users & listings", "उपयोगकर्ता और सूचियाँ"],
  all: ["All", "सभी"], filter: ["Filter", "फ़िल्टर"], search: ["Search", "खोजें"], sort: ["Sort", "क्रम"], save: ["Save", "सहेजें"], saved: ["Saved.", "सहेजा गया।"],
  remove: ["Remove", "हटाएँ"], edit: ["Edit", "बदलें"], close: ["Close", "बंद करें"], dismiss: ["Dismiss", "हटाएँ"], today: ["Today", "आज"],
  crop: ["Crop", "फसल"], variety: ["Variety", "किस्म"], field: ["Field", "खेत"], date: ["Date", "तारीख़"], type: ["Type", "प्रकार"], note: ["Note", "टिप्पणी"], notes: ["Notes", "टिप्पणियाँ"],
  general: ["General", "सामान्य"], grade: ["Grade", "ग्रेड"], price: ["Price", "दाम"], available: ["Available", "उपलब्ध"], by: ["by", "द्वारा"], from: ["From", "से"],
  perQtl: ["per qtl", "प्रति क्विंटल"], location: ["Location", "स्थान"], status: ["Status", "स्थिति"], role: ["Role", "भूमिका"], view: ["View", "दृश्य"],
  acres: ["acres", "एकड़"], noMatches: ["Nothing matches that search.", "इस खोज से कुछ नहीं मिला।"], clearFilters: ["Clear filters", "फ़िल्टर हटाएँ"],
  browseMarket: ["Browse the marketplace", "मंडी देखें"], readMore: ["Read guides", "गाइड पढ़ें"],
  // statuses
  st_pending: ["Pending", "लंबित"], st_accepted: ["Accepted", "स्वीकृत"], st_rejected: ["Declined", "अस्वीकृत"],
  ls_active: ["Active", "सक्रिय"], ls_paused: ["Paused", "रुकी हुई"], ls_sold: ["Sold", "बिक गई"],
  active: ["Active", "सक्रिय"], suspended: ["Suspended", "निलंबित"], pending: ["Pending", "लंबित"],
  stage_sown: ["Sown", "बोई गई"], stage_vegetative: ["Vegetative", "वानस्पतिक"], stage_flowering: ["Flowering", "फूल"], stage_fruiting: ["Fruiting", "फल"], stage_maturity: ["Maturity", "परिपक्वता"], stage_harvested: ["Harvested", "कटी हुई"],
  irr_drip: ["Drip", "ड्रिप"], irr_canal: ["Canal", "नहर"], irr_borewell: ["Borewell", "बोरवेल"], irr_rainfed: ["Rain-fed", "वर्षा आधारित"],
  kind_irrigate: ["Irrigation", "सिंचाई"], kind_spray: ["Spray", "छिड़काव"], kind_fertilise: ["Fertiliser", "खाद"], kind_sow: ["Sowing", "बुवाई"], kind_harvest: ["Harvest", "कटाई"],
  cat_seed: ["Seed", "बीज"], cat_fertiliser: ["Fertiliser", "खाद"], cat_pesticide: ["Pesticide", "कीटनाशक"], cat_labour: ["Labour", "मज़दूरी"], cat_irrigation: ["Irrigation", "सिंचाई"], cat_machinery: ["Machinery", "मशीनरी"], cat_other: ["Other", "अन्य"],
  concern_pest: ["Pests", "कीट"], concern_nutrition: ["Nutrition", "पोषण"], concern_irrigation: ["Watering", "सिंचाई"], concern_harvest: ["Harvest", "कटाई"], concern_sowing: ["Sowing", "बुवाई"],
  sym_yellowLeaves: ["Yellow leaves", "पीली पत्तियाँ"], sym_spots: ["Brown/black spots", "भूरे/काले धब्बे"], sym_wilting: ["Wilting", "मुरझाना"], sym_curl: ["Leaf curl", "पत्ती मुड़ना"],
  sym_holes: ["Holes in fruit/stem", "फल/तने में छेद"], sym_whiteInsects: ["Tiny white insects", "छोटे सफ़ेद कीट"], sym_powder: ["White powder", "सफ़ेद चूर्ण"], sym_rot: ["Rotting", "सड़न"],
  sev_low: ["Low severity", "कम गंभीर"], sev_medium: ["Medium severity", "मध्यम गंभीर"], sev_high: ["High severity", "अत्यधिक गंभीर"],
  sky_sun: ["Clear and sunny", "साफ़ और धूप"], sky_cloud: ["Partly cloudy", "आंशिक बादल"], sky_rain: ["Light rain", "हल्की बारिश"], sky_storm: ["Thunderstorm", "आँधी-तूफ़ान"],
  kc_crops: ["Crops", "फसलें"], kc_soil: ["Soil", "मिट्टी"], kc_pests: ["Pests", "कीट"], kc_schemes: ["Schemes", "योजनाएँ"], kc_market: ["Selling", "बिक्री"],
  nk_market: ["Marketplace", "मंडी"], nk_weather: ["Weather", "मौसम"], nk_advisory: ["Reminder", "याद दिलाना"], nk_system: ["AgriAssist", "AgriAssist"],
  pref_market: ["Buyer requests & order updates", "खरीदार अनुरोध और ऑर्डर अपडेट"], pref_weather: ["Weather alerts", "मौसम चेतावनी"], pref_advisory: ["Task reminders & advice", "काम की याद और सलाह"],
  roleFarmer: ["Farmer", "किसान"], roleBuyer: ["Buyer", "खरीदार"], allRoles: ["All roles", "सभी भूमिकाएँ"],
  // errors
  errEmail: ["Enter a valid email address.", "सही ईमेल पता लिखें।"], errPw: ["Password must be at least 6 characters.", "पासवर्ड कम से कम 6 अक्षर का हो।"],
  errPwMatch: ["Passwords don't match.", "पासवर्ड मेल नहीं खाते।"], errExists: ["An account with this email already exists.", "इस ईमेल से खाता पहले से है।"],
  errLogin: ["That email and password don't match an account.", "यह ईमेल और पासवर्ड किसी खाते से मेल नहीं खाते।"],
  errSuspended: ["This account has been suspended. Contact support.", "यह खाता निलंबित है। सहायता से संपर्क करें।"],
  errName: ["Please enter at least 2 characters.", "कम से कम 2 अक्षर लिखें।"], errRequired: ["This field is required.", "यह भरना ज़रूरी है।"],
  errArea: ["Enter an area greater than zero.", "शून्य से अधिक क्षेत्र लिखें।"], errDate: ["Pick a date.", "तारीख़ चुनें।"],
  errHarvestAfter: ["Harvest must be after sowing.", "कटाई बुवाई के बाद होनी चाहिए।"], errNoField: ["Add a field first.", "पहले एक खेत जोड़ें।"],
  errTitle: ["Write at least 3 characters.", "कम से कम 3 अक्षर लिखें।"], errAmount: ["Enter an amount greater than zero.", "शून्य से अधिक राशि लिखें।"],
  errQty: ["Enter a quantity greater than zero.", "शून्य से अधिक मात्रा लिखें।"], errMaxQty: ["Only {n} qtl available.", "केवल {n} क्विंटल उपलब्ध है।"],
  errOffer: ["Enter your offer per quintal.", "प्रति क्विंटल अपना दाम लिखें।"], errPhone: ["Enter a 10-digit mobile number.", "10 अंकों का मोबाइल नंबर लिखें।"],
  errPickCrop: ["Choose a crop.", "फसल चुनें।"], errSymptoms: ["Select at least one symptom.", "कम से कम एक लक्षण चुनें।"],
  errNoMatch: ["We couldn't match these symptoms. Contact your local KVK.", "इन लक्षणों से मिलान नहीं हुआ। नज़दीकी KVK से संपर्क करें।"],
  errImage: ["Please choose an image file.", "कृपया चित्र फ़ाइल चुनें।"], errFieldHasCrops: ["This field still has growing crops.", "इस खेत में अभी फसल खड़ी है।"],
  errGeneric: ["Something went wrong. Try again.", "कुछ गड़बड़ हुई। फिर कोशिश करें।"],
  // landing
  heroTitle: ["Grow with clarity, sell with confidence.", "समझदारी से उगाएँ, भरोसे से बेचें।"],
  heroSub: ["AgriAssist brings your fields, costs, advice and buyers into one calm place — built for Indian farms.", "AgriAssist आपके खेत, खर्च, सलाह और खरीदारों को एक जगह लाता है — भारतीय खेती के लिए।"],
  heroEyebrow: ["Intelligent farmer advisory · India", "किसान सलाह · भारत"], heroAlt: ["Farmer walking along terraced paddy fields at sunrise", "सूर्योदय में धान के खेतों में चलता किसान"],
  imFarmer: ["I'm a farmer", "मैं किसान हूँ"], imBuyer: ["I'm a buyer", "मैं खरीदार हूँ"],
  whyEyebrow: ["Why AgriAssist", "AgriAssist क्यों"], whyTitle: ["A farm diary that also finds you a buyer.", "खेत की डायरी जो खरीदार भी ढूँढे।"],
  whyBody: ["Most farm apps stop at weather. AgriAssist follows a crop from the day it's sown to the day it's sold — records, advice, costs and the marketplace all speak to each other.", "ज़्यादातर ऐप मौसम पर रुक जाते हैं। AgriAssist बुवाई से बिक्री तक फसल के साथ चलता है — रिकॉर्ड, सलाह, खर्च और मंडी सब जुड़े हैं।"],
  f1t: ["Farm & crop records", "खेत और फसल रिकॉर्ड"], f1b: ["Fields, varieties, sowing dates and growth stages — in one ledger.", "खेत, किस्में, बुवाई तिथि और अवस्था — एक बही में।"],
  f2t: ["Advisory & weather", "सलाह और मौसम"], f2b: ["Structured guidance with precautions and next steps for your crop.", "आपकी फसल के लिए सावधानियों और अगले कदमों वाली सलाह।"],
  f3t: ["Know your margin", "अपना मुनाफ़ा जानें"], f3b: ["Record expenses, enter revenue, see profit per quintal.", "खर्च दर्ज करें, आय लिखें, प्रति क्विंटल मुनाफ़ा देखें।"],
  f4t: ["Sell without middlemen", "बिचौलियों के बिना बेचें"], f4b: ["List produce and accept purchase requests from verified buyers.", "उपज सूचीबद्ध करें और खरीदारों के अनुरोध स्वीकारें।"],
  howEyebrow: ["How it works", "यह कैसे काम करता है"], how1: ["Add your farm and fields", "अपना खेत जोड़ें"], how2: ["Log crops and record every expense", "फसल और हर खर्च दर्ज करें"],
  how3: ["Publish a listing when harvest nears", "कटाई नज़दीक हो तो सूची प्रकाशित करें"], how4: ["Accept the buyer request that suits you", "जो अनुरोध ठीक लगे उसे स्वीकारें"],
  handsAlt: ["Farmer's hands holding soil with a seedling", "पौधे के साथ मिट्टी थामे किसान के हाथ"],
  footerDemo: ["Weather, prices and advice shown in this preview are demo data.", "इस पूर्वावलोकन में मौसम, दाम और सलाह डेमो डेटा हैं।"],
  // auth
  authQuote: ["“The soil remembers every season. Now your records will too.”", "“मिट्टी हर मौसम याद रखती है। अब आपके रिकॉर्ड भी रखेंगे।”"],
  welcomeBack: ["Welcome back", "फिर से स्वागत है"], loginSub: ["Log in to continue to your workspace.", "आगे बढ़ने के लिए लॉग इन करें।"],
  email: ["Email", "ईमेल"], password: ["Password", "पासवर्ड"], confirmPw: ["Confirm password", "पासवर्ड दोबारा"], fullName: ["Full name", "पूरा नाम"],
  demoAccounts: ["Demo accounts", "डेमो खाते"], useFarmer: ["Use Farmer", "किसान खाता"], useBuyer: ["Use Buyer", "खरीदार खाता"], useAdmin: ["Use Admin", "एडमिन खाता"],
  newHere: ["New here?", "नए हैं?"], createAccount: ["Create account", "खाता बनाएँ"], createYourAccount: ["Create your account", "अपना खाता बनाएँ"],
  registerSub: ["Choose how you'll use AgriAssist.", "चुनें कि आप AgriAssist कैसे उपयोग करेंगे।"], accountType: ["Account type", "खाते का प्रकार"],
  farmerHint: ["Manage farm, sell produce", "खेत संभालें, उपज बेचें"], buyerHint: ["Source crops directly", "सीधे फसल खरीदें"], alreadyRegistered: ["Already registered?", "पहले से पंजीकृत?"],
  // farmer home
  goodMorning: ["Good morning", "सुप्रभात"], onionsReady: ["Your onions are almost ready.", "आपका प्याज़ लगभग तैयार है।"],
  cropInFocus: ["Crop in focus", "मुख्य फसल"], harvestIn: ["Harvest in {d}", "{d} में कटाई"], thisWeek: ["This week in the field", "इस सप्ताह खेत में"], nOpen: ["{n} open", "{n} बाकी"],
  buyersWaiting: ["Buyers waiting on you", "आपका इंतज़ार कर रहे खरीदार"], allRequests: ["All purchase requests", "सभी खरीद अनुरोध"],
  noRequestsYet: ["No purchase requests yet. They'll appear here as soon as a buyer reaches out.", "अभी कोई अनुरोध नहीं। खरीदार संपर्क करते ही यहाँ दिखेंगे।"],
  recentlyOnFarm: ["Recently on your farm", "हाल ही में आपके खेत पर"],
  requestPurchase: ["Request to buy", "खरीद अनुरोध"], accept: ["Accept", "स्वीकारें"], reject: ["Decline", "अस्वीकारें"],
  toastAccepted: ["Request accepted — the buyer has been notified.", "अनुरोध स्वीकृत — खरीदार को सूचना भेजी गई।"], toastDeclined: ["Request declined.", "अनुरोध अस्वीकृत।"],
  // marketplace
  mpEyebrow: ["Shared marketplace · {n} active lots", "साझा मंडी · {n} सक्रिय लॉट"], mpTitle: ["Straight from the field.", "सीधे खेत से।"],
  mpSub: ["Every lot is listed by the farmer who grew it. Send a request with your quantity and offer — they accept or decline directly.", "हर लॉट उसे उगाने वाले किसान ने डाला है। मात्रा और दाम के साथ अनुरोध भेजें — किसान सीधे स्वीकार या अस्वीकार करेंगे।"],
  mpSearchPh: ["Search onion, basmati, Guntur…", "प्याज़, बासमती, गुंटूर खोजें…"], sortLow: ["Price: low to high", "दाम: कम से ज़्यादा"], sortHigh: ["Price: high to low", "दाम: ज़्यादा से कम"], sortQty: ["Largest lots", "सबसे बड़े लॉट"],
  topPick: ["Top pick for your filters", "आपके फ़िल्टर के लिए सबसे अच्छा"], yourRequests: ["Your requests", "आपके अनुरोध"],
  mpDisclaimer: ["Sample listings are marked as demo data. Prices are not live mandi rates.", "नमूना सूचियाँ डेमो डेटा हैं। दाम लाइव मंडी भाव नहीं हैं।"],
  loginToRequest: ["Log in to request", "अनुरोध के लिए लॉग इन करें"], yourListing: ["Your listing", "आपकी सूची"], buyersOnly: ["Only buyers can request", "केवल खरीदार अनुरोध कर सकते हैं"],
  requestSent: ["Request sent to {name}.", "{name} को अनुरोध भेजा गया।"], qtyMax: ["Quantity (qtl, max {n})", "मात्रा (क्विंटल, अधिकतम {n})"],
  yourOffer: ["Your offer (₹ per qtl)", "आपका दाम (₹ प्रति क्विंटल)"], msgFarmer: ["Message to farmer (optional)", "किसान को संदेश (वैकल्पिक)"], estValue: ["Estimated value", "अनुमानित मूल्य"], sendRequest: ["Send request", "अनुरोध भेजें"],
  // fields
  acresAcross: ["acres across {n} fields", "एकड़, {n} खेतों में"], fieldsSub: ["Every plot you farm, with soil and water source.", "आपके सभी खेत, मिट्टी और पानी के स्रोत के साथ।"],
  addField: ["Add field", "खेत जोड़ें"], noFields: ["No fields yet. Add your first plot.", "अभी कोई खेत नहीं। पहला खेत जोड़ें।"], area: ["Area", "क्षेत्र"], soil: ["Soil", "मिट्टी"], irrigation: ["Irrigation", "सिंचाई"],
  fallow: ["Fallow — no crop recorded", "परती — कोई फसल नहीं"], fieldName: ["Field name", "खेत का नाम"], areaAcres: ["Area (acres)", "क्षेत्र (एकड़)"], soilPh: ["e.g. Black cotton", "जैसे काली मिट्टी"],
  fieldAdded: ["Field added.", "खेत जोड़ा गया।"], fieldRemoved: ["Field removed.", "खेत हटाया गया।"],
  // crops
  cropsTitle: ["From seed to sale.", "बीज से बिक्री तक।"], cropsSub: ["Tap a crop to update its stage, notes and costs.", "अवस्था, टिप्पणी और खर्च बदलने के लिए फसल चुनें।"],
  addCrop: ["Add crop", "फसल जोड़ें"], growing: ["Growing", "खड़ी फसल"], noCrops: ["No crops here.", "यहाँ कोई फसल नहीं।"], expectedHarvest: ["Expected harvest", "अनुमानित कटाई"], sownOn: ["Sown on", "बुवाई"],
  cropAdded: ["Crop added.", "फसल जोड़ी गई।"], backToCrops: ["All crops", "सभी फसलें"], cropNotFound: ["We couldn't find that crop.", "वह फसल नहीं मिली।"],
  growthStage: ["Growth stage", "वृद्धि अवस्था"], stageUpdated: ["Stage updated.", "अवस्था बदली गई।"], listThisCrop: ["List for sale", "बिक्री के लिए डालें"], checkHealth: ["Check health", "स्वास्थ्य जाँचें"],
  saveNotes: ["Save notes", "टिप्पणी सहेजें"], costSoFar: ["Cost so far", "अब तक खर्च"], openFinance: ["Open expenses", "खर्च देखें"], upcomingTasks: ["Tasks", "काम"], noTasks: ["No tasks linked.", "कोई काम नहीं जुड़ा।"],
  openCalendar: ["Open calendar", "कैलेंडर देखें"], healthHistory: ["Health checks", "स्वास्थ्य जाँच"], noReports: ["No checks yet.", "अभी कोई जाँच नहीं।"],
  // calendar
  calendarSub: ["Tap a day to see and add field work.", "खेत का काम देखने और जोड़ने के लिए दिन चुनें।"], prevMonth: ["Previous month", "पिछला महीना"], nextMonth: ["Next month", "अगला महीना"],
  nothingPlanned: ["Nothing planned for this day.", "इस दिन कुछ तय नहीं।"], markDone: ["Mark done", "पूरा करें"], addTask: ["Add task", "काम जोड़ें"], taskTitle: ["What needs doing?", "क्या करना है?"],
  taskAdded: ["Task added.", "काम जोड़ा गया।"], taskRemoved: ["Task removed.", "काम हटाया गया।"],
  // advisory
  advisoryTitle: ["Ask about your crop.", "अपनी फसल के बारे में पूछें।"], advisorySub: ["Pick a crop and a concern to get structured next steps and precautions.", "फसल और समस्या चुनें, अगले कदम और सावधानियाँ पाएँ।"],
  concern: ["Concern", "समस्या"], describeOptional: ["Describe what you see (optional)", "जो दिख रहा है लिखें (वैकल्पिक)"], advisoryPh: ["e.g. lower leaves turning yellow", "जैसे निचली पत्तियाँ पीली हो रही हैं"],
  getAdvice: ["Get advice", "सलाह लें"], advisoryDisclaimer: ["Rule-based demo guidance — no AI model is connected. Confirm with your local agriculture officer.", "नियम-आधारित डेमो सलाह — कोई AI मॉडल नहीं जुड़ा। स्थानीय कृषि अधिकारी से पुष्टि करें।"],
  advisoryEmptyTitle: ["Your guidance will appear here.", "आपकी सलाह यहाँ दिखेगी।"], advisoryEmpty: ["Choose a crop and concern on the left, then tap Get advice.", "बाईं ओर फसल और समस्या चुनें, फिर सलाह लें दबाएँ।"],
  nextSteps: ["Next steps", "अगले कदम"], precautions: ["Precautions", "सावधानियाँ"], planInCalendar: ["Plan it in the calendar", "कैलेंडर में तय करें"], earlierQuestions: ["Earlier questions", "पिछले प्रश्न"],
  // health
  healthTitle: ["What's wrong with my crop?", "मेरी फसल को क्या हुआ?"], healthSub: ["Select the symptoms you see. A photo helps you keep a record.", "दिखने वाले लक्षण चुनें। फ़ोटो रिकॉर्ड रखने में मदद करती है।"],
  whatDoYouSee: ["What do you see?", "आपको क्या दिख रहा है?"], addPhoto: ["Add a photo (optional)", "फ़ोटो जोड़ें (वैकल्पिक)"], photoAdded: ["Photo added", "फ़ोटो जुड़ी"],
  photoHint: ["Stored only on this device.", "केवल इस डिवाइस पर रखी जाती है।"], runCheck: ["Check crop", "फसल जाँचें"], likelyCause: ["Likely cause", "संभावित कारण"], matchScore: ["Symptom match", "लक्षण मिलान"],
  treatment: ["What to do", "क्या करें"], healthDisclaimer: ["Simulated result from a symptom table — not a lab or AI diagnosis.", "लक्षण तालिका से अनुमानित परिणाम — लैब या AI निदान नहीं।"],
  healthEmptyTitle: ["No check yet.", "अभी कोई जाँच नहीं।"], healthEmpty: ["Pick symptoms and tap Check crop.", "लक्षण चुनें और फसल जाँचें दबाएँ।"], pastChecks: ["Past checks", "पिछली जाँचें"],
  // weather
  weatherTitle: ["Seven days ahead.", "अगले सात दिन।"], rain: ["Rain", "बारिश"], wind: ["Wind", "हवा"], humidity: ["Humidity", "नमी"],
  rainAlert: ["Heavy rain expected on {day} ({mm} mm). Finish spraying and harvesting before then.", "{day} को भारी बारिश ({mm} मि.मी.) की संभावना। उससे पहले छिड़काव और कटाई पूरी करें।"],
  sprayWindow: ["Spray window", "छिड़काव का समय"], sprayGood: ["Clear, low wind — good spray window", "साफ़ मौसम, कम हवा — छिड़काव के लिए ठीक"], sprayBad: ["Avoid spraying — rain or strong wind", "छिड़काव न करें — बारिश या तेज़ हवा"],
  irrigationAdvice: ["Irrigation", "सिंचाई"], irrSkip: ["Skip irrigation — rain will cover it.", "सिंचाई न करें — बारिश पर्याप्त होगी।"], irrMorning: ["Hot day — irrigate early morning.", "गर्म दिन — सुबह जल्दी सिंचाई करें।"], irrNormal: ["Normal schedule.", "सामान्य समय पर सिंचाई।"],
  weatherDisclaimer: ["Sample forecast — not connected to a live weather service.", "नमूना पूर्वानुमान — लाइव मौसम सेवा से नहीं जुड़ा।"],
  // finance
  netSoFar: ["Net so far", "अब तक शुद्ध"], financeSub: ["Every rupee in and out, per crop.", "हर फसल की आय और खर्च।"], allCrops: ["All crops", "सभी फसलें"],
  spent: ["Spent", "खर्च"], earned: ["Earned", "आय"], costPerQtl: ["Cost per qtl sold", "प्रति क्विंटल लागत"], whereMoneyWent: ["Where the money went", "पैसा कहाँ गया"], ledger: ["Ledger", "बही"],
  sale: ["Sale", "बिक्री"], noEntries: ["No entries yet.", "अभी कोई प्रविष्टि नहीं।"], addExpense: ["Expense", "खर्च"], addSale: ["Sale", "बिक्री"], category: ["Category", "श्रेणी"],
  amountRs: ["Amount (₹)", "राशि (₹)"], qtyQtl: ["Quantity (qtl)", "मात्रा (क्विंटल)"], pricePerQtl: ["Price (₹/qtl)", "दाम (₹/क्विंटल)"], soldTo: ["Sold to", "किसे बेचा"],
  directSale: ["Direct sale", "सीधी बिक्री"], expenseAdded: ["Expense recorded.", "खर्च दर्ज हुआ।"], saleAdded: ["Sale recorded.", "बिक्री दर्ज हुई।"], expenseRemoved: ["Expense removed.", "खर्च हटाया गया।"],
  profitCalculator: ["Profit calculator", "मुनाफ़ा कैलकुलेटर"], expectedYield: ["Yield (qtl)", "उपज (क्विंटल)"], moreCosts: ["More costs (₹)", "अतिरिक्त खर्च (₹)"],
  refPrice: ["Reference price {price}/qtl", "संदर्भ दाम {price}/क्विंटल"], projectedProfit: ["Projected profit", "अनुमानित मुनाफ़ा"], income: ["Income", "आय"], breakEven: ["Break-even", "लागत निकालने का दाम"],
  // listings
  listingsTitle: ["{n} lots on the market", "मंडी में {n} लॉट"], listingsSub: ["Publish, adjust or pause what you're selling.", "जो बेच रहे हैं उसे डालें, बदलें या रोकें।"],
  newListing: ["New listing", "नई सूची"], editListing: ["Edit listing", "सूची बदलें"], noListings: ["You haven't listed anything yet.", "आपने अभी कुछ सूचीबद्ध नहीं किया।"],
  nPending: ["{n} pending", "{n} लंबित"], nRequests: ["{n} requests", "{n} अनुरोध"], nListings: ["{n} listings", "{n} सूचियाँ"],
  pause: ["Pause", "रोकें"], resume: ["Resume", "फिर शुरू"], markSold: ["Mark sold", "बिका हुआ"], confirmDelete: ["Delete this listing and its requests?", "यह सूची और इसके अनुरोध हटाएँ?"],
  listingUpdated: ["Listing updated.", "सूची अपडेट हुई।"], listingDeleted: ["Listing deleted.", "सूची हटाई गई।"], listingPublished: ["Listing published to the marketplace.", "सूची मंडी में प्रकाशित हुई।"],
  pickupLocation: ["Pickup location", "उठाने का स्थान"], availableFrom: ["Available from", "कब से उपलब्ध"], publish: ["Publish", "प्रकाशित करें"],
  photoAuto: ["A sample crop photo is used for now.", "अभी नमूना फसल फ़ोटो उपयोग होगी।"],
  // requests
  requestsTitle: ["{n} waiting for your answer", "{n} आपके जवाब का इंतज़ार"], requestsSub: ["Compare offers with your asking price before you decide.", "निर्णय से पहले दाम की तुलना करें।"],
  noRequestsHere: ["No requests in this view.", "इस दृश्य में कोई अनुरोध नहीं।"], atAsking: ["At your asking price", "आपके माँगे दाम पर"],
  aboveAsking: ["{v} above asking", "माँगे दाम से {v} ज़्यादा"], belowAsking: ["{v} below asking", "माँगे दाम से {v} कम"],
  // profile
  yourDetails: ["Your details", "आपकी जानकारी"], mobile: ["Mobile number", "मोबाइल नंबर"], village: ["Village / district", "गाँव / ज़िला"], preferences: ["Preferences", "पसंद"],
  language: ["Language", "भाषा"], notifyMe: ["Notify me about", "मुझे सूचित करें"], saveChanges: ["Save changes", "बदलाव सहेजें"], profileSaved: ["Profile saved.", "प्रोफ़ाइल सहेजी गई।"],
  resetDemo: ["Reset demo data", "डेमो डेटा रीसेट करें"], confirmReset: ["Reset all demo data on this device?", "इस डिवाइस का सारा डेमो डेटा रीसेट करें?"], demoReset: ["Demo data reset.", "डेमो डेटा रीसेट हुआ।"],
  // notifications
  unreadCount: ["{n} unread", "{n} अपठित"], markAllRead: ["Mark all read", "सभी पढ़ा हुआ"], unread: ["Unread", "अपठित"], allCaughtUp: ["You're all caught up.", "कोई नई सूचना नहीं।"],
  nNewRequest: ["{buyer} wants {qty} qtl of your {crop}.", "{buyer} आपका {qty} क्विंटल {crop} चाहते हैं।"],
  nAccepted: ["{farmer} accepted your request for {crop}.", "{farmer} ने आपका {crop} अनुरोध स्वीकार किया।"], nRejected: ["{farmer} declined your request for {crop}.", "{farmer} ने आपका {crop} अनुरोध अस्वीकार किया।"],
  nWeather: ["Heavy rain likely this week — plan sprays early.", "इस सप्ताह भारी बारिश की संभावना — छिड़काव पहले करें।"], nTask: ["Reminder: {task} is due tomorrow.", "याद दिलाना: {task} कल करना है।"],
  nWelcome: ["Welcome! Browse fresh lots from farmers.", "स्वागत है! किसानों के ताज़ा लॉट देखें।"], nAdminNew: ["{n} new accounts joined this week.", "इस सप्ताह {n} नए खाते जुड़े।"],
  // knowledge
  knowledgeTitle: ["Short guides for real fields.", "असली खेतों के लिए छोटी गाइड।"], knowledgeSub: ["Practical, step-by-step reading in English and Hindi.", "अंग्रेज़ी और हिंदी में व्यावहारिक, क्रमवार जानकारी।"],
  searchGuides: ["Search guides…", "गाइड खोजें…"], noGuides: ["No guides match.", "कोई गाइड नहीं मिली।"], minRead: ["{n} min read", "{n} मिनट"], keepReading: ["Keep reading", "और पढ़ें"],
  backToGuides: ["All guides", "सभी गाइड"], guideNotFound: ["That guide doesn't exist.", "वह गाइड मौजूद नहीं है।"],
  // buyer
  confirmedValue: ["Confirmed orders", "पक्के ऑर्डर"], buyerSub: ["Requests you've sent and orders farmers have accepted.", "आपके भेजे अनुरोध और किसानों द्वारा स्वीकृत ऑर्डर।"],
  awaiting: ["Awaiting reply", "जवाब बाकी"], orders: ["Orders", "ऑर्डर"], declined: ["Declined", "अस्वीकृत"], nothingHere: ["Nothing here yet.", "अभी यहाँ कुछ नहीं।"],
  listingRemoved: ["Listing removed", "सूची हटाई गई"], sent: ["sent", "भेजा"], cancelRequest: ["Cancel request", "अनुरोध रद्द करें"], requestCancelled: ["Request cancelled.", "अनुरोध रद्द हुआ।"],
  pickup: ["Pickup", "उठाना"], contactShared: ["Farmer will call you", "किसान आपको फ़ोन करेंगे"], findSimilar: ["Find similar lots", "मिलते-जुलते लॉट देखें"],
  noPaymentsNote: ["Payments and logistics are arranged directly between buyer and farmer — not handled in this demo.", "भुगतान और परिवहन खरीदार व किसान सीधे तय करते हैं — इस डेमो में शामिल नहीं।"],
  // admin
  adminTitle: ["The platform today.", "आज का प्लेटफ़ॉर्म।"],
  adminNarrative: ["{farmers} farmers and {buyers} buyers are on AgriAssist. There are {listings} active lots, {pending} requests waiting on farmers, and {value} in accepted trades.", "AgriAssist पर {farmers} किसान और {buyers} खरीदार हैं। {listings} सक्रिय लॉट, {pending} अनुरोध किसानों के जवाब के इंतज़ार में, और {value} के स्वीकृत सौदे हैं।"],
  suspendedCount: ["{n} account(s) suspended.", "{n} खाते निलंबित।"], listingsByState: ["Active lots by state", "राज्यवार सक्रिय लॉट"], recentTrades: ["Recent trade activity", "हाल के सौदे"],
  manageSub: ["Suspend accounts that break the rules and hide problem listings.", "नियम तोड़ने वाले खाते निलंबित करें और गलत सूचियाँ छिपाएँ।"],
  users: ["Users", "उपयोगकर्ता"], listings: ["Listings", "सूचियाँ"], activity: ["Activity", "गतिविधि"], suspend: ["Suspend", "निलंबित करें"], restore: ["Restore", "बहाल करें"], hide: ["Hide", "छिपाएँ"],
  userSuspended: ["Account suspended.", "खाता निलंबित हुआ।"], userRestored: ["Account restored.", "खाता बहाल हुआ।"],
  // sale modes, units & stock
  st_cancelled: ["Cancelled", "रद्द"], nCancelled: ["{buyer} cancelled their request for {crop}.", "{buyer} ने {crop} का अनुरोध रद्द किया।"],
  mode_regular: ["Regular", "सामान्य"], mode_bulk: ["Bulk / wholesale", "थोक"], mode_both: ["Regular + Bulk", "सामान्य + थोक"], saleMode: ["Sale mode", "बिक्री का तरीका"],
  saleModeHint: ["Enable regular, bulk or both. Both draw from the same stock.", "सामान्य, थोक या दोनों चुनें। दोनों एक ही स्टॉक से बिकते हैं।"],
  unit_kg: ["kg", "किलो"], unit_qtl: ["qtl", "क्विंटल"], unit_ton: ["ton", "टन"], unit: ["Unit", "इकाई"],
  totalStock: ["Available stock", "उपलब्ध स्टॉक"], pricePerKg: ["Price per kg (₹)", "प्रति किलो दाम (₹)"], minOrderKg: ["Minimum order (kg)", "न्यूनतम ऑर्डर (किलो)"],
  bulkPrice: ["Bulk price (₹)", "थोक दाम (₹)"], bulkPriceUnit: ["Bulk price per", "थोक दाम प्रति"], minBulk: ["Minimum bulk order", "न्यूनतम थोक ऑर्डर"],
  minOrder: ["Min. order", "न्यूनतम ऑर्डर"], perUnit: ["per {u}", "प्रति {u}"], pricePerUnitLbl: ["Your offer (₹ per {u})", "आपकी पेशकश (₹ प्रति {u})"], qtyIn: ["Quantity ({u})", "मात्रा ({u})"],
  stockLeft: ["{n} available", "{n} उपलब्ध"], buyAs: ["Buy as", "किस रूप में खरीदें"], total: ["Total", "कुल"],
  errModeNeeded: ["Choose at least one sale mode.", "कम से कम एक बिक्री तरीका चुनें।"], errModeOff: ["This sale mode isn't offered for this lot.", "इस लॉट के लिए यह तरीका उपलब्ध नहीं है।"],
  errBelowMin: ["Minimum order is {n}.", "न्यूनतम ऑर्डर {n} है।"], errOverStock: ["Only {n} in stock.", "स्टॉक में केवल {n} है।"], errMinOverStock: ["Minimum can't exceed available stock.", "न्यूनतम मात्रा स्टॉक से अधिक नहीं हो सकती।"],
  errAcceptStock: ["Can't accept — only {n} left in this lot.", "स्वीकार नहीं हो सकता — लॉट में केवल {n} बचा है।"], errUnavailable: ["This listing is no longer available.", "यह सूची अब उपलब्ध नहीं है।"],
  cancelOrder: ["Cancel order", "ऑर्डर रद्द करें"], confirmCancelOrder: ["Cancel this confirmed order? The quantity goes back to the farmer's stock.", "यह पक्का ऑर्डर रद्द करें? मात्रा किसान के स्टॉक में लौट जाएगी।"],
  stockReturned: ["Order cancelled — stock returned to the farmer.", "ऑर्डर रद्द — स्टॉक किसान को लौटाया गया।"],
  // distance & location
  distance: ["Distance", "दूरी"], anyDistance: ["Any distance", "कोई भी दूरी"], withinKm: ["Within {n} km", "{n} किमी के भीतर"], kmAway: ["{n} km away", "{n} किमी दूर"],
  clearDistance: ["Clear distance filter", "दूरी फ़िल्टर हटाएँ"], setLocation: ["Set my location", "मेरा स्थान सेट करें"], changeLocation: ["Change location", "स्थान बदलें"],
  needLocation: ["Set your search location to see nearby farmers. We won't guess distances.", "पास के किसान देखने के लिए अपना स्थान सेट करें। हम दूरी का अनुमान नहीं लगाते।"],
  noFarmerLoc: ["{n} listing(s) hidden — farmer hasn't shared a location.", "{n} सूची छिपी — किसान ने स्थान नहीं दिया।"],
  noneNearby: ["No farmers within {n} km of your location.", "आपके {n} किमी के भीतर कोई किसान नहीं।"],
  locWhy: ["Your browser will ask permission. We only use it to measure approximate distance to farmers — it isn't tracked or shared.", "ब्राउज़र अनुमति माँगेगा। हम इसका उपयोग केवल किसानों से अनुमानित दूरी जानने के लिए करते हैं — न ट्रैक करते हैं, न साझा करते हैं।"],
  locWhyFarmer: ["Buyers only see an approximate distance to your farm, never the exact point.", "खरीदार केवल आपके खेत की अनुमानित दूरी देखते हैं, सटीक स्थान नहीं।"],
  useMyLocation: ["Use my current location", "मेरा वर्तमान स्थान लें"], locating: ["Getting location…", "स्थान लिया जा रहा है…"],
  locDenied: ["Location permission was denied or unavailable. Enter latitude and longitude below instead.", "स्थान अनुमति नहीं मिली। नीचे अक्षांश और देशांतर लिखें।"],
  orManual: ["Or enter manually", "या स्वयं लिखें"], latitude: ["Latitude", "अक्षांश"], longitude: ["Longitude", "देशांतर"],
  errLatLng: ["Enter a latitude between -90 and 90 and longitude between -180 and 180.", "अक्षांश -90 से 90 और देशांतर -180 से 180 के बीच लिखें।"],
  saveLocation: ["Save location", "स्थान सहेजें"], locationSaved: ["Location saved.", "स्थान सहेजा गया।"], clearLocation: ["Remove location", "स्थान हटाएँ"],
  farmLocation: ["Farm location", "खेत का स्थान"], searchLocation: ["Search location", "खोज स्थान"], locSet: ["Location set", "स्थान सेट है"], locNotSet: ["No location set", "स्थान सेट नहीं"],
  demoLocNashik: ["Try demo point (near Lasalgaon)", "डेमो स्थान आज़माएँ (लासलगाँव के पास)"], sampleLoc: ["Sample location", "नमूना स्थान"],
} satisfies Record<string, [string, string]>;

export type Lang = "en" | "hi";
export type Key = keyof typeof D;
type Params = Record<string, string | number>;
type Bi = { en: string; hi: string };

export function translate(lang: Lang, k: Key, p?: Params) {
  const entry = (D as Record<string, [string, string]>)[k];
  let s = entry ? entry[lang === "en" ? 0 : 1] : String(k);
  if (p) for (const [a, b] of Object.entries(p)) s = s.replaceAll(`{${a}}`, String(b));
  return s;
}

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: Key, p?: Params) => string; locale: string; d: (iso: string) => string; pick: (b: Bi) => string }
const make = (lang: Lang, setLang: (l: Lang) => void): Ctx => {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return {
    lang, setLang, locale, t: (k, p) => translate(lang, k, p), pick: (b) => b[lang],
    d: (iso) => new Date(iso.length === 10 ? iso + "T00:00" : iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
  };
};
const I18nCtx = createContext<Ctx>(make("en", () => {}));

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => { const s = localStorage.getItem("agriassist.lang"); if (s === "hi") setLangState("hi"); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { localStorage.setItem("agriassist.lang", l); setLangState(l); };
  return <I18nCtx.Provider value={make(lang, setLang)}>{children}</I18nCtx.Provider>;
}
export const useT = () => useContext(I18nCtx);
