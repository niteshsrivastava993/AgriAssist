import { beforeEach, describe, expect, it } from "vitest";
import { profitSummary, projectProfit, diagnose } from "@/services/calc";
import { authService, marketService, adminService, getDB, __resetForTests } from "@/services/store";

beforeEach(() => { localStorage.clear(); __resetForTests(); });

describe("business rules", () => {
  it("profit = income minus cost, cost per qtl over quantity sold", () => {
    const s = profitSummary([{ amount: 6000 }, { amount: 4000 }], [{ qtl: 10, pricePerQtl: 1500 }]);
    expect(s).toMatchObject({ cost: 10000, income: 15000, profit: 5000, costPerQtl: 1000 });
  });
  it("break-even price rounds up cost per quintal", () => {
    expect(projectProfit(10001, 10, 1200).breakEvenPrice).toBe(1001);
  });
  it("whitefly symptoms diagnose whitefly", () => {
    expect(diagnose(["whiteInsects", "curl"])?.diseaseId).toBe("whitefly");
    expect(diagnose([])).toBeNull();
  });
  it("suspended users cannot log in", async () => {
    await adminService.setUserStatus("u-buyer", "suspended");
    await expect(authService.login("buyer@agriassist.in", "buyer123")).rejects.toThrow("suspended");
  });
  it("admins cannot be suspended", async () => {
    await expect(adminService.setUserStatus("u-admin", "suspended")).rejects.toThrow();
  });
  it("a purchase request notifies the listing's farmer; accepting notifies the buyer", async () => {
    const r = await marketService.createRequest({ listingId: "l1", buyerId: "u-buyer", buyerName: "Anita", buyerBusiness: "Pune", mode: "bulk", unit: "qtl", quantity: 15, unitPrice: 1800, message: "" });
    expect(getDB().notices.some((n) => n.userId === "u-farmer" && n.key === "nNewRequest" && n.params["buyer"] === "Anita")).toBe(true);
    await marketService.setRequestStatus(r.id, "accepted");
    expect(getDB().notices.some((n) => n.userId === "u-buyer" && n.key === "nAccepted")).toBe(true);
  });
});

import { haversineKm, distanceKm, validateOrder, toQtl, priceIn } from "@/services/calc";

describe("sale modes & shared stock", () => {
  const lot = { quantityQtl: 10, regular: { pricePerKg: 20, minKg: 50 }, bulk: { pricePerQtl: 1900, minQtl: 2 } };
  it("converts units: 1 qtl = 100 kg, 1 ton = 10 qtl", () => {
    expect(toQtl(250, "kg")).toBe(2.5);
    expect(toQtl(1, "ton")).toBe(10);
    expect(priceIn(lot, "bulk", "ton")).toBe(19000);
    expect(priceIn(lot, "regular", "qtl")).toBe(2000);
  });
  it("enforces minimum order per mode and the shared stock", () => {
    expect(validateOrder(lot, "regular", "kg", 40)).toBe("errBelowMin");
    expect(validateOrder(lot, "regular", "kg", 50)).toBeNull();
    expect(validateOrder(lot, "bulk", "qtl", 1)).toBe("errBelowMin");
    expect(validateOrder(lot, "bulk", "ton", 1.1)).toBe("errOverStock");
    expect(validateOrder({ quantityQtl: 10, bulk: lot.bulk }, "regular", "kg", 100)).toBe("errModeOff");
  });
  it("accepting deducts shared stock and refuses to oversell; cancelling an order returns stock", async () => {
    // l1 Onion: 120 qtl, regular + bulk
    const a = await marketService.createRequest({ listingId: "l1", buyerId: "u-buyer", buyerName: "A", buyerBusiness: "", mode: "bulk", unit: "ton", quantity: 10, unitPrice: 18500, message: "" });
    const b = await marketService.createRequest({ listingId: "l1", buyerId: "u-buyer", buyerName: "A", buyerBusiness: "", mode: "regular", unit: "kg", quantity: 5000, unitPrice: 22, message: "" });
    expect(a.quantityQtl).toBe(100);
    expect(a.quantity * a.unitPrice).toBe(185000);
    await marketService.setRequestStatus(a.id, "accepted");
    expect(getDB().listings.find((l) => l.id === "l1")!.quantityQtl).toBe(20);
    await expect(marketService.setRequestStatus(b.id, "accepted")).rejects.toThrow("errOverStock");
    expect(getDB().listings.find((l) => l.id === "l1")!.quantityQtl).toBe(20);
    await marketService.cancelRequest(a.id);
    expect(getDB().listings.find((l) => l.id === "l1")!.quantityQtl).toBe(120);
    expect(getDB().requests.find((r) => r.id === a.id)!.status).toBe("cancelled");
  });
  it("rejects requests above stock at creation", async () => {
    await expect(marketService.createRequest({ listingId: "l2", buyerId: "u-buyer", buyerName: "A", buyerBusiness: "", mode: "regular", unit: "kg", quantity: 4001, unitPrice: 16, message: "" })).rejects.toThrow("errOverStock");
  });
});

describe("distance", () => {
  it("haversine: 1° latitude ≈ 111.2 km", () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });
  it("never invents a distance when a location is missing", () => {
    expect(distanceKm(null, { lat: 1, lng: 1 })).toBeNull();
    expect(distanceKm({ lat: 1, lng: 1 }, {})).toBeNull();
  });
  it("demo farmers near Lasalgaon fall in 5 / 10 / 15 km bands", () => {
    const db = getDB(); const at = (id: string) => db.users.find((u) => u.id === id)!;
    const o = at("u-farmer");
    expect(distanceKm(o, at("u-f7"))!).toBeLessThan(5);
    const k8 = distanceKm(o, at("u-f8"))!; expect(k8).toBeGreaterThan(5); expect(k8).toBeLessThan(10);
    const k9 = distanceKm(o, at("u-f9"))!; expect(k9).toBeGreaterThan(10); expect(k9).toBeLessThan(15);
  });
});
