import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Droplets } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, farmService } from "@/services/store";
import type { Irrigation } from "@/data/mockData";
import { Button, DemoBadge, Drawer, Empty, Field, PageHeader, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/fields")({
  head: () => ({ meta: [
    { title: "My Farms & Fields — AgriAssist" },
    { name: "description", content: "Manage your plots, area, soil type and irrigation." },
    { property: "og:title", content: "My Farms & Fields — AgriAssist" },
    { property: "og:description", content: "Every field on your farm in one ledger." },
  ] }),
  component: FieldsPage,
});

const irrigations: Irrigation[] = ["drip", "canal", "borewell", "rainfed"];

function FieldsPage() {
  const { user } = useAuth();
  const { t } = useT();
  const db = useDB();
  const [adding, setAdding] = useState(false);
  const fields = db.fields.filter((f) => f.farmerId === user?.id);
  const total = fields.reduce((s, f) => s + f.areaAcres, 0);

  const remove = async (id: string) => {
    try { await farmService.removeField(id); toast.success(t("fieldRemoved")); }
    catch { toast.error(t("errFieldHasCrops")); }
  };

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navFields")} title={<>{total.toFixed(1)} <span className="text-muted-foreground">{t("acresAcross", { n: fields.length })}</span></>}
        sub={t("fieldsSub")} actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />{t("addField")}</Button>} />

      {fields.length === 0 ? <div className="mt-10"><Empty action={<Button onClick={() => setAdding(true)}>{t("addField")}</Button>}>{t("noFields")}</Empty></div> : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => {
            const crops = db.crops.filter((c) => c.fieldId === f.id);
            return (
              <article key={f.id} className="clay lift flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-semibold">{f.name}</h2>
                  {f.isSample && <DemoBadge />}
                </div>
                {/* area visual: one square per half acre */}
                <div className="mt-4 flex flex-wrap gap-1" aria-hidden>
                  {Array.from({ length: Math.max(1, Math.round(f.areaAcres * 2)) }).map((_, i) => <span key={i} className="h-4 w-4 rounded bg-sage" />)}
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted-foreground">{t("area")}</dt><dd className="font-semibold">{f.areaAcres} {t("acres")}</dd></div>
                  <div><dt className="text-muted-foreground">{t("soil")}</dt><dd className="font-semibold">{f.soil}</dd></div>
                  <div className="col-span-2"><dt className="text-muted-foreground">{t("irrigation")}</dt><dd className="flex items-center gap-1.5 font-semibold"><Droplets className="h-4 w-4 text-primary" />{t(`irr_${f.irrigation}` as Key)}</dd></div>
                </dl>
                <div className="mt-5 flex-1 border-t border-border pt-4 text-sm">
                  {crops.length === 0 ? <p className="text-muted-foreground">{t("fallow")}</p> : crops.map((c) => (
                    <Link key={c.id} to="/farmer/crops/$cropId" params={{ cropId: c.id }} className="block font-semibold text-primary hover:underline">{c.name} · {c.variety} → {t(`stage_${c.stage}` as Key)}</Link>
                  ))}
                </div>
                <Button variant="danger" size="sm" className="mt-5 self-start" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" />{t("remove")}</Button>
              </article>
            );
          })}
        </div>
      )}
      {adding && <AddField onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddField({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useT();
  const [f, setF] = useState({ name: "", area: "", soil: "", irrigation: "drip" as Irrigation });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (f.name.trim().length < 2) er.name = t("errName");
    if (!(Number(f.area) > 0)) er.area = t("errArea");
    if (!f.soil.trim()) er.soil = t("errRequired");
    setErrors(er);
    if (Object.keys(er).length || !user) return;
    setLoading(true);
    await farmService.addField({ farmerId: user.id, name: f.name.trim(), areaAcres: Number(f.area), soil: f.soil.trim(), irrigation: f.irrigation });
    setLoading(false); toast.success(t("fieldAdded")); onClose();
  };
  return (
    <Drawer title={t("addField")} eyebrow={t("navFields")} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5">
        <Field label={t("fieldName")} error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label={t("areaAcres")} error={errors.area}><input className={inputCls} inputMode="decimal" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></Field>
        <Field label={t("soil")} error={errors.soil}><input className={inputCls} value={f.soil} placeholder={t("soilPh")} onChange={(e) => setF({ ...f, soil: e.target.value })} /></Field>
        <Field label={t("irrigation")}>
          <select className={inputCls} value={f.irrigation} onChange={(e) => setF({ ...f, irrigation: e.target.value as Irrigation })}>
            {irrigations.map((i) => <option key={i} value={i}>{t(`irr_${i}` as Key)}</option>)}
          </select>
        </Field>
        <Button type="submit" disabled={loading} className="mt-auto">{loading && <Spinner />}{t("save")}</Button>
      </form>
    </Drawer>
  );
}
