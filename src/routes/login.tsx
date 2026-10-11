import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authService } from "@/services/store";
import { useAuth, homeFor } from "@/lib/auth";
import { Button, Field, Spinner, inputCls, type FormErrors } from "@/components/ui-kit";
import { AuthLayout } from "@/components/AuthLayout";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — AgriAssist" },
      { name: "description", content: "Log in to your AgriAssist farmer or buyer workspace." },
      { property: "og:title", content: "Log in — AgriAssist" },
      { property: "og:description", content: "Access your farm or buyer workspace." },
    ],
  }),
  component: Login,
});

const demos = [
  { label: "Farmer", email: "farmer@agriassist.in", pw: "farmer123" },
  { label: "Buyer", email: "buyer@agriassist.in", pw: "buyer123" },
  { label: "Admin", email: "admin@agriassist.in", pw: "admin123" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = t("errEmail");
    if (pw.length < 6) er.pw = t("errPw");
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    try {
      const u = await authService.login(email, pw);
      signIn(u);
      navigate({ to: homeFor(u.role) });
    } catch (err) {
      setErrors({ form: (err as Error).message === "suspended" ? t("errSuspended") : t("errLogin") });
    } finally { setLoading(false); }
  };

  return <AuthLayout title={t("welcomeBack")} sub={t("loginSub")}>
    <form onSubmit={submit} noValidate className="space-y-5">
      {errors.form && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{errors.form}</p>}
      <Field label={t("email")} error={errors.email}><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
      <Field label={t("password")} error={errors.pw}><input className={inputCls} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></Field>
      <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />} {t("login")}</Button>
      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="eyebrow">{t("demoAccounts")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demos.map((d) => (
            <Button key={d.label} type="button" variant="soft" size="sm" onClick={() => { setEmail(d.email); setPw(d.pw); }}>{t(`use${d.label}` as "useFarmer")}</Button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">{t("newHere")} <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">{t("createAccount")}</Link></p>
    </form>
  </AuthLayout>;
}

