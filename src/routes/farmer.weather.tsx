import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, AlertTriangle } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { forecasts, weatherLocations, type Sky } from "@/data/mockData";
import { DemoBadge, PageHeader } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/weather")({
  head: () => ({ meta: [
    { title: "Weather & Spray Windows — AgriAssist" },
    { name: "description", content: "7-day farm forecast with spray and irrigation guidance." },
    { property: "og:title", content: "Weather — AgriAssist" },
    { property: "og:description", content: "Plan field work around the weather." },
  ] }),
  component: WeatherPage,
});

const icon: Record<Sky, typeof Sun> = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudLightning };

function WeatherPage() {
  const { t, locale } = useT();
  const [loc, setLoc] = useState(weatherLocations[0]!);
  const days = forecasts[loc]!;
  const [sel, setSel] = useState(0);
  const day = days[sel]!;
  const Icon = icon[day.sky];
  const dateOf = (n: number) => { const x = new Date(); x.setDate(x.getDate() + n); return x; };
  const sprayOk = day.windKmh < 15 && day.rainMm < 1;
  const alerts = days.filter((x) => x.sky === "storm" || x.rainMm >= 15);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navWeather")} title={t("weatherTitle")} demo
        actions={<select aria-label={t("location")} value={loc} onChange={(e) => { setLoc(e.target.value); setSel(0); }} className="rounded-full border border-input bg-card px-4 py-2.5 text-sm font-semibold">{weatherLocations.map((l) => <option key={l}>{l}</option>)}</select>} />

      {alerts.length > 0 && (
        <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl bg-harvest/20 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-harvest-foreground" />
          <p className="text-sm font-semibold text-harvest-foreground">{t("rainAlert", { day: dateOf(alerts[0]!.day).toLocaleDateString(locale, { weekday: "long" }), mm: alerts[0]!.rainMm })}</p>
        </div>
      )}

      <section className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="clay-sage flex flex-col justify-between p-8 lg:col-span-5">
          <div>
            <p className="eyebrow !text-secondary-foreground">{dateOf(day.day).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}</p>
            <div className="mt-4 flex items-center gap-5"><Icon className="h-16 w-16 text-primary" /><p className="font-display text-7xl font-semibold">{day.hi}°<span className="text-3xl text-secondary-foreground">/{day.lo}°</span></p></div>
            <p className="mt-2 font-semibold">{t(`sky_${day.sky}` as Key)}</p>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div><dt className="flex items-center gap-1 text-secondary-foreground"><CloudRain className="h-4 w-4" />{t("rain")}</dt><dd className="text-lg font-semibold">{day.rainMm} mm</dd></div>
            <div><dt className="flex items-center gap-1 text-secondary-foreground"><Wind className="h-4 w-4" />{t("wind")}</dt><dd className="text-lg font-semibold">{day.windKmh} km/h</dd></div>
            <div><dt className="flex items-center gap-1 text-secondary-foreground"><Droplets className="h-4 w-4" />{t("humidity")}</dt><dd className="text-lg font-semibold">{day.humidity}%</dd></div>
          </dl>
        </div>
        <div className="space-y-4 lg:col-span-7">
          <div className={cn("rounded-2xl border-2 p-6", sprayOk ? "border-primary/40 bg-card" : "border-destructive/30 bg-destructive/5")}>
            <p className="eyebrow">{t("sprayWindow")}</p>
            <p className="mt-2 text-xl font-semibold">{sprayOk ? t("sprayGood") : t("sprayBad")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="eyebrow">{t("irrigationAdvice")}</p>
            <p className="mt-2 text-xl font-semibold">{day.rainMm >= 5 ? t("irrSkip") : day.hi >= 32 ? t("irrMorning") : t("irrNormal")}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t("weatherDisclaimer")}</p>
        </div>
      </section>

      <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((x, i) => {
          const I = icon[x.sky];
          return (
            <button key={i} onClick={() => setSel(i)} aria-pressed={sel === i} className={cn("rounded-2xl border p-4 text-center transition", sel === i ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40")}>
              <p className="text-xs font-bold uppercase text-muted-foreground">{i === 0 ? t("today") : dateOf(x.day).toLocaleDateString(locale, { weekday: "short" })}</p>
              <I className="mx-auto mt-2 h-7 w-7 text-primary" />
              <p className="mt-2 font-semibold">{x.hi}° <span className="text-muted-foreground">{x.lo}°</span></p>
              {x.rainMm > 0 && <p className="text-xs text-muted-foreground">{x.rainMm} mm</p>}
            </button>
          );
        })}
      </div>
      <div className="mt-4"><DemoBadge /></div>
    </div>
  );
}
