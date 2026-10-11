import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, authService, marketService } from "@/services/store";
import { Button, Field, PageHeader, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { LocationPicker } from "@/components/LocationPicker";
import { DemoBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/profile")({
  head: () => ({ meta: [
    { title: "Profile & Settings — AgriAssist" },
    { name: "description", content: "Your details, language and notification preferences." },
    { property: "og:title", content: "Profile & Settings — AgriAssist" },
    { property: "og:description", content: "Manage your AgriAssist account." },
  ] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signIn } = useAuth();
  const { t, lang, setLang } = useT();
  const db = useDB();
  const me = db.users.find((u) => u.id === user?.id);
  const [f, setF] = useState({ name: me?.name ?? "", location: me?.location ?? "", phone: me?.phone ?? "" });
  const [prefs, setPrefs] = useState(me?.prefs ?? { market: true, weather: true, advisory: true });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const fields = db.fields.filter((x) => x.farmerId === user?.id);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (f.name.trim().length < 2) er.name = t("errName");
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) er.phone = t("errPhone");
    if (!f.location.trim()) er.location = t("errRequired");
    setErrors(er);
    if (Object.keys(er).length || !me) return;
    setLoading(true);
    const u = await authService.updateProfile(me.id, { name: f.name.trim(), location: f.location.trim(), phone: f.phone, prefs });
    signIn(u); setLoading(false); toast.success(t("profileSaved"));
  };

  return (
    <div className="page-enter mx-auto max-w-5xl px-5 py-10">
      <PageHeader eyebrow={t("navProfile")} title={me?.name ?? ""} sub={`${me?.email} · ${fields.length} ${t("navFields").toLowerCase()} · ${fields.reduce((s, x) => s + x.areaAcres, 0)} ${t("acres")}`} />
      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 md:grid-cols-2">
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">{t("yourDetails")}</h2>
          <Field label={t("fullName")} error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label={t("mobile")} error={errors.phone}><input className={inputCls} inputMode="tel" placeholder="9876543210" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label={t("village")} error={errors.location}><input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          <div className="space-y-3 rounded-2xl border border-border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{t("farmLocation")}</h3>
              <span className="text-xs text-muted-foreground">{me?.lat != null ? t("locSet") : t("locNotSet")}</span>
              {me?.locIsSample && <DemoBadge />}
            </div>
            {me && <LocationPicker key={`${me.lat}-${me.lng}`} lat={me.lat} lng={me.lng} why="locWhyFarmer"
              onSave={async (lat, lng) => { await authService.updateProfile(me.id, { lat, lng, locIsSample: false }); toast.success(t("locationSaved")); }}
              onClear={async () => { await authService.updateProfile(me.id, { lat: undefined, lng: undefined, locIsSample: false }); }} />}
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">{t("preferences")}</h2>
          <div>
            <p className="mb-2 text-sm font-semibold">{t("language")}</p>
            <div className="flex gap-2">{(["en", "hi"] as const).map((l) => (
              <button type="button" key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cn("rounded-full px-5 py-2 text-sm font-semibold", lang === l ? "bg-primary text-primary-foreground" : "bg-muted")}>{l === "en" ? "English" : "हिंदी"}</button>
            ))}</div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t("notifyMe")}</p>
            {(["market", "weather", "advisory"] as const).map((k) => (
              <label key={k} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-[var(--shadow-clay)]">
                <span className="text-sm font-semibold">{t(`pref_${k}` as Key)}</span>
                <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} />
              </label>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 md:col-span-2">
          <Button type="button" variant="danger" size="sm" onClick={() => { if (confirm(t("confirmReset"))) { marketService.resetDemo(); toast.success(t("demoReset")); } }}>{t("resetDemo")}</Button>
          <Button type="submit" disabled={loading}>{loading && <Spinner />}{t("saveChanges")}</Button>
        </div>
      </form>
    </div>
  );
}
