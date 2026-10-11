// ============================================================
// DEMO / MOCK DATA — replace with Express + MongoDB API calls.
// UI components must never import this file directly; go through src/services.
// ============================================================
import tomato from "@/assets/crop-tomato.jpg";
import wheat from "@/assets/crop-wheat.jpg";
import onion from "@/assets/crop-onion.jpg";
import chilli from "@/assets/crop-chilli.jpg";
import turmeric from "@/assets/crop-turmeric.jpg";
import rice from "@/assets/crop-rice.jpg";

export type Role = "farmer" | "buyer" | "admin";
export interface User { id: string; name: string; email: string; password: string; role: Role; location: string; phone?: string | undefined; status?: "active" | "suspended" | undefined; prefs?: { market: boolean; weather: boolean; advisory: boolean } | undefined;
  /** Farm location (farmer) or search location (buyer). Never shown to other users — only approximate distance. */
  lat?: number | undefined; lng?: number | undefined; locIsSample?: boolean | undefined }

export type SaleMode = "regular" | "bulk";
export type QtyUnit = "kg" | "qtl" | "ton";

export interface Listing {
  id: string; farmerId: string; farmerName: string; crop: string; variety: string;
  quantityQtl: number; pricePerQtl: number; location: string; state: string;
  availableFrom: string; status: "active" | "sold" | "paused"; image: string; grade: string;
  isSample: boolean;
  /** quantityQtl is the single shared stock for both sale modes. */
  regular?: { pricePerKg: number; minKg: number } | undefined;
  bulk?: { pricePerQtl: number; minQtl: number } | undefined;
}

export interface PurchaseRequest {
  id: string; listingId: string; buyerId: string; buyerName: string; buyerBusiness: string;
  quantityQtl: number; offerPerQtl: number; message: string; status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string; isSample: boolean;
  /** As entered by the buyer; quantityQtl / offerPerQtl are the normalised equivalents. */
  mode: SaleMode; unit: QtyUnit; quantity: number; unitPrice: number;
}

export interface FarmTask { id: string; title: string; field: string; due: string; kind: "irrigate" | "spray" | "harvest" | "sow" | "fertilise" }
export interface CropHighlight { id: string; crop: string; field: string; stage: string; progress: number; harvestIn: string; image: string }

export const demoUsers: User[] = [
  { id: "u-farmer", name: "Ramesh Patil", email: "farmer@agriassist.in", password: "farmer123", role: "farmer", location: "Nashik, Maharashtra" , lat: 20.15, lng: 74.23, locIsSample: true },
  { id: "u-buyer", name: "Anita Sharma", email: "buyer@agriassist.in", password: "buyer123", role: "buyer", location: "Pune, Maharashtra" },
  { id: "u-admin", name: "Platform Admin", email: "admin@agriassist.in", password: "admin123", role: "admin", location: "Bengaluru" },
];

export const sampleListings: Listing[] = [
  { id: "l1", farmerId: "u-farmer", farmerName: "Ramesh Patil", crop: "Onion", variety: "Nashik Red", quantityQtl: 120, pricePerQtl: 1850, location: "Lasalgaon", state: "Maharashtra", availableFrom: "2026-10-18", status: "active", image: onion, grade: "A", isSample: true, regular: { pricePerKg: 22, minKg: 20 }, bulk: { pricePerQtl: 1850, minQtl: 10 } },
  { id: "l2", farmerId: "u-farmer", farmerName: "Ramesh Patil", crop: "Tomato", variety: "Abhinav Hybrid", quantityQtl: 40, pricePerQtl: 1400, location: "Sinnar", state: "Maharashtra", availableFrom: "2026-10-12", status: "active", image: tomato, grade: "A", isSample: true, regular: { pricePerKg: 16, minKg: 5 } },
  { id: "l3", farmerId: "u-f3", farmerName: "Gurpreet Singh", crop: "Wheat", variety: "HD-2967", quantityQtl: 300, pricePerQtl: 2425, location: "Moga", state: "Punjab", availableFrom: "2026-11-02", status: "active", image: wheat, grade: "FAQ", isSample: true, bulk: { pricePerQtl: 2425, minQtl: 20 } },
  { id: "l4", farmerId: "u-f4", farmerName: "Lakshmi Reddy", crop: "Red Chilli", variety: "Guntur Teja", quantityQtl: 25, pricePerQtl: 17800, location: "Guntur", state: "Andhra Pradesh", availableFrom: "2026-10-20", status: "active", image: chilli, grade: "Premium", isSample: true, regular: { pricePerKg: 185, minKg: 2 }, bulk: { pricePerQtl: 17800, minQtl: 5 } },
  { id: "l5", farmerId: "u-f5", farmerName: "Mohan Das", crop: "Turmeric", variety: "Salem Finger", quantityQtl: 60, pricePerQtl: 13200, location: "Erode", state: "Tamil Nadu", availableFrom: "2026-11-15", status: "active", image: turmeric, grade: "A", isSample: true, bulk: { pricePerQtl: 13200, minQtl: 5 } },
  { id: "l6", farmerId: "u-f6", farmerName: "Sunita Devi", crop: "Rice", variety: "Pusa Basmati 1121", quantityQtl: 180, pricePerQtl: 4100, location: "Karnal", state: "Haryana", availableFrom: "2026-10-28", status: "active", image: rice, grade: "Premium", isSample: true, bulk: { pricePerQtl: 4100, minQtl: 10 } },
  { id: "l7", farmerId: "u-f7", farmerName: "Sanjay Jadhav", crop: "Onion", variety: "Bhima Super", quantityQtl: 35, pricePerQtl: 1800, location: "Vinchur", state: "Maharashtra", availableFrom: "2026-10-14", status: "active", image: onion, grade: "B", isSample: true, regular: { pricePerKg: 21, minKg: 10 } },
  { id: "l8", farmerId: "u-f8", farmerName: "Kavita More", crop: "Tomato", variety: "Saaho", quantityQtl: 80, pricePerQtl: 1350, location: "Pimpalgaon", state: "Maharashtra", availableFrom: "2026-10-13", status: "active", image: tomato, grade: "A", isSample: true, regular: { pricePerKg: 15, minKg: 10 }, bulk: { pricePerQtl: 1350, minQtl: 5 } },
  { id: "l9", farmerId: "u-f9", farmerName: "Prakash Kale", crop: "Wheat", variety: "Lok-1", quantityQtl: 150, pricePerQtl: 2380, location: "Niphad", state: "Maharashtra", availableFrom: "2026-10-30", status: "active", image: wheat, grade: "A", isSample: true, bulk: { pricePerQtl: 2380, minQtl: 10 } },
];

export const sampleRequests: PurchaseRequest[] = [
  { id: "r1", listingId: "l1", buyerId: "u-b2", buyerName: "Vikram Joshi", buyerBusiness: "Joshi Agro Traders, Mumbai", quantityQtl: 50, offerPerQtl: 1800, message: "Need graded 55mm+ bulbs, can lift by 20 Oct.", status: "pending", createdAt: "2026-10-09", isSample: true, mode: "bulk", unit: "qtl", quantity: 50, unitPrice: 1800 },
  { id: "r2", listingId: "l2", buyerId: "u-b3", buyerName: "Fresh Basket Pvt Ltd", buyerBusiness: "Retail chain, Pune", quantityQtl: 15, offerPerQtl: 1400, message: "Weekly supply possible?", status: "pending", createdAt: "2026-10-08", isSample: true, mode: "regular", unit: "kg", quantity: 1500, unitPrice: 14 },
];

export const sampleTasks: FarmTask[] = [
  { id: "t1", title: "Drip irrigation — 40 min", field: "North plot · Tomato", due: "Today, 6:00 AM", kind: "irrigate" },
  { id: "t2", title: "Neem oil spray for whitefly", field: "North plot · Tomato", due: "Tomorrow", kind: "spray" },
  { id: "t3", title: "Begin onion curing", field: "River field · Onion", due: "Mon, 13 Oct", kind: "harvest" },
  { id: "t4", title: "Sow rabi wheat seed", field: "East field", due: "Sat, 25 Oct", kind: "sow" },
];

export const sampleCrops: CropHighlight[] = [
  { id: "c1", crop: "Onion · Nashik Red", field: "River field, 2.5 acres", stage: "Bulb maturity", progress: 92, harvestIn: "4 days", image: onion },
  { id: "c2", crop: "Tomato · Abhinav", field: "North plot, 1.2 acres", stage: "Fruiting", progress: 64, harvestIn: "3 weeks", image: tomato },
];

export const sampleActivity = [
  { id: "a1", text: "Expense recorded: DAP fertiliser ₹4,200", when: "2 days ago" },
  { id: "a2", text: "Listing published: Tomato, 40 qtl", when: "3 days ago" },
  { id: "a3", text: "Field added: East field, 3 acres", when: "1 week ago" },
];

// ---------- Stage 2 demo data ----------
export type Irrigation = "drip" | "canal" | "borewell" | "rainfed";
export interface FarmField { id: string; farmerId: string; name: string; areaAcres: number; soil: string; irrigation: Irrigation; isSample: boolean }
export type Stage = "sown" | "vegetative" | "flowering" | "fruiting" | "maturity" | "harvested";
export const stages: Stage[] = ["sown", "vegetative", "flowering", "fruiting", "maturity", "harvested"];
export interface Crop { id: string; farmerId: string; fieldId: string; name: string; variety: string; sownOn: string; expectedHarvest: string; stage: Stage; image: string; notes: string; isSample: boolean }
export interface CalEvent { id: string; farmerId: string; cropId?: string | undefined; title: string; date: string; kind: FarmTask["kind"]; done: boolean; isSample: boolean }
export type ExpenseCat = "seed" | "fertiliser" | "pesticide" | "labour" | "irrigation" | "machinery" | "other";
export const expenseCats: ExpenseCat[] = ["seed", "fertiliser", "pesticide", "labour", "irrigation", "machinery", "other"];
export interface Expense { id: string; farmerId: string; cropId: string; category: ExpenseCat; amount: number; date: string; note: string; isSample: boolean }
export interface Revenue { id: string; farmerId: string; cropId: string; qtl: number; pricePerQtl: number; date: string; buyer: string; isSample: boolean }
export interface Notice { id: string; userId: string; key: string; params: Record<string, string | number>; kind: "market" | "weather" | "advisory" | "system"; read: boolean; createdAt: string; link?: string | undefined }
export interface HealthReport { id: string; farmerId: string; cropId: string; symptoms: string[]; photo?: string | undefined; diseaseId: string; confidence: number; createdAt: string; isSample: boolean }

export const cropImages: Record<string, string> = { Onion: onion, Tomato: tomato, Wheat: wheat, "Red Chilli": chilli, Chilli: chilli, Turmeric: turmeric, Rice: rice };
export const cropOptions = Object.keys(cropImages).filter((c) => c !== "Chilli");

export const extraUsers: User[] = [
  { id: "u-f3", name: "Gurpreet Singh", email: "gurpreet@agriassist.in", password: "demo123", role: "farmer", location: "Moga, Punjab" , lat: 30.81, lng: 75.17, locIsSample: true },
  { id: "u-f4", name: "Lakshmi Reddy", email: "lakshmi@agriassist.in", password: "demo123", role: "farmer", location: "Guntur, Andhra Pradesh" , lat: 16.3, lng: 80.44, locIsSample: true },
  { id: "u-f5", name: "Mohan Das", email: "mohan@agriassist.in", password: "demo123", role: "farmer", location: "Erode, Tamil Nadu" , lat: 11.34, lng: 77.72, locIsSample: true },
  { id: "u-f6", name: "Sunita Devi", email: "sunita@agriassist.in", password: "demo123", role: "farmer", location: "Karnal, Haryana" , lat: 29.69, lng: 76.99, locIsSample: true },
  { id: "u-f7", name: "Sanjay Jadhav", email: "sanjay@agriassist.in", password: "demo123", role: "farmer", location: "Vinchur, Maharashtra", lat: 20.112, lng: 74.231, locIsSample: true },
  { id: "u-f8", name: "Kavita More", email: "kavita@agriassist.in", password: "demo123", role: "farmer", location: "Pimpalgaon, Maharashtra", lat: 20.220, lng: 74.200, locIsSample: true },
  { id: "u-f9", name: "Prakash Kale", email: "prakash@agriassist.in", password: "demo123", role: "farmer", location: "Niphad, Maharashtra", lat: 20.080, lng: 74.110, locIsSample: true },
  { id: "u-b2", name: "Vikram Joshi", email: "vikram@agriassist.in", password: "demo123", role: "buyer", location: "Joshi Agro Traders, Mumbai" },
  { id: "u-b3", name: "Fresh Basket Pvt Ltd", email: "fresh@agriassist.in", password: "demo123", role: "buyer", location: "Retail chain, Pune" },
];

export const sampleFields: FarmField[] = [
  { id: "f1", farmerId: "u-farmer", name: "River field", areaAcres: 2.5, soil: "Black cotton", irrigation: "canal", isSample: true },
  { id: "f2", farmerId: "u-farmer", name: "North plot", areaAcres: 1.2, soil: "Red loam", irrigation: "drip", isSample: true },
  { id: "f3", farmerId: "u-farmer", name: "East field", areaAcres: 3, soil: "Alluvial", irrigation: "borewell", isSample: true },
];

export const sampleCropRecords: Crop[] = [
  { id: "c1", farmerId: "u-farmer", fieldId: "f1", name: "Onion", variety: "Nashik Red", sownOn: "2026-06-20", expectedHarvest: "2026-10-14", stage: "maturity", image: onion, notes: "Necks falling over; stop irrigation 10 days before lifting.", isSample: true },
  { id: "c2", farmerId: "u-farmer", fieldId: "f2", name: "Tomato", variety: "Abhinav Hybrid", sownOn: "2026-07-25", expectedHarvest: "2026-11-01", stage: "fruiting", image: tomato, notes: "Whitefly seen on lower leaves last week.", isSample: true },
  { id: "c3", farmerId: "u-farmer", fieldId: "f3", name: "Wheat", variety: "HD-2967", sownOn: "2026-10-25", expectedHarvest: "2027-03-20", stage: "sown", image: wheat, notes: "Planned rabi sowing.", isSample: true },
];

export const sampleEvents: CalEvent[] = [
  { id: "e1", farmerId: "u-farmer", cropId: "c2", title: "Drip irrigation — 40 min", date: "2026-10-10", kind: "irrigate", done: false, isSample: true },
  { id: "e2", farmerId: "u-farmer", cropId: "c2", title: "Neem oil spray for whitefly", date: "2026-10-11", kind: "spray", done: false, isSample: true },
  { id: "e3", farmerId: "u-farmer", cropId: "c1", title: "Begin onion curing", date: "2026-10-13", kind: "harvest", done: false, isSample: true },
  { id: "e4", farmerId: "u-farmer", cropId: "c2", title: "Top-dress potash", date: "2026-10-17", kind: "fertilise", done: false, isSample: true },
  { id: "e5", farmerId: "u-farmer", cropId: "c3", title: "Sow rabi wheat seed", date: "2026-10-25", kind: "sow", done: false, isSample: true },
  { id: "e6", farmerId: "u-farmer", cropId: "c1", title: "Stop irrigation", date: "2026-10-04", kind: "irrigate", done: true, isSample: true },
];

export const sampleExpenses: Expense[] = [
  { id: "x1", farmerId: "u-farmer", cropId: "c1", category: "seed", amount: 9500, date: "2026-06-18", note: "Onion seedlings", isSample: true },
  { id: "x2", farmerId: "u-farmer", cropId: "c1", category: "fertiliser", amount: 4200, date: "2026-07-10", note: "DAP 2 bags", isSample: true },
  { id: "x3", farmerId: "u-farmer", cropId: "c1", category: "labour", amount: 12000, date: "2026-07-02", note: "Transplanting", isSample: true },
  { id: "x4", farmerId: "u-farmer", cropId: "c1", category: "pesticide", amount: 2800, date: "2026-08-15", note: "Thrips spray", isSample: true },
  { id: "x5", farmerId: "u-farmer", cropId: "c2", category: "seed", amount: 6000, date: "2026-07-20", note: "Hybrid seed", isSample: true },
  { id: "x6", farmerId: "u-farmer", cropId: "c2", category: "irrigation", amount: 3500, date: "2026-08-01", note: "Drip lateral repair", isSample: true },
  { id: "x7", farmerId: "u-farmer", cropId: "c2", category: "labour", amount: 7000, date: "2026-09-05", note: "Staking", isSample: true },
];

export const sampleRevenues: Revenue[] = [
  { id: "v1", farmerId: "u-farmer", cropId: "c2", qtl: 8, pricePerQtl: 1450, date: "2026-10-05", buyer: "Local mandi", isSample: true },
];

export const sampleNotices: Notice[] = [
  { id: "n1", userId: "u-farmer", key: "nNewRequest", params: { buyer: "Vikram Joshi", crop: "Onion", qty: 50 }, kind: "market", read: false, createdAt: "2026-10-09", link: "/farmer/requests" },
  { id: "n2", userId: "u-farmer", key: "nWeather", params: {}, kind: "weather", read: false, createdAt: "2026-10-09", link: "/farmer/weather" },
  { id: "n3", userId: "u-farmer", key: "nTask", params: { task: "Neem oil spray" }, kind: "advisory", read: true, createdAt: "2026-10-08", link: "/farmer/calendar" },
  { id: "n4", userId: "u-buyer", key: "nWelcome", params: {}, kind: "system", read: false, createdAt: "2026-10-08", link: "/marketplace" },
  { id: "n5", userId: "u-admin", key: "nAdminNew", params: { n: 2 }, kind: "system", read: false, createdAt: "2026-10-09", link: "/admin/manage" },
];

export const sampleReports: HealthReport[] = [
  { id: "h1", farmerId: "u-farmer", cropId: "c2", symptoms: ["whiteInsects", "curl"], diseaseId: "whitefly", confidence: 78, createdAt: "2026-10-03", isSample: true },
];

type Bi = { en: string; hi: string };
export const symptomKeys = ["yellowLeaves", "spots", "wilting", "curl", "holes", "whiteInsects", "powder", "rot"] as const;
export interface Disease { id: string; name: Bi; symptoms: string[]; severity: "low" | "medium" | "high"; treatment: { en: string[]; hi: string[] } }
export const diseaseLibrary: Disease[] = [
  { id: "whitefly", name: { en: "Whitefly infestation", hi: "सफ़ेद मक्खी का प्रकोप" }, symptoms: ["whiteInsects", "curl", "yellowLeaves"], severity: "medium",
    treatment: { en: ["Spray neem oil 5 ml/L in the evening.", "Install yellow sticky traps (10 per acre).", "Remove heavily infested lower leaves."], hi: ["शाम को नीम तेल 5 मि.ली./लीटर छिड़कें।", "पीले चिपचिपे ट्रैप लगाएँ (10 प्रति एकड़)।", "अधिक प्रभावित निचली पत्तियाँ हटाएँ।"] } },
  { id: "blight", name: { en: "Early blight (fungal)", hi: "अगेती झुलसा (फफूंद)" }, symptoms: ["spots", "yellowLeaves", "rot"], severity: "high",
    treatment: { en: ["Remove and destroy spotted leaves.", "Spray mancozeb 2.5 g/L, repeat after 10 days.", "Avoid overhead irrigation."], hi: ["धब्बेदार पत्तियाँ हटाकर नष्ट करें।", "मैंकोजेब 2.5 ग्रा./लीटर छिड़कें, 10 दिन बाद दोहराएँ।", "ऊपर से सिंचाई न करें।"] } },
  { id: "wilt", name: { en: "Fusarium wilt", hi: "फ्यूज़ेरियम उकठा" }, symptoms: ["wilting", "yellowLeaves", "rot"], severity: "high",
    treatment: { en: ["Uproot wilted plants and burn them.", "Drench soil with Trichoderma.", "Rotate with a cereal crop next season."], hi: ["मुरझाए पौधे उखाड़कर जला दें।", "मिट्टी में ट्राइकोडर्मा डालें।", "अगले मौसम में अनाज फसल लगाएँ।"] } },
  { id: "mildew", name: { en: "Powdery mildew", hi: "चूर्णिल आसिता" }, symptoms: ["powder", "yellowLeaves", "curl"], severity: "low",
    treatment: { en: ["Spray wettable sulphur 2 g/L.", "Improve air flow between rows."], hi: ["घुलनशील गंधक 2 ग्रा./लीटर छिड़कें।", "कतारों के बीच हवा का प्रवाह बढ़ाएँ।"] } },
  { id: "borer", name: { en: "Fruit / stem borer", hi: "फल / तना छेदक" }, symptoms: ["holes", "wilting", "rot"], severity: "medium",
    treatment: { en: ["Collect and destroy bored fruits.", "Set pheromone traps (5 per acre).", "Spray Bt formulation if damage exceeds 5%."], hi: ["छेद वाले फल इकट्ठा कर नष्ट करें।", "फेरोमोन ट्रैप लगाएँ (5 प्रति एकड़)।", "नुकसान 5% से अधिक हो तो Bt का छिड़काव करें।"] } },
];

export type Concern = "pest" | "nutrition" | "irrigation" | "harvest" | "sowing";
export const concerns: Concern[] = ["pest", "nutrition", "irrigation", "harvest", "sowing"];
export const advisoryLibrary: Record<Concern, { summary: Bi; steps: { en: string[]; hi: string[] }; precautions: { en: string[]; hi: string[] } }> = {
  pest: { summary: { en: "Scout twice a week and act on thresholds rather than calendar sprays.", hi: "सप्ताह में दो बार निरीक्षण करें और तय सीमा पर ही छिड़काव करें।" },
    steps: { en: ["Inspect 20 random plants across the field.", "Use neem-based spray first; chemical only if pressure persists.", "Spray early morning or late evening."], hi: ["खेत में 20 पौधों की जाँच करें।", "पहले नीम आधारित छिड़काव करें; दबाव बना रहे तभी रसायन।", "सुबह जल्दी या शाम को छिड़काव करें।"] },
    precautions: { en: ["Wear gloves and a mask.", "Respect the pre-harvest interval on the label."], hi: ["दस्ताने और मास्क पहनें।", "लेबल पर लिखी कटाई-पूर्व अवधि का पालन करें।"] } },
  nutrition: { summary: { en: "Split nitrogen into doses and match potash to the fruiting stage.", hi: "नाइट्रोजन को किस्तों में दें और फल अवस्था में पोटाश बढ़ाएँ।" },
    steps: { en: ["Get a soil test at the nearest KVK.", "Apply nitrogen in 2–3 splits.", "Add potash at flowering/fruiting."], hi: ["नज़दीकी KVK में मिट्टी की जाँच कराएँ।", "नाइट्रोजन 2–3 किस्तों में दें।", "फूल/फल अवस्था में पोटाश दें।"] },
    precautions: { en: ["Don't apply fertiliser on dry soil.", "Avoid excess urea — it invites pests."], hi: ["सूखी मिट्टी पर खाद न डालें।", "अधिक यूरिया से बचें — इससे कीट बढ़ते हैं।"] } },
  irrigation: { summary: { en: "Irrigate by soil moisture, not by habit — critical stages need water most.", hi: "आदत से नहीं, मिट्टी की नमी देखकर सिंचाई करें।" },
    steps: { en: ["Check moisture 10 cm deep with your finger.", "Prefer drip or alternate-furrow irrigation.", "Irrigate in the morning to cut evaporation."], hi: ["10 सें.मी. गहराई पर नमी जाँचें।", "ड्रिप या एकांतर नाली सिंचाई अपनाएँ।", "वाष्पीकरण कम करने के लिए सुबह सिंचाई करें।"] },
    precautions: { en: ["Avoid waterlogging after rain.", "Stop irrigation before harvest of bulb crops."], hi: ["बारिश के बाद जलभराव से बचें।", "कंद फसलों की कटाई से पहले सिंचाई बंद करें।"] } },
  harvest: { summary: { en: "Harvest at the right maturity and grade before selling for a better price.", hi: "सही परिपक्वता पर कटाई करें और बेचने से पहले ग्रेडिंग करें।" },
    steps: { en: ["Check maturity signs for your crop.", "Harvest in dry weather.", "Sort into grades; list the top grade on the marketplace."], hi: ["फसल की परिपक्वता के संकेत देखें।", "सूखे मौसम में कटाई करें।", "ग्रेड में छाँटें; सबसे अच्छा ग्रेड मंडी में सूचीबद्ध करें।"] },
    precautions: { en: ["Keep produce shaded after harvest.", "Use clean, dry bags or crates."], hi: ["कटाई के बाद उपज को छाँव में रखें।", "साफ़, सूखे बोरे या क्रेट उपयोग करें।"] } },
  sowing: { summary: { en: "Use certified seed, treat it, and sow in the recommended window.", hi: "प्रमाणित बीज लें, उपचार करें और सही समय पर बोएँ।" },
    steps: { en: ["Buy certified seed from a licensed dealer.", "Treat seed with fungicide or Trichoderma.", "Maintain recommended spacing."], hi: ["लाइसेंसधारी विक्रेता से प्रमाणित बीज खरीदें।", "बीज को फफूंदनाशी या ट्राइकोडर्मा से उपचारित करें।", "अनुशंसित दूरी रखें।"] },
    precautions: { en: ["Don't sow into waterlogged soil.", "Keep the seed bill for insurance claims."], hi: ["जलभराव वाली मिट्टी में न बोएँ।", "बीमा दावे के लिए बीज का बिल रखें।"] } },
};

export type Sky = "sun" | "cloud" | "rain" | "storm";
export interface DayForecast { day: number; hi: number; lo: number; rainMm: number; windKmh: number; humidity: number; sky: Sky }
export const weatherLocations = ["Nashik, Maharashtra", "Moga, Punjab", "Guntur, Andhra Pradesh"];
export const forecasts: Record<string, DayForecast[]> = {
  "Nashik, Maharashtra": [
    { day: 0, hi: 29, lo: 19, rainMm: 0, windKmh: 8, humidity: 52, sky: "sun" }, { day: 1, hi: 30, lo: 20, rainMm: 0, windKmh: 10, humidity: 50, sky: "sun" },
    { day: 2, hi: 28, lo: 20, rainMm: 2, windKmh: 14, humidity: 64, sky: "cloud" }, { day: 3, hi: 25, lo: 19, rainMm: 18, windKmh: 26, humidity: 86, sky: "storm" },
    { day: 4, hi: 26, lo: 19, rainMm: 9, windKmh: 18, humidity: 80, sky: "rain" }, { day: 5, hi: 28, lo: 18, rainMm: 0, windKmh: 9, humidity: 60, sky: "cloud" },
    { day: 6, hi: 29, lo: 18, rainMm: 0, windKmh: 7, humidity: 55, sky: "sun" }],
  "Moga, Punjab": [
    { day: 0, hi: 31, lo: 17, rainMm: 0, windKmh: 6, humidity: 45, sky: "sun" }, { day: 1, hi: 31, lo: 16, rainMm: 0, windKmh: 7, humidity: 42, sky: "sun" },
    { day: 2, hi: 30, lo: 16, rainMm: 0, windKmh: 9, humidity: 44, sky: "cloud" }, { day: 3, hi: 29, lo: 15, rainMm: 0, windKmh: 11, humidity: 48, sky: "cloud" },
    { day: 4, hi: 30, lo: 15, rainMm: 0, windKmh: 6, humidity: 40, sky: "sun" }, { day: 5, hi: 31, lo: 16, rainMm: 0, windKmh: 5, humidity: 41, sky: "sun" },
    { day: 6, hi: 30, lo: 15, rainMm: 1, windKmh: 12, humidity: 55, sky: "cloud" }],
  "Guntur, Andhra Pradesh": [
    { day: 0, hi: 33, lo: 24, rainMm: 6, windKmh: 15, humidity: 78, sky: "rain" }, { day: 1, hi: 32, lo: 24, rainMm: 22, windKmh: 30, humidity: 88, sky: "storm" },
    { day: 2, hi: 31, lo: 24, rainMm: 12, windKmh: 20, humidity: 84, sky: "rain" }, { day: 3, hi: 32, lo: 23, rainMm: 3, windKmh: 12, humidity: 74, sky: "cloud" },
    { day: 4, hi: 33, lo: 23, rainMm: 0, windKmh: 10, humidity: 68, sky: "sun" }, { day: 5, hi: 34, lo: 24, rainMm: 0, windKmh: 9, humidity: 65, sky: "sun" },
    { day: 6, hi: 33, lo: 24, rainMm: 4, windKmh: 14, humidity: 75, sky: "cloud" }],
};

export const mandiReference: Record<string, number> = { Onion: 1820, Tomato: 1380, Wheat: 2425, "Red Chilli": 17500, Turmeric: 13000, Rice: 4050 };

export interface Article { id: string; category: "crops" | "soil" | "pests" | "schemes" | "market"; title: Bi; summary: Bi; body: { en: string[]; hi: string[] }; minutes: number; image: string }
export const articles: Article[] = [
  { id: "onion-curing", category: "crops", image: onion, minutes: 4, title: { en: "Curing onions for longer storage", hi: "लंबे भंडारण के लिए प्याज़ की क्योरिंग" }, summary: { en: "Proper curing can cut storage losses by a third.", hi: "सही क्योरिंग से भंडारण नुकसान एक-तिहाई तक घटता है।" },
    body: { en: ["Lift bulbs when 50–70% of necks have fallen.", "Leave them in windrows for 3–5 days with leaves covering the bulbs.", "Cut tops leaving 2–2.5 cm, then store in ventilated structures."], hi: ["जब 50–70% गर्दनें गिर जाएँ तब कंद निकालें।", "पत्तियों से ढककर 3–5 दिन कतारों में छोड़ें।", "2–2.5 सें.मी. छोड़कर ऊपरी भाग काटें, फिर हवादार भंडार में रखें।"] } },
  { id: "soil-test", category: "soil", image: wheat, minutes: 3, title: { en: "Why a soil health card pays for itself", hi: "मृदा स्वास्थ्य कार्ड क्यों फ़ायदेमंद है" }, summary: { en: "Know exactly which nutrients your field lacks.", hi: "जानें आपके खेत में कौन-से पोषक तत्व कम हैं।" },
    body: { en: ["Collect soil from 8–10 spots in a zig-zag pattern, 15 cm deep.", "Mix, dry in shade and send 500 g to the soil lab.", "Follow the card's fertiliser recommendation for each crop."], hi: ["टेढ़े-मेढ़े क्रम में 8–10 जगहों से 15 सें.मी. गहराई की मिट्टी लें।", "मिलाएँ, छाँव में सुखाएँ और 500 ग्रा. लैब भेजें।", "हर फसल के लिए कार्ड की खाद सिफ़ारिश मानें।"] } },
  { id: "whitefly", category: "pests", image: tomato, minutes: 5, title: { en: "Managing whitefly in tomato", hi: "टमाटर में सफ़ेद मक्खी का प्रबंधन" }, summary: { en: "An integrated plan that starts before you spray.", hi: "छिड़काव से पहले शुरू होने वाली एकीकृत योजना।" },
    body: { en: ["Use yellow sticky traps from transplanting.", "Grow a border crop of maize to block migration.", "Rotate neem, then selective insecticides only if needed."], hi: ["रोपाई से ही पीले चिपचिपे ट्रैप लगाएँ।", "किनारे पर मक्का लगाएँ ताकि मक्खियाँ रुकें।", "पहले नीम, ज़रूरत हो तभी चुनिंदा कीटनाशक।"] } },
  { id: "pm-kisan", category: "schemes", image: rice, minutes: 3, title: { en: "Government schemes: what to check", hi: "सरकारी योजनाएँ: क्या जाँचें" }, summary: { en: "A checklist for income support and crop insurance enrolment.", hi: "आय सहायता और फसल बीमा नामांकन की जाँच-सूची।" },
    body: { en: ["Keep land records, Aadhaar and bank details linked.", "Enrol in crop insurance before the seasonal cut-off.", "Verify eligibility on the official government portal — this app does not submit applications."], hi: ["भूमि रिकॉर्ड, आधार और बैंक विवरण जुड़े रखें।", "मौसमी अंतिम तिथि से पहले फसल बीमा में नामांकन करें।", "पात्रता आधिकारिक सरकारी पोर्टल पर जाँचें — यह ऐप आवेदन जमा नहीं करता।"] } },
  { id: "grading", category: "market", image: chilli, minutes: 4, title: { en: "Grade before you sell", hi: "बेचने से पहले ग्रेडिंग करें" }, summary: { en: "Buyers pay more for uniform, clearly graded lots.", hi: "खरीदार एकसमान, ग्रेड किए गए माल का अधिक दाम देते हैं।" },
    body: { en: ["Separate by size, colour and damage.", "Photograph each grade in daylight for your listing.", "State the grade honestly — it builds repeat buyers."], hi: ["आकार, रंग और नुकसान के अनुसार अलग करें।", "सूची के लिए दिन की रोशनी में हर ग्रेड की फ़ोटो लें।", "ग्रेड ईमानदारी से बताएँ — इससे खरीदार लौटते हैं।"] } },
  { id: "turmeric-boiling", category: "crops", image: turmeric, minutes: 4, title: { en: "Boiling and drying turmeric", hi: "हल्दी उबालना और सुखाना" }, summary: { en: "Post-harvest steps that decide your price.", hi: "कटाई के बाद के कदम जो दाम तय करते हैं।" },
    body: { en: ["Boil rhizomes until soft (45–60 min).", "Dry on clean floors for 10–15 days.", "Polish to improve colour and grade."], hi: ["कंद नरम होने तक उबालें (45–60 मिनट)।", "साफ़ फ़र्श पर 10–15 दिन सुखाएँ।", "रंग और ग्रेड सुधारने के लिए पॉलिश करें।"] } },
];
