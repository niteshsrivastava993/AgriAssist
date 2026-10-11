// Data-access layer. Today backed by localStorage + mock data;
// swap these functions for fetch() calls to the Express API later.
import { useSyncExternalStore } from "react";
import {
  demoUsers, extraUsers, sampleListings, sampleRequests, sampleFields, sampleCropRecords, sampleEvents,
  sampleExpenses, sampleRevenues, sampleNotices, sampleReports, advisoryLibrary, cropImages,
  type Listing, type PurchaseRequest, type User, type FarmField, type Crop, type CalEvent, type Expense,
  type Revenue, type Notice, type HealthReport, type Concern,
} from "@/data/mockData";
import { diagnose, validateOrder, toQtl } from "./calc";

export interface DB {
  users: User[]; listings: Listing[]; requests: PurchaseRequest[]; fields: FarmField[]; crops: Crop[];
  events: CalEvent[]; expenses: Expense[]; revenues: Revenue[]; notices: Notice[]; reports: HealthReport[];
}
const KEY = "agriassist.db.v3";
const listeners = new Set<() => void>();
let cache: DB | null = null;
const seed = (): DB => ({
  users: [...demoUsers, ...extraUsers], listings: [...sampleListings], requests: [...sampleRequests],
  fields: [...sampleFields], crops: [...sampleCropRecords], events: [...sampleEvents], expenses: [...sampleExpenses],
  revenues: [...sampleRevenues], notices: [...sampleNotices], reports: [...sampleReports],
});

function read(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try { cache = { ...seed(), ...(JSON.parse(localStorage.getItem(KEY) || "") as Partial<DB>) }; } catch { cache = seed(); }
  return cache;
}
function write(db: DB) {
  cache = { ...db };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}
const SERVER_SNAPSHOT = seed();
export function useDB(): DB {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => SERVER_SNAPSHOT,
  );
}
/** Test hook: reset in-memory state. */
export function __resetForTests() { cache = seed(); }
export const getDB = () => read();

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const today = () => new Date().toISOString().slice(0, 10);
const notice = (n: Omit<Notice, "id" | "read" | "createdAt">): Notice => ({ ...n, id: uid("n"), read: false, createdAt: today() });

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay();
    const u = read().users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.password !== password) throw new Error("invalid");
    if (u.status === "suspended") throw new Error("suspended");
    return u;
  },
  async register(input: { name: string; email: string; password: string; role: "farmer" | "buyer" }): Promise<User> {
    await delay();
    const db = read();
    if (db.users.some((x) => x.email.toLowerCase() === input.email.toLowerCase())) throw new Error("exists");
    const u: User = { id: `u-${Date.now()}`, location: "India", status: "active", ...input };
    write({ ...db, users: [...db.users, u] });
    return u;
  },
  async updateProfile(id: string, patch: Partial<Pick<User, "name" | "location" | "phone" | "prefs" | "lat" | "lng" | "locIsSample">>) {
    await delay(300);
    const db = read();
    write({ ...db, users: db.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
    return read().users.find((u) => u.id === id)!;
  },
};

export const marketService = {
  /** Buyer enters quantity + price in their chosen unit; normalised qtl values are derived here. */
  async createRequest(r: Omit<PurchaseRequest, "id" | "status" | "createdAt" | "isSample" | "quantityQtl" | "offerPerQtl">) {
    await delay();
    const db = read();
    const l = db.listings.find((x) => x.id === r.listingId);
    if (!l || l.status !== "active") throw new Error("unavailable");
    const err = validateOrder(l, r.mode, r.unit, r.quantity);
    if (err) throw new Error(err);
    if (!(r.unitPrice > 0)) throw new Error("errOffer");
    const qtl = toQtl(r.quantity, r.unit);
    const req: PurchaseRequest = { ...r, quantityQtl: qtl, offerPerQtl: (r.quantity * r.unitPrice) / qtl, id: uid("r"), status: "pending", createdAt: today(), isSample: false };
    const n = l ? [notice({ userId: l.farmerId, key: "nNewRequest", params: { buyer: r.buyerName, crop: l.crop, qty: req.quantityQtl }, kind: "market", link: "/farmer/requests" })] : [];
    write({ ...db, requests: [req, ...db.requests], notices: [...n, ...db.notices] });
    return req;
  },
  /** Accepting deducts from the lot's shared stock (regular + bulk) and refuses to oversell. */
  async setRequestStatus(id: string, status: "accepted" | "rejected") {
    await delay(300);
    const db = read();
    const r = db.requests.find((x) => x.id === id);
    const l = r && db.listings.find((x) => x.id === r.listingId);
    if (!r || !l || r.status !== "pending") throw new Error("notPending");
    let listings = db.listings;
    if (status === "accepted") {
      if (r.quantityQtl > l.quantityQtl + 1e-9) throw new Error("errOverStock");
      const left = Math.round((l.quantityQtl - r.quantityQtl) * 100) / 100;
      listings = db.listings.map((x) => (x.id === l.id ? { ...x, quantityQtl: left, status: left <= 0 ? "sold" : x.status } : x));
    }
    const n = [notice({ userId: r.buyerId, key: status === "accepted" ? "nAccepted" : "nRejected", params: { farmer: l.farmerName, crop: l.crop }, kind: "market", link: "/buyer" })];
    write({ ...db, listings, requests: db.requests.map((x) => (x.id === id ? { ...x, status } : x)), notices: [...n, ...db.notices] });
  },
  /** Buyer cancels a pending request, or an accepted order (stock is returned to the lot). */
  async cancelRequest(id: string) {
    await delay(300);
    const db = read();
    const r = db.requests.find((x) => x.id === id);
    if (!r || (r.status !== "pending" && r.status !== "accepted")) throw new Error("notCancellable");
    const l = db.listings.find((x) => x.id === r.listingId);
    const listings = r.status === "accepted" && l
      ? db.listings.map((x) => (x.id === l.id ? { ...x, quantityQtl: Math.round((x.quantityQtl + r.quantityQtl) * 100) / 100, status: x.status === "sold" ? "active" : x.status } : x))
      : db.listings;
    const n = l ? [notice({ userId: l.farmerId, key: "nCancelled", params: { buyer: r.buyerName, crop: l.crop }, kind: "market", link: "/farmer/requests" })] : [];
    write({ ...db, listings, requests: db.requests.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)), notices: [...n, ...db.notices] });
  },
  async createListing(l: Omit<Listing, "id" | "status" | "isSample" | "image"> & { image?: string }) {
    await delay();
    const db = read();
    const listing: Listing = { ...l, image: l.image ?? cropImages[l.crop] ?? cropImages["Wheat"]!, id: uid("l"), status: "active", isSample: false };
    write({ ...db, listings: [listing, ...db.listings] });
    return listing;
  },
  async updateListing(id: string, patch: Partial<Pick<Listing, "pricePerQtl" | "quantityQtl" | "status" | "availableFrom" | "regular" | "bulk">>) {
    await delay(250);
    const db = read();
    write({ ...db, listings: db.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  },
  async deleteListing(id: string) {
    await delay(250);
    const db = read();
    write({ ...db, listings: db.listings.filter((l) => l.id !== id), requests: db.requests.filter((r) => r.listingId !== id) });
  },
  resetDemo() { write(seed()); },
};

export const farmService = {
  async addField(f: Omit<FarmField, "id" | "isSample">) { await delay(250); const db = read(); write({ ...db, fields: [...db.fields, { ...f, id: uid("f"), isSample: false }] }); },
  async removeField(id: string) {
    await delay(250); const db = read();
    if (db.crops.some((c) => c.fieldId === id && c.stage !== "harvested")) throw new Error("hasCrops");
    write({ ...db, fields: db.fields.filter((f) => f.id !== id) });
  },
  async addCrop(c: Omit<Crop, "id" | "isSample" | "image">) {
    await delay(250); const db = read();
    const crop: Crop = { ...c, image: cropImages[c.name] ?? cropImages["Wheat"]!, id: uid("c"), isSample: false };
    write({ ...db, crops: [...db.crops, crop] }); return crop;
  },
  async updateCrop(id: string, patch: Partial<Pick<Crop, "stage" | "notes" | "expectedHarvest">>) { await delay(200); const db = read(); write({ ...db, crops: db.crops.map((c) => (c.id === id ? { ...c, ...patch } : c)) }); },
  async addEvent(e: Omit<CalEvent, "id" | "done" | "isSample">) { await delay(200); const db = read(); write({ ...db, events: [...db.events, { ...e, id: uid("e"), done: false, isSample: false }] }); },
  async toggleEvent(id: string) { const db = read(); write({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e)) }); },
  async removeEvent(id: string) { const db = read(); write({ ...db, events: db.events.filter((e) => e.id !== id) }); },
};

export const financeService = {
  async addExpense(e: Omit<Expense, "id" | "isSample">) { await delay(250); const db = read(); write({ ...db, expenses: [{ ...e, id: uid("x"), isSample: false }, ...db.expenses] }); },
  async removeExpense(id: string) { const db = read(); write({ ...db, expenses: db.expenses.filter((e) => e.id !== id) }); },
  async addRevenue(r: Omit<Revenue, "id" | "isSample">) { await delay(250); const db = read(); write({ ...db, revenues: [{ ...r, id: uid("v"), isSample: false }, ...db.revenues] }); },
};

export const noticeService = {
  markRead(id: string) { const db = read(); write({ ...db, notices: db.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) }); },
  markAllRead(userId: string) { const db = read(); write({ ...db, notices: db.notices.map((n) => (n.userId === userId ? { ...n, read: true } : n)) }); },
  remove(id: string) { const db = read(); write({ ...db, notices: db.notices.filter((n) => n.id !== id) }); },
};

/** Simulated advisory + diagnosis — rule-based demo, no AI model is called. */
export const advisoryService = {
  async ask(concern: Concern) { await delay(900); return advisoryLibrary[concern]; },
  async checkHealth(farmerId: string, cropId: string, symptoms: string[], photo?: string) {
    await delay(1100);
    const res = diagnose(symptoms);
    if (!res) throw new Error("noMatch");
    const report: HealthReport = { id: uid("h"), farmerId, cropId, symptoms, photo, ...res, createdAt: today(), isSample: false };
    const db = read();
    write({ ...db, reports: [report, ...db.reports] });
    return report;
  },
};

export const adminService = {
  async setUserStatus(id: string, status: "active" | "suspended") {
    await delay(250); const db = read();
    const target = db.users.find((u) => u.id === id);
    if (target?.role === "admin") throw new Error("adminProtected");
    write({ ...db, users: db.users.map((u) => (u.id === id ? { ...u, status } : u)) });
  },
  async setListingStatus(id: string, status: Listing["status"]) { await delay(250); const db = read(); write({ ...db, listings: db.listings.map((l) => (l.id === id ? { ...l, status } : l)) }); },
};
