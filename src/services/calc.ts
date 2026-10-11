// Pure business rules — no storage, easy to test and reuse server-side later.
import { diseaseLibrary, type Expense, type Revenue, type Listing, type QtyUnit, type SaleMode } from "@/data/mockData";

export function profitSummary(expenses: Pick<Expense, "amount">[], revenues: Pick<Revenue, "qtl" | "pricePerQtl">[]) {
  const cost = expenses.reduce((s, e) => s + e.amount, 0);
  const qtl = revenues.reduce((s, r) => s + r.qtl, 0);
  const income = revenues.reduce((s, r) => s + r.qtl * r.pricePerQtl, 0);
  return { cost, income, profit: income - cost, qtl, costPerQtl: qtl > 0 ? Math.round(cost / qtl) : null };
}

/** Projected profit for an expected yield and price. */
export function projectProfit(cost: number, yieldQtl: number, pricePerQtl: number) {
  const income = yieldQtl * pricePerQtl;
  return { income, profit: income - cost, breakEvenPrice: yieldQtl > 0 ? Math.ceil(cost / yieldQtl) : null };
}

/** Simulated (rule-based) diagnosis: best symptom overlap wins. Not a real AI model. */
export function diagnose(symptoms: string[]) {
  if (symptoms.length === 0) return null;
  const scored = diseaseLibrary
    .map((d) => {
      const hit = d.symptoms.filter((s) => symptoms.includes(s)).length;
      return { d, hit, score: hit / Math.max(d.symptoms.length, symptoms.length) };
    })
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  return { diseaseId: best.d.id, confidence: Math.min(92, Math.round(40 + best.score * 52)) };
}

// ---------- Sale modes & units ----------

export const KG_PER_UNIT: Record<QtyUnit, number> = { kg: 1, qtl: 100, ton: 1000 };
export const unitsFor = (mode: SaleMode): QtyUnit[] => (mode === "regular" ? ["kg", "qtl"] : ["qtl", "ton"]);
export const toQtl = (qty: number, unit: QtyUnit) => (qty * KG_PER_UNIT[unit]) / 100;
export const fromQtl = (qtl: number, unit: QtyUnit) => (qtl * 100) / KG_PER_UNIT[unit];
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Listing price expressed per chosen unit for a sale mode, or null if the mode is off. */
export function priceIn(l: Pick<Listing, "regular" | "bulk">, mode: SaleMode, unit: QtyUnit): number | null {
  if (mode === "regular") return l.regular ? round2(l.regular.pricePerKg * KG_PER_UNIT[unit]) : null;
  return l.bulk ? round2((l.bulk.pricePerQtl * KG_PER_UNIT[unit]) / 100) : null;
}
/** Minimum order for a mode, in quintals. */
export function minQtl(l: Pick<Listing, "regular" | "bulk">, mode: SaleMode): number {
  return mode === "regular" ? (l.regular ? l.regular.minKg / 100 : 0) : (l.bulk?.minQtl ?? 0);
}
export const saleModesOf = (l: Pick<Listing, "regular" | "bulk">): SaleMode[] => [...(l.regular ? ["regular" as const] : []), ...(l.bulk ? ["bulk" as const] : [])];

export type OrderError = "errQty" | "errModeOff" | "errBelowMin" | "errOverStock";
/** Validates a buyer order against the listing's shared stock and mode minimum. */
export function validateOrder(l: Pick<Listing, "regular" | "bulk" | "quantityQtl">, mode: SaleMode, unit: QtyUnit, qty: number): OrderError | null {
  if (!(qty > 0) || !Number.isFinite(qty)) return "errQty";
  if (!saleModesOf(l).includes(mode) || !unitsFor(mode).includes(unit)) return "errModeOff";
  const q = toQtl(qty, unit);
  if (q > l.quantityQtl + 1e-9) return "errOverStock";
  if (q + 1e-9 < minQtl(l, mode)) return "errBelowMin";
  return null;
}

// ---------- Distance ----------
export interface LatLng { lat: number; lng: number }
export const validLatLng = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
/** Great-circle distance in km (Haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** Distance from origin to a farmer, or null when either location is unknown (never invented). */
type MaybeLoc = { lat?: number | undefined; lng?: number | undefined } | null | undefined;
export function distanceKm(origin: MaybeLoc, farmer: MaybeLoc): number | null {
  if (origin?.lat == null || origin.lng == null || farmer?.lat == null || farmer.lng == null) return null;
  return haversineKm(origin as LatLng, farmer as LatLng);
}
