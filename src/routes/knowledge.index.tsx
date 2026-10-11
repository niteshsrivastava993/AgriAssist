import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { articles, type Article } from "@/data/mockData";
import { Empty, PageHeader, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/knowledge/")({
  head: () => ({ meta: [
    { title: "Knowledge Centre — AgriAssist" },
    { name: "description", content: "Practical guides on crops, soil, pests, schemes and selling." },
    { property: "og:title", content: "Knowledge Centre — AgriAssist" },
    { property: "og:description", content: "Short, practical farming guides in English and Hindi." },
  ] }),
  component: KnowledgePage,
});

const cats: (Article["category"] | "all")[] = ["all", "crops", "soil", "pests", "schemes", "market"];

function KnowledgePage() {
  const { t, pick } = useT();
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = articles.filter((a) => (cat === "all" || a.category === cat) && (!term || `${a.title.en} ${a.title.hi} ${a.summary.en} ${a.summary.hi}`.toLowerCase().includes(term)));
  const [lead, ...rest] = list;

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navKnowledge")} title={t("knowledgeTitle")} sub={t("knowledgeSub")} />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label={t("search")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchGuides")} className={cn(inputCls, "rounded-full pl-11")} />
        </label>
        <div className="flex flex-wrap gap-1.5">{cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("rounded-full px-3.5 py-2 text-xs font-semibold", cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{c === "all" ? t("all") : t(`kc_${c}` as Key)}</button>
        ))}</div>
      </div>
      {!lead ? <div className="mt-10"><Empty>{t("noGuides")}</Empty></div> : (
        <>
          <Link to="/knowledge/$articleId" params={{ articleId: lead.id }} className="group mt-10 grid overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-clay)] md:grid-cols-2">
            <img src={lead.image} alt="" className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="eyebrow">{t(`kc_${lead.category}` as Key)}</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight">{pick(lead.title)}</h2>
              <p className="mt-4 text-muted-foreground">{pick(lead.summary)}</p>
              <p className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary"><Clock className="h-4 w-4" />{t("minRead", { n: lead.minutes })}</p>
            </div>
          </Link>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <Link key={a.id} to="/knowledge/$articleId" params={{ articleId: a.id }} className="group">
                <img src={a.image} alt="" loading="lazy" className="aspect-[3/2] w-full rounded-3xl object-cover" />
                <p className="eyebrow mt-4">{t(`kc_${a.category}` as Key)} · {t("minRead", { n: a.minutes })}</p>
                <h3 className="mt-1 text-xl font-semibold group-hover:text-primary">{pick(a.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pick(a.summary)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
