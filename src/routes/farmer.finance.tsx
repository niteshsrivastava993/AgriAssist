import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, financeService } from "@/services/store";
import { profitSummary, projectProfit } from "@/services/calc";
import { expenseCats, mandiReference, type ExpenseCat } from "@/data/mockData";
import { Button, DemoBadge, Field, PageHeader, Segmented, Spinner, inr, inputCls, type FormErrors } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/finance")({
  head: () => ({ meta: [
    { title: "Expenses & Profit — AgriAssist" },
    { name: "description", content: "Record farm expenses and calculate profit per crop." },
    { property: "og:title", content: "Expenses & Profit Calculator — AgriAssist" },
    { property: "og:description", content: "Know your margin before you sell." },
  ] }),
  component: FinancePage,
});

function FinancePage() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const crops = db.crops.filter((c) => c.farmerId === user?.id);
  const [cropId, setCropId] = useState<string>(crops[0]?.id ?? "all");
  const exp = db.expenses.filter((e) => e.farmerId === user?.id && (cropId === "all" || e.cropId === cropId));
  const rev = db.revenues.filter((r) => r.farmerId === user?.id && (cropId === "all" || r.cropId === cropId));
  const sum = profitSummary(exp, rev);
  const byCat = expenseCats.map((c) => ({ c, v: exp.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter((x) => x.v > 0);
  const max = Math.max(1, ...byCat.map((x) => x.v));
  const crop = crops.find((c) => c.id === cropId);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navFinance")} title={<>{t("netSoFar")} <span className={sum.profit >= 0 ? "text-primary" : "text-destructive"}>{inr(sum.profit)}</span></>} sub={t("financeSub")} />
      <div className="mt-8 overflow-x-auto"><Segmented label={t("crop")} value={cropId} onChange={setCropId} options={[...crops.map((c) => ({ id: c.id, label: c.name })), { id: "all", label: t("allCrops") }]} /></div>

      <section className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 border-b border-border pb-6">
            <div><dt className="text-sm text-muted-foreground">{t("spent")}</dt><dd className="font-display text-3xl font-semibold">{inr(sum.cost)}</dd></div>
            <div><dt className="text-sm text-muted-foreground">{t("earned")}</dt><dd className="font-display text-3xl font-semibold">{inr(sum.income)}</dd></div>
            <div><dt className="text-sm text-muted-foreground">{t("costPerQtl")}</dt><dd className="font-display text-3xl font-semibold">{sum.costPerQtl ? inr(sum.costPerQtl) : "—"}</dd></div>
          </dl>
          <h2 className="mt-8 text-xl font-semibold">{t("whereMoneyWent")}</h2>
          <ul className="mt-4 space-y-3">
            {byCat.map((x) => (
              <li key={x.c} className="grid grid-cols-12 items-center gap-3 text-sm">
                <span className="col-span-3 font-semibold">{t(`cat_${x.c}` as Key)}</span>
                <span className="col-span-7 h-3 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(x.v / max) * 100}%` }} /></span>
                <span className="col-span-2 text-right">{inr(x.v)}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-xl font-semibold">{t("ledger")}</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {rev.map((r) => <li key={r.id} className="flex items-center justify-between gap-3 p-4 text-sm"><span><span className="font-semibold text-primary">+ {t("sale")}</span> · {r.qtl} qtl × {inr(r.pricePerQtl)} · {r.buyer}</span><span className="flex items-center gap-2">{r.isSample && <DemoBadge />}<span className="font-semibold text-primary">{inr(r.qtl * r.pricePerQtl)}</span></span></li>)}
            {exp.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <span><span className="font-semibold">{t(`cat_${e.category}` as Key)}</span> · {e.note} <span className="text-muted-foreground">· {d(e.date)}</span></span>
                <span className="flex items-center gap-2">{e.isSample && <DemoBadge />}<span className="font-semibold">− {inr(e.amount)}</span>
                  <button aria-label={t("remove")} onClick={() => { financeService.removeExpense(e.id); toast.success(t("expenseRemoved")); }} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><Trash2 className="h-4 w-4" /></button></span>
              </li>
            ))}
            {exp.length + rev.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">{t("noEntries")}</li>}
          </ul>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <EntryForm crops={crops} defaultCrop={cropId === "all" ? crops[0]?.id ?? "" : cropId} />
          <Calculator cost={sum.cost} cropName={crop?.name} />
        </div>
      </section>
    </div>
  );
}

function EntryForm({ crops, defaultCrop }: { crops: { id: string; name: string }[]; defaultCrop: string }) {
  const { user } = useAuth();
  const { t } = useT();
  const [mode, setMode] = useState<"expense" | "sale">("expense");
  const [f, setF] = useState({ cropId: defaultCrop, category: "seed" as ExpenseCat, amount: "", note: "", qtl: "", price: "", date: new Date().toISOString().slice(0, 10) });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const cid = f.cropId || defaultCrop;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (!cid) er.cropId = t("errPickCrop");
    if (mode === "expense" && !(Number(f.amount) > 0)) er.amount = t("errAmount");
    if (mode === "sale" && !(Number(f.qtl) > 0)) er.qtl = t("errQty");
    if (mode === "sale" && !(Number(f.price) > 0)) er.price = t("errAmount");
    setErrors(er);
    if (Object.keys(er).length || !user) return;
    setLoading(true);
    if (mode === "expense") await financeService.addExpense({ farmerId: user.id, cropId: cid, category: f.category, amount: Number(f.amount), date: f.date, note: f.note.trim() || t(`cat_${f.category}` as Key) });
    else await financeService.addRevenue({ farmerId: user.id, cropId: cid, qtl: Number(f.qtl), pricePerQtl: Number(f.price), date: f.date, buyer: f.note.trim() || t("directSale") });
    setLoading(false); setF({ ...f, amount: "", note: "", qtl: "", price: "" });
    toast.success(mode === "expense" ? t("expenseAdded") : t("saleAdded"));
  };
  return (
    <form onSubmit={submit} noValidate className="clay space-y-4 p-6">
      <Segmented label={t("type")} value={mode} onChange={setMode} options={[{ id: "expense", label: t("addExpense") }, { id: "sale", label: t("addSale") }]} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("crop")} error={errors.cropId}><select className={inputCls} value={cid} onChange={(e) => setF({ ...f, cropId: e.target.value })}>{crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label={t("date")}><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      </div>
      {mode === "expense" ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("category")}><select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as ExpenseCat })}>{expenseCats.map((c) => <option key={c} value={c}>{t(`cat_${c}` as Key)}</option>)}</select></Field>
          <Field label={t("amountRs")} error={errors.amount}><input inputMode="numeric" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("qtyQtl")} error={errors.qtl}><input inputMode="decimal" className={inputCls} value={f.qtl} onChange={(e) => setF({ ...f, qtl: e.target.value })} /></Field>
          <Field label={t("pricePerQtl")} error={errors.price}><input inputMode="numeric" className={inputCls} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
        </div>
      )}
      <Field label={mode === "expense" ? t("note") : t("soldTo")}><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      <Button type="submit" disabled={loading} className="w-full">{loading ? <Spinner /> : <Plus className="h-4 w-4" />}{t("save")}</Button>
    </form>
  );
}

function Calculator({ cost, cropName }: { cost: number; cropName?: string | undefined }) {
  const { t } = useT();
  const ref = cropName ? mandiReference[cropName] : undefined;
  const [yieldQ, setYieldQ] = useState("100");
  const [price, setPrice] = useState(String(ref ?? 2000));
  const [extra, setExtra] = useState("0");
  const p = projectProfit(cost + (Number(extra) || 0), Number(yieldQ) || 0, Number(price) || 0);
  return (
    <div className="clay-sage space-y-4 p-6">
      <h2 className="text-xl font-semibold">{t("profitCalculator")}</h2>
      <div className="grid grid-cols-3 gap-3">
        <Field label={t("expectedYield")}><input inputMode="decimal" className={inputCls} value={yieldQ} onChange={(e) => setYieldQ(e.target.value)} /></Field>
        <Field label={t("pricePerQtl")}><input inputMode="numeric" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
        <Field label={t("moreCosts")}><input inputMode="numeric" className={inputCls} value={extra} onChange={(e) => setExtra(e.target.value)} /></Field>
      </div>
      {ref && <p className="flex items-center gap-2 text-xs text-secondary-foreground">{t("refPrice", { price: inr(ref) })} <DemoBadge /></p>}
      <div className="rounded-xl bg-card p-4">
        <p className="text-sm text-muted-foreground">{t("projectedProfit")}</p>
        <p className={cn("font-display text-4xl font-semibold", p.profit >= 0 ? "text-primary" : "text-destructive")}>{inr(p.profit)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("income")} {inr(p.income)} · {t("breakEven")} {p.breakEvenPrice ? inr(p.breakEvenPrice) : "—"}/qtl</p>
      </div>
    </div>
  );
}
