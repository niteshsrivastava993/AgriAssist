import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Tractor, ShoppingBasket } from "lucide-react";
import { authService } from "@/services/store";
import { useAuth, homeFor } from "@/lib/auth";
import { Button, Field, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";
import { AuthLayout } from "@/components/AuthLayout";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): { role?: "farmer" | "buyer" } =>
    s["role"] === "buyer" || s["role"] === "farmer" ? { role: s["role"] } : {},
  head: () => ({
    meta: [
      { title: "Create account — AgriAssist" },
      { name: "description", content: "Join AgriAssist as a farmer or buyer." },
      { property: "og:title", content: "Create account — AgriAssist" },
      { property: "og:description", content: "Join as a farmer or buyer." },
    ],
  }),
  component: Register,
});

function Register() {
  const search = Route.useSearch();
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "", role: search.role ?? "farmer" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (f.name.trim().length < 2) er.name = t("errName");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = t("errEmail");
    if (f.pw.length < 6) er.pw = t("errPw");
    if (f.pw !== f.pw2) er.pw2 = t("errPwMatch");
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    try {
      const u = await authService.register({ name: f.name.trim(), email: f.email, password: f.pw, role: f.role });
      signIn(u);
      navigate({ to: homeFor(u.role) });
    } catch {
      setErrors({ email: t("errExists") });
    } finally { setLoading(false); }
  };

  const roles = [
    { id: "farmer" as const, icon: Tractor, label: t("roleFarmer"), hint: t("farmerHint") },
    { id: "buyer" as const, icon: ShoppingBasket, label: t("roleBuyer"), hint: t("buyerHint") },
  ];

  return (
    <AuthLayout title={t("createYourAccount")} sub={t("registerSub")}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <div role="radiogroup" aria-label={t("accountType")} className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button type="button" role="radio" aria-checked={f.role === r.id} key={r.id} onClick={() => setF({ ...f, role: r.id })}
              className={cn("rounded-2xl border-2 p-4 text-left transition", f.role === r.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40")}>
              <r.icon className="h-5 w-5 text-primary" />
              <span className="mt-2 block font-semibold">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.hint}</span>
            </button>
          ))}
        </div>
        <Field label={t("fullName")} error={errors.name}><input className={inputCls} value={f.name} onChange={set("name")} autoComplete="name" /></Field>
        <Field label={t("email")} error={errors.email}><input className={inputCls} type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("password")} error={errors.pw}><input className={inputCls} type="password" value={f.pw} onChange={set("pw")} autoComplete="new-password" /></Field>
          <Field label={t("confirmPw")} error={errors.pw2}><input className={inputCls} type="password" value={f.pw2} onChange={set("pw2")} autoComplete="new-password" /></Field>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />} {t("createAccount")}</Button>
        <p className="text-center text-sm text-muted-foreground">{t("alreadyRegistered")} <Link to="/login" className="font-semibold text-primary hover:underline">{t("login")}</Link></p>
      </form>
    </AuthLayout>
  );
}
