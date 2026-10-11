import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sprout, Calculator, Store, CloudSun } from "lucide-react";
import hero from "@/assets/hero.jpg";
import hands from "@/assets/farm-hands.jpg";
import { useT } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriAssist — Grow with clarity, sell with confidence" },
      { name: "description", content: "Plan crops, track costs, get advisory and sell directly to buyers on AgriAssist." },
      { property: "og:title", content: "AgriAssist — Farmer Advisory & Crop Marketplace" },
      { property: "og:description", content: "Plan crops, track costs, get advisory and sell directly to buyers." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sprout, title: "f1t", body: "f1b" },
  { icon: CloudSun, title: "f2t", body: "f2b" },
  { icon: Calculator, title: "f3t", body: "f3b" },
  { icon: Store, title: "f4t", body: "f4b" },
] as const;

function Landing() {
  const { t } = useT();
  return (
    <div className="page-enter">
      <section className="relative -mt-16 min-h-[92vh] overflow-hidden">
        <img src={hero} alt={t("heroAlt")} width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grain-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32">
          <p className="eyebrow !text-ivory/80">{t("heroEyebrow")}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] text-ivory md:text-7xl lg:text-8xl">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-xl text-lg text-ivory/85">{t("heroSub")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/register" search={{ role: "farmer" }} className={buttonVariants({ variant: "harvest", size: "lg" })}>
              {t("imFarmer")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" search={{ role: "buyer" }} className={buttonVariants({ variant: "onImage", size: "lg" })}>
              {t("imBuyer")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">{t("whyEyebrow")}</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{t("whyTitle")}</h2>
          <p className="mt-5 text-muted-foreground">
            {t("whyBody")}
          </p>
        </div>
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:col-span-7">
          {features.map((f) => (
            <div key={f.title} className="border-t-2 border-primary/20 pt-5">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-xl font-semibold">{t(f.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(f.body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2">
          <img src={hands} alt={t("handsAlt")} loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]" />
          <div>
            <p className="eyebrow">{t("howEyebrow")}</p>
            <ol className="mt-6 space-y-7">
              {(["how1", "how2", "how3", "how4"] as const).map((s, i) => (
                <li key={s} className="flex gap-5">
                  <span className="font-display text-4xl font-semibold text-accent">0{i + 1}</span>
                  <span className="pt-2 text-lg font-semibold">{t(s)}</span>
                </li>
              ))}
            </ol>
            <Link to="/marketplace" className={buttonVariants({ variant: "primary", size: "lg" }) + " mt-10"}>
              {t("browseMarket")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-10 text-sm text-muted-foreground">
        <span>© 2026 AgriAssist</span>
        <span>{t("footerDemo")}</span>
      </footer>
    </div>
  );
}
