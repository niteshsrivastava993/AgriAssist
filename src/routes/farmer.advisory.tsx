import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, ShieldAlert, ListChecks } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, advisoryService } from "@/services/store";
import { concerns, type Concern, advisoryLibrary } from "@/data/mockData";
import { Button, DemoBadge, Field, PageHeader, Spinner, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/advisory")({
  head: () => ({ meta: [
    { title: "Farming Advisory — AgriAssist" },
    { name: "description", content: "Structured guidance with steps and precautions for your crop." },
    { property: "og:title", content: "Farming Advisory — AgriAssist" },
    { property: "og:description", content: "Practical next steps for your crop and stage." },
  ] }),
  component: AdvisoryPage,
});

type Answer = { crop: string; stage: string; concern: Concern; question: string; res: (typeof advisoryLibrary)[Concern] };

function AdvisoryPage() {
  const { user } = useAuth();
  const { t, pick, lang } = useT();
  const db = useDB();
  const crops = db.crops.filter((c) => c.farmerId === user?.id);
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [concern, setConcern] = useState<Concern>("pest");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Answer[]>([]);
  const crop = crops.find((c) => c.id === cropId);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await advisoryService.ask(concern);
    setHistory([{ crop: crop?.name ?? t("general"), stage: crop ? t(`stage_${crop.stage}` as Key) : "", concern, question: question.trim(), res }, ...history]);
    setLoading(false); setQuestion("");
  };
  const current = history[0];

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navAdvisory")} title={t("advisoryTitle")} sub={t("advisorySub")} demo />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <form onSubmit={ask} className="space-y-5 lg:col-span-4">
          <Field label={t("crop")}>
            <select className={inputCls} value={cropId} onChange={(e) => setCropId(e.target.value)}>
              {crops.map((c) => <option key={c.id} value={c.id}>{c.name} · {t(`stage_${c.stage}` as Key)}</option>)}
              <option value="">{t("general")}</option>
            </select>
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t("concern")}</legend>
            <div className="flex flex-wrap gap-2">
              {concerns.map((c) => (
                <button type="button" key={c} onClick={() => setConcern(c)} aria-pressed={concern === c}
                  className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", concern === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{t(`concern_${c}` as Key)}</button>
              ))}
            </div>
          </fieldset>
          <Field label={t("describeOptional")}><textarea rows={3} className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("advisoryPh")} /></Field>
          <Button type="submit" disabled={loading} className="w-full">{loading ? <Spinner /> : <Sparkles className="h-4 w-4" />}{t("getAdvice")}</Button>
          <p className="text-xs text-muted-foreground">{t("advisoryDisclaimer")}</p>
        </form>

        <section className="lg:col-span-8" aria-live="polite">
          {!current ? (
            <div className="clay-sage flex min-h-[320px] flex-col justify-center p-10">
              <p className="font-display text-3xl font-semibold">{t("advisoryEmptyTitle")}</p>
              <p className="mt-3 text-secondary-foreground">{t("advisoryEmpty")}</p>
            </div>
          ) : (
            <article className="clay p-8" key={history.length}>
              <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{current.crop}{current.stage && ` · ${current.stage}`} · {t(`concern_${current.concern}` as Key)}</p><DemoBadge /></div>
              {current.question && <p className="mt-3 text-sm italic text-muted-foreground">“{current.question}”</p>}
              <p className="mt-4 font-display text-2xl font-semibold leading-snug">{pick(current.res.summary)}</p>
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div><h3 className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="h-5 w-5 text-primary" />{t("nextSteps")}</h3>
                  <ol className="mt-3 space-y-2 text-sm">{current.res.steps[lang].map((s, i) => <li key={i} className="flex gap-3"><span className="font-display font-semibold text-accent">{i + 1}</span>{s}</li>)}</ol></div>
                <div><h3 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert className="h-5 w-5 text-destructive" />{t("precautions")}</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{current.res.precautions[lang].map((s, i) => <li key={i}>{s}</li>)}</ul></div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-5 text-sm">
                <Link to="/farmer/calendar" className="font-semibold text-primary hover:underline">{t("planInCalendar")} →</Link>
                <Link to="/knowledge" className="font-semibold text-primary hover:underline">{t("readMore")} →</Link>
              </div>
            </article>
          )}
          {history.length > 1 && (
            <div className="mt-8"><p className="eyebrow">{t("earlierQuestions")}</p>
              <ul className="mt-3 divide-y divide-border">{history.slice(1).map((h, i) => <li key={i} className="py-3 text-sm"><span className="font-semibold">{h.crop}</span> · {t(`concern_${h.concern}` as Key)} — {pick(h.res.summary)}</li>)}</ul></div>
          )}
        </section>
      </div>
    </div>
  );
}
