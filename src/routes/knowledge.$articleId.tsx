import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { articles } from "@/data/mockData";
import { buttonVariants } from "@/components/ui-kit";

export const Route = createFileRoute("/knowledge/$articleId")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.id === params.articleId);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Guide not found — AgriAssist" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.article;
    return { meta: [
      { title: `${a.title.en} — AgriAssist` },
      { name: "description", content: a.summary.en },
      { property: "og:title", content: a.title.en },
      { property: "og:description", content: a.summary.en },
    ] };
  },
  notFoundComponent: ArticleMissing,
  component: ArticlePage,
});

function ArticleMissing() {
  const { t } = useT();
  return <div className="mx-auto max-w-xl px-5 py-24 text-center"><p className="font-display text-3xl">{t("guideNotFound")}</p><Link to="/knowledge" className={buttonVariants({ variant: "soft" }) + " mt-6"}>{t("backToGuides")}</Link></div>;
}

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const { t, pick, lang } = useT();
  const related = articles.filter((x) => x.id !== a.id && x.category === a.category).concat(articles.filter((x) => x.category !== a.category)).slice(0, 2);
  return (
    <article className="page-enter mx-auto max-w-3xl px-5 py-10">
      <Link to="/knowledge" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />{t("backToGuides")}</Link>
      <p className="eyebrow mt-8">{t(`kc_${a.category}` as Key)} · {t("minRead", { n: a.minutes })}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{pick(a.title)}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{pick(a.summary)}</p>
      <img src={a.image} alt="" className="mt-8 aspect-[16/9] w-full rounded-[2rem] object-cover" />
      <ol className="mt-10 space-y-6">
        {a.body[lang].map((p, i) => <li key={i} className="flex gap-5 text-lg"><span className="font-display text-3xl font-semibold text-accent">0{i + 1}</span><span className="pt-1.5">{p}</span></li>)}
      </ol>
      <aside className="mt-16 border-t border-border pt-8">
        <p className="eyebrow">{t("keepReading")}</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {related.map((r) => <Link key={r.id} to="/knowledge/$articleId" params={{ articleId: r.id }} className="font-display text-xl font-semibold hover:text-primary">{pick(r.title)} →</Link>)}
        </div>
      </aside>
    </article>
  );
}
