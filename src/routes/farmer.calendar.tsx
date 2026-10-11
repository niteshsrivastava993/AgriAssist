import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, farmService } from "@/services/store";
import type { FarmTask } from "@/data/mockData";
import { Button, DemoBadge, Field, PageHeader, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/calendar")({
  head: () => ({ meta: [
    { title: "Crop Calendar — AgriAssist" },
    { name: "description", content: "Plan irrigation, sprays, sowing and harvest by date." },
    { property: "og:title", content: "Crop Calendar — AgriAssist" },
    { property: "og:description", content: "Your farm work, day by day." },
  ] }),
  component: CalendarPage,
});

const kinds: FarmTask["kind"][] = ["irrigate", "spray", "fertilise", "sow", "harvest"];
const kindColor: Record<FarmTask["kind"], string> = { irrigate: "bg-charcoal/60", spray: "bg-harvest", fertilise: "bg-primary", sow: "bg-sage", harvest: "bg-destructive/70" };
const iso = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

function CalendarPage() {
  const { user } = useAuth();
  const { t, locale } = useT();
  const db = useDB();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(iso(now));
  const events = db.events.filter((e) => e.farmerId === user?.id);
  const crops = db.crops.filter((c) => c.farmerId === user?.id);

  const first = (cursor.getDay() + 6) % 7; // Monday-first
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  const dayEvents = events.filter((e) => e.date === selected);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }));

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navCalendar")} title={cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })} sub={t("calendarSub")}
        actions={<>
          <Button variant="outline" size="sm" aria-label={t("prevMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="soft" size="sm" onClick={() => { setCursor(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(iso(now)); }}>{t("today")}</Button>
          <Button variant="outline" size="sm" aria-label={t("nextMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </>} />

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold uppercase text-muted-foreground">{weekdays.map((w) => <span key={w} className="py-2">{w}</span>)}</div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((c, i) => {
              if (!c) return <span key={i} />;
              const k = iso(c);
              const ev = events.filter((e) => e.date === k);
              return (
                <button key={k} onClick={() => setSelected(k)} aria-pressed={selected === k}
                  className={cn("flex aspect-square flex-col rounded-xl border p-1.5 text-left text-sm transition md:p-2", selected === k ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40", k === iso(now) && "ring-2 ring-harvest")}>
                  <span className="font-semibold">{c.getDate()}</span>
                  <span className="mt-auto flex flex-wrap gap-1">{ev.map((e) => <span key={e.id} className={cn("h-2 w-2 rounded-full", kindColor[e.kind], e.done && "opacity-30")} />)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">{kinds.map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-full", kindColor[k])} />{t(`kind_${k}` as Key)}</span>)}</div>
        </div>

        <aside className="clay p-6 lg:col-span-4">
          <h2 className="text-xl font-semibold">{new Date(selected + "T00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}</h2>
          {dayEvents.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{t("nothingPlanned")}</p> : (
            <ul className="mt-4 space-y-2">
              {dayEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-xl bg-muted p-3">
                  <button onClick={() => farmService.toggleEvent(e.id)} aria-label={t("markDone")} aria-pressed={e.done} className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2", e.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{e.done && <Check className="h-3.5 w-3.5" />}</button>
                  <span className="flex-1 text-sm"><span className={cn("block font-semibold", e.done && "line-through text-muted-foreground")}>{e.title}</span><span className="text-xs text-muted-foreground">{t(`kind_${e.kind}` as Key)} · {crops.find((c) => c.id === e.cropId)?.name ?? t("general")}</span></span>
                  {e.isSample && <DemoBadge />}
                  <button onClick={() => { farmService.removeEvent(e.id); toast.success(t("taskRemoved")); }} aria-label={t("remove")} className="rounded-full p-1.5 text-muted-foreground hover:bg-card"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <AddEvent date={selected} />
        </aside>
      </div>
    </div>
  );
}

function AddEvent({ date }: { date: string }) {
  const { user } = useAuth();
  const { t } = useT();
  const db = useDB();
  const crops = db.crops.filter((c) => c.farmerId === user?.id);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<FarmTask["kind"]>("irrigate");
  const [cropId, setCropId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) { setErrors({ title: t("errTitle") }); return; }
    setErrors({}); setLoading(true);
    await farmService.addEvent({ farmerId: user!.id, title: title.trim(), kind, date, cropId: cropId || undefined });
    setLoading(false); setTitle(""); toast.success(t("taskAdded"));
  };
  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-3 border-t border-border pt-5">
      <p className="eyebrow">{t("addTask")}</p>
      <Field label={t("taskTitle")} error={errors.title}><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <select aria-label={t("type")} className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as FarmTask["kind"])}>{kinds.map((k) => <option key={k} value={k}>{t(`kind_${k}` as Key)}</option>)}</select>
        <select aria-label={t("crop")} className={inputCls} value={cropId} onChange={(e) => setCropId(e.target.value)}><option value="">{t("general")}</option>{crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <Button type="submit" size="sm" disabled={loading}>{loading ? <Spinner /> : <Plus className="h-4 w-4" />}{t("addTask")}</Button>
    </form>
  );
}
