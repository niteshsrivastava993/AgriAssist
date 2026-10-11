import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Store, Stethoscope, CalendarDays } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useDB, farmService } from "@/services/store";
import { profitSummary } from "@/services/calc";
import { stages, diseaseLibrary, type Stage } from "@/data/mockData";
import { Button, DemoBadge, Empty, buttonVariants, inr, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/crops/$cropId")({
  head: () => ({ meta: [
    { title: "Crop details — AgriAssist" },
    { name: "description", content: "Stage, costs, tasks and health history for one crop." },
    { property: "og:title", content: "Crop details — AgriAssist" },
    { property: "og:description", content: "Everything about one crop in one place." },
  ] }),
  component: CropDetail,
});

function CropDetail() {
  const { cropId } = Route.useParams();
  const { user } = useAuth();
  const { t, d, pick } = useT();
  const db = useDB();
  const crop = db.crops.find((c) => c.id === cropId && c.farmerId === user?.id);
  const [notes, setNotes] = useState(crop?.notes ?? "");

  if (!crop) return (
    <div className="mx-auto max-w-3xl px-5 py-20"><Empty action={<Link to="/farmer/crops" className={buttonVariants({ variant: "soft" })}>{t("backToCrops")}</Link>}>{t("cropNotFound")}</Empty></div>
  );
  const field = db.fields.find((f) => f.id === crop.fieldId);
  const expenses = db.expenses.filter((e) => e.cropId === crop.id);
  const sum = profitSummary(expenses, db.revenues.filter((r) => r.cropId === crop.id));
  const events = db.events.filter((e) => e.cropId === crop.id).sort((a, b) => a.date.localeCompare(b.date));
  const reports = db.reports.filter((r) => r.cropId === crop.id);
  const setStage = async (s: Stage) => { await farmService.updateCrop(crop.id, { stage: s }); toast.success(t("stageUpdated")); };

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <Link to="/farmer/crops" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />{t("backToCrops")}</Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[2rem] lg:col-span-7">
          <img src={crop.image} alt={crop.name} className="aspect-[16/10] w-full object-cover" />
          <div className="grain-overlay absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-ivory">
            <p className="eyebrow !text-ivory/75">{field?.name} · {field?.areaAcres} {t("acres")}</p>
            <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{crop.name} · {crop.variety}</h1>
            <p className="mt-2 text-sm">{t("sownOn")} {d(crop.sownOn)} → {t("expectedHarvest")} {d(crop.expectedHarvest)}</p>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <div className="clay-sage p-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{t("growthStage")}</h2>{crop.isSample && <DemoBadge />}</div>
            <ol className="mt-4 grid grid-cols-3 gap-2">
              {stages.map((s, i) => {
                const reached = i <= stages.indexOf(crop.stage);
                return <li key={s}><button onClick={() => setStage(s)} aria-pressed={crop.stage === s}
                  className={cn("w-full rounded-xl px-2 py-2 text-xs font-semibold transition", crop.stage === s ? "bg-primary text-primary-foreground" : reached ? "bg-card text-primary" : "bg-card/50 text-muted-foreground hover:bg-card")}>{t(`stage_${s}` as Key)}</button></li>;
              })}
            </ol>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/farmer/listings" search={{ crop: crop.name }} className={buttonVariants({ variant: "harvest" })}><Store className="h-4 w-4" />{t("listThisCrop")}</Link>
            <Link to="/farmer/health" search={{ crop: crop.id }} className={buttonVariants({ variant: "outline" })}><Stethoscope className="h-4 w-4" />{t("checkHealth")}</Link>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="notes">{t("notes")}</label>
            <textarea id="notes" rows={3} className={cn(inputCls, "mt-1.5")} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button size="sm" variant="soft" className="mt-2" onClick={async () => { await farmService.updateCrop(crop.id, { notes }); toast.success(t("saved")); }}>{t("saveNotes")}</Button>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-semibold">{t("costSoFar")}</h2>
          <p className="mt-2 font-display text-4xl font-semibold text-primary">{inr(sum.cost)}</p>
          <ul className="mt-4 space-y-2 text-sm">{expenses.map((e) => <li key={e.id} className="flex justify-between border-b border-border pb-2"><span>{t(`cat_${e.category}` as Key)} · {e.note}</span><span className="font-semibold">{inr(e.amount)}</span></li>)}</ul>
          <Link to="/farmer/finance" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">{t("openFinance")} →</Link>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t("upcomingTasks")}</h2>
          {events.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{t("noTasks")}</p> :
            <ul className="mt-4 space-y-3">{events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 text-sm"><CalendarDays className="h-4 w-4 text-accent" /><span className={cn("flex-1", e.done && "line-through text-muted-foreground")}>{e.title}</span><span className="text-muted-foreground">{d(e.date)}</span></li>))}</ul>}
          <Link to="/farmer/calendar" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">{t("openCalendar")} →</Link>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t("healthHistory")}</h2>
          {reports.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{t("noReports")}</p> :
            <ul className="mt-4 space-y-3">{reports.map((r) => {
              const dz = diseaseLibrary.find((x) => x.id === r.diseaseId);
              return <li key={r.id} className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">{dz ? pick(dz.name) : "—"}</p><p className="text-muted-foreground">{d(r.createdAt)} · {r.confidence}%</p></li>;
            })}</ul>}
        </div>
      </section>
    </div>
  );
}
