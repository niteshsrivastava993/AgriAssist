import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, advisoryService } from "@/services/store";
import { diseaseLibrary, symptomKeys, type HealthReport } from "@/data/mockData";
import { Button, DemoBadge, Field, PageHeader, Pill, Spinner, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/health")({
  validateSearch: (s: Record<string, unknown>): { crop?: string } => (typeof s["crop"] === "string" ? { crop: s["crop"] } : {}),
  head: () => ({ meta: [
    { title: "Crop Health Check — AgriAssist" },
    { name: "description", content: "Describe symptoms and get a likely cause with treatment steps." },
    { property: "og:title", content: "Crop Health Check — AgriAssist" },
    { property: "og:description", content: "Spot crop problems early." },
  ] }),
  component: HealthPage,
});

function HealthPage() {
  const { user } = useAuth();
  const { t, pick, lang, d } = useT();
  const db = useDB();
  const search = Route.useSearch();
  const crops = db.crops.filter((c) => c.farmerId === user?.id && c.stage !== "harvested");
  const [cropId, setCropId] = useState(search.crop ?? crops[0]?.id ?? "");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<HealthReport | null>(null);
  const history = db.reports.filter((r) => r.farmerId === user?.id);

  const toggle = (s: string) => setSymptoms(symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s]);
  const onPhoto = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error(t("errImage")); return; }
    const r = new FileReader(); r.onload = () => setPhoto(String(r.result)); r.readAsDataURL(f);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cropId) { setError(t("errPickCrop")); return; }
    if (symptoms.length === 0) { setError(t("errSymptoms")); return; }
    setError(""); setLoading(true);
    try { setResult(await advisoryService.checkHealth(user!.id, cropId, symptoms, photo)); }
    catch { setError(t("errNoMatch")); }
    finally { setLoading(false); }
  };
  const disease = result && diseaseLibrary.find((x) => x.id === result.diseaseId);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navHealth")} title={t("healthTitle")} sub={t("healthSub")} demo />
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form onSubmit={submit} noValidate className="space-y-6">
          <Field label={t("crop")}><select className={inputCls} value={cropId} onChange={(e) => setCropId(e.target.value)}>{crops.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.variety}</option>)}</select></Field>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t("whatDoYouSee")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {symptomKeys.map((s) => (
                <button type="button" key={s} onClick={() => toggle(s)} aria-pressed={symptoms.includes(s)}
                  className={cn("rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition", symptoms.includes(s) ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40")}>{t(`sym_${s}` as Key)}</button>
              ))}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border p-5 hover:border-primary/40">
            {photo ? <img src={photo} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <Camera className="h-8 w-8 text-muted-foreground" />}
            <span className="text-sm"><span className="block font-semibold">{photo ? t("photoAdded") : t("addPhoto")}</span><span className="text-muted-foreground">{t("photoHint")}</span></span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? <Spinner /> : <Stethoscope className="h-4 w-4" />}{t("runCheck")}</Button>
        </form>

        <section aria-live="polite">
          {result && disease ? (
            <article className="clay p-8">
              <div className="flex items-center gap-2"><p className="eyebrow">{t("likelyCause")}</p><DemoBadge /></div>
              <h2 className="mt-2 text-3xl font-semibold">{pick(disease.name)}</h2>
              <div className="mt-4 flex items-center gap-3">
                <Pill tone={disease.severity === "high" ? "bad" : disease.severity === "medium" ? "warn" : "good"}>{t(`sev_${disease.severity}` as Key)}</Pill>
                <span className="text-sm text-muted-foreground">{t("matchScore")}: {result.confidence}%</span>
              </div>
              <h3 className="mt-6 font-semibold">{t("treatment")}</h3>
              <ol className="mt-2 space-y-2 text-sm">{disease.treatment[lang].map((s, i) => <li key={i} className="flex gap-3"><span className="font-display font-semibold text-accent">{i + 1}</span>{s}</li>)}</ol>
              <p className="mt-6 text-xs text-muted-foreground">{t("healthDisclaimer")}</p>
            </article>
          ) : (
            <div className="clay-sage p-8"><p className="font-display text-2xl font-semibold">{t("healthEmptyTitle")}</p><p className="mt-2 text-secondary-foreground">{t("healthEmpty")}</p></div>
          )}
          <h3 className="mt-10 text-xl font-semibold">{t("pastChecks")}</h3>
          <ul className="mt-3 divide-y divide-border">
            {history.map((r) => {
              const dz = diseaseLibrary.find((x) => x.id === r.diseaseId);
              return <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span><span className="font-semibold">{db.crops.find((c) => c.id === r.cropId)?.name}</span> · {dz ? pick(dz.name) : ""}</span>
                <span className="flex items-center gap-2 text-muted-foreground">{r.isSample && <DemoBadge />}{d(r.createdAt)}</span>
              </li>;
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
