import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, farmService } from "@/services/store";
import { cropOptions, stages, type Stage } from "@/data/mockData";
import { Button, DemoBadge, Drawer, Empty, Field, PageHeader, Segmented, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/crops/")({
  head: () => ({ meta: [
    { title: "Crops — AgriAssist" },
    { name: "description", content: "Track every crop from sowing to harvest." },
    { property: "og:title", content: "Crops — AgriAssist" },
    { property: "og:description", content: "Your crops, stages and harvest dates." },
  ] }),
  component: CropsPage,
});


const progressOf = (s: Stage) => Math.round(((stages.indexOf(s) + 1) / stages.length) * 100);

function CropsPage() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const [filter, setFilter] = useState<"growing" | "harvested" | "all">("growing");
  const [adding, setAdding] = useState(false);
  const crops = db.crops.filter((c) => c.farmerId === user?.id && (filter === "all" || (filter === "harvested" ? c.stage === "harvested" : c.stage !== "harvested")));

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navCrops")} title={t("cropsTitle")} sub={t("cropsSub")}
        actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />{t("addCrop")}</Button>} />
      <div className="mt-8"><Segmented label={t("filter")} value={filter} onChange={setFilter} options={[{ id: "growing", label: t("growing") }, { id: "harvested", label: t("stage_harvested") }, { id: "all", label: t("all") }]} /></div>
      {crops.length === 0 ? <div className="mt-8"><Empty>{t("noCrops")}</Empty></div> : (
        <ul className="mt-8 space-y-4">
          {crops.map((c) => {
            const field = db.fields.find((f) => f.id === c.fieldId);
            const p = progressOf(c.stage);
            return (
              <li key={c.id}>
                <Link to="/farmer/crops/$cropId" params={{ cropId: c.id }} className="lift grid items-center gap-5 rounded-3xl border border-border bg-card p-4 md:grid-cols-12">
                  <img src={c.image} alt={c.name} className="aspect-[4/3] w-full rounded-2xl object-cover md:col-span-2" />
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2"><h2 className="text-2xl font-semibold">{c.name}</h2>{c.isSample && <DemoBadge />}</div>
                    <p className="text-sm text-muted-foreground">{c.variety} · {field?.name ?? "—"}</p>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between text-sm"><span className="font-semibold">{t(`stage_${c.stage}` as Key)}</span><span className="text-muted-foreground">{p}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p}%` }} /></div>
                  </div>
                  <div className="text-sm md:col-span-2 md:text-right">
                    <p className="text-muted-foreground">{t("expectedHarvest")}</p>
                    <p className="font-semibold">{d(c.expectedHarvest)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {adding && <AddCrop onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddCrop({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useT();
  const db = useDB();
  const fields = db.fields.filter((f) => f.farmerId === user?.id);
  const [f, setF] = useState({ name: cropOptions[0]!, variety: "", fieldId: fields[0]?.id ?? "", sownOn: "", expectedHarvest: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (!f.variety.trim()) er.variety = t("errRequired");
    if (!f.fieldId) er.fieldId = t("errNoField");
    if (!f.sownOn) er.sownOn = t("errDate");
    if (!f.expectedHarvest) er.expectedHarvest = t("errDate");
    else if (f.sownOn && f.expectedHarvest <= f.sownOn) er.expectedHarvest = t("errHarvestAfter");
    setErrors(er);
    if (Object.keys(er).length || !user) return;
    setLoading(true);
    await farmService.addCrop({ farmerId: user.id, name: f.name, variety: f.variety.trim(), fieldId: f.fieldId, sownOn: f.sownOn, expectedHarvest: f.expectedHarvest, stage: "sown", notes: "" });
    setLoading(false); toast.success(t("cropAdded")); onClose();
  };
  return (
    <Drawer title={t("addCrop")} eyebrow={t("navCrops")} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5">
        <Field label={t("crop")}><select className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}>{cropOptions.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label={t("variety")} error={errors.variety}><input className={inputCls} value={f.variety} onChange={(e) => setF({ ...f, variety: e.target.value })} /></Field>
        <Field label={t("field")} error={errors.fieldId}>
          {fields.length === 0 ? <Link to="/farmer/fields" className="text-sm font-semibold text-primary underline">{t("addField")}</Link> :
            <select className={inputCls} value={f.fieldId} onChange={(e) => setF({ ...f, fieldId: e.target.value })}>{fields.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("sownOn")} error={errors.sownOn}><input type="date" className={inputCls} value={f.sownOn} onChange={(e) => setF({ ...f, sownOn: e.target.value })} /></Field>
          <Field label={t("expectedHarvest")} error={errors.expectedHarvest}><input type="date" className={inputCls} value={f.expectedHarvest} onChange={(e) => setF({ ...f, expectedHarvest: e.target.value })} /></Field>
        </div>
        <Button type="submit" disabled={loading} className="mt-auto">{loading && <Spinner />}{t("save")}</Button>
      </form>
    </Drawer>
  );
}
