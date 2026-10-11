import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Droplets, SprayCan, Wheat, Sprout, ArrowUpRight, Check, X, CloudSun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, marketService } from "@/services/store";
import { sampleTasks, sampleCrops, sampleActivity, type FarmTask } from "@/data/mockData";
import { Button, DemoBadge, Spinner } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "My Farm — AgriAssist" },
      { name: "description", content: "Your farm overview: tasks, crops and buyer requests." },
      { property: "og:title", content: "My Farm — AgriAssist" },
      { property: "og:description", content: "Your farm overview on AgriAssist." },
    ],
  }),
  component: FarmerHome,
});

const taskIcon: Record<FarmTask["kind"], typeof Droplets> = { irrigate: Droplets, spray: SprayCan, harvest: Wheat, sow: Sprout, fertilise: Sprout };

function FarmerHome() {
  const { user } = useAuth();
  const { t, locale } = useT();
  const db = useDB();
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const myListings = db.listings.filter((l) => l.farmerId === user?.id);
  const myIds = new Set(myListings.map((l) => l.id));
  const requests = db.requests.filter((r) => myIds.has(r.listingId));
  const pending = requests.filter((r) => r.status === "pending");
  const lead = sampleCrops[0]!; const second = sampleCrops[1]!;

  const decide = async (id: string, status: "accepted" | "rejected") => {
    setBusy(id);
    await marketService.setRequestStatus(id, status);
    setBusy(null);
    toast.success(status === "accepted" ? t("toastAccepted") : t("toastDeclined"));
  };

  const date = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      {/* Editorial header */}
      <header className="grid gap-6 border-b border-border pb-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow">{date} · {user?.location}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] md:text-6xl">
            {t("goodMorning")}, {user?.name.split(" ")[0]}.<br />
            <span className="text-muted-foreground">{t("onionsReady")}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 md:col-span-4 md:justify-end">
          <CloudSun className="h-10 w-10 text-accent" />
          <div>
            <p className="font-display text-3xl font-semibold">29°<span className="text-lg text-muted-foreground"> / 19°</span></p>
            <p className="text-sm text-muted-foreground">{t("sprayGood")}</p>
            <DemoBadge className="mt-1" />
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Feature crop */}
        <section className="lg:col-span-7">
          <article className="group relative overflow-hidden rounded-[2rem]">
            <img src={lead.image} alt={lead.crop} className="aspect-[16/11] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="grain-overlay absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-ivory">
              <p className="eyebrow !text-ivory/75">{t("cropInFocus")} · {lead.field}</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{lead.crop}</h2>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory/25">
                  <div className="h-full rounded-full bg-harvest transition-all duration-1000" style={{ width: `${lead.progress}%` }} />
                </div>
                <span className="text-sm font-semibold">{t("harvestIn", { d: lead.harvestIn })}</span>
              </div>
            </div>
          </article>

          <div className="mt-6 flex items-center gap-5 rounded-2xl border border-border p-5">
            <img src={second.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{second.crop}</p>
              <p className="text-sm text-muted-foreground">{second.field} · {second.stage}</p>
            </div>
            <span className="font-display text-2xl font-semibold text-primary">{second.progress}%</span>
          </div>
        </section>

        {/* Tasks */}
        <section className="clay-sage p-7 lg:col-span-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">{t("thisWeek")}</h2>
            <span className="text-sm text-secondary-foreground">{t("nOpen", { n: sampleTasks.length - done.length })}</span>
          </div>
          <ul className="mt-6 space-y-1">
            {sampleTasks.map((task) => {
              const Icon = taskIcon[task.kind];
              const isDone = done.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    onClick={() => setDone(isDone ? done.filter((d) => d !== task.id) : [...done, task.id])}
                    className="flex w-full items-start gap-4 rounded-xl p-3 text-left transition hover:bg-card/60"
                    aria-pressed={isDone}
                  >
                    <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full transition", isDone ? "bg-primary text-primary-foreground" : "bg-card text-primary")}>
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="flex-1">
                      <span className={cn("block font-semibold", isDone && "text-muted-foreground line-through")}>{task.title}</span>
                      <span className="text-sm text-secondary-foreground/80">{task.field}</span>
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-secondary-foreground">{task.due}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Purchase requests */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("marketplace")}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t("buyersWaiting")} <span className="text-accent">({pending.length})</span></h2>
          </div>
          <Link to="/farmer/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("allRequests")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {requests.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">{t("noRequestsYet")}</p>
        ) : (
          <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {requests.map((r) => {
              const l = db.listings.find((x) => x.id === r.listingId)!;
              return (
                <div key={r.id} className="grid items-center gap-4 p-5 md:grid-cols-12">
                  <div className="flex items-center gap-4 md:col-span-5">
                    <img src={l.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-semibold">{r.buyerName}</p>
                      <p className="text-sm text-muted-foreground">{r.buyerBusiness}</p>
                    </div>
                  </div>
                  <div className="text-sm md:col-span-4">
                    <p><span className="font-semibold">{r.quantity} {t(`unit_${r.unit}` as Key)}</span> {l.crop} · ₹{r.unitPrice.toLocaleString("en-IN")}/{t(`unit_${r.unit}` as Key)}</p>
                    {r.message && <p className="mt-0.5 text-muted-foreground">“{r.message}”</p>}
                  </div>
                  <div className="flex items-center gap-2 md:col-span-3 md:justify-end">
                    {r.isSample && <DemoBadge />}
                    {r.status === "pending" ? (
                      busy === r.id ? <Spinner /> : (
                        <>
                          <Button size="sm" variant="danger" onClick={() => decide(r.id, "rejected")}><X className="h-4 w-4" />{t("reject")}</Button>
                          <Button size="sm" onClick={() => decide(r.id, "accepted")}><Check className="h-4 w-4" />{t("accept")}</Button>
                        </>
                      )
                    ) : (
                      <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", r.status === "accepted" ? "bg-secondary text-primary" : "bg-muted text-muted-foreground")}>{t(`st_${r.status}` as Key)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="mt-16 grid gap-8 md:grid-cols-12">
        <h2 className="text-2xl font-semibold md:col-span-4">{t("recentlyOnFarm")}</h2>
        <ol className="relative space-y-6 border-l-2 border-sage pl-6 md:col-span-8">
          {sampleActivity.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-accent" />
              <p className="font-medium">{a.text}</p>
              <p className="text-sm text-muted-foreground">{a.when}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
