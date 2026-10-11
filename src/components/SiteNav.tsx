import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Store, LogOut, Sprout, Languages, Bell, BookOpen, ClipboardList, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { useDB } from "@/services/store";
import { buttonVariants } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-clay)]">
        <Sprout className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-semibold">AgriAssist</span>
    </Link>
  );
}

function LangToggle() {
  const { lang, setLang, t } = useT();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted"
      aria-label={t("switchLang")}
    >
      <Languages className="h-4 w-4" /> {lang === "en" ? "हिंदी" : "English"}
    </button>
  );
}

function BellLink({ count }: { count: number }) {
  const { t } = useT();
  return (
    <Link to="/notifications" aria-label={t("navNotifications")} className="relative rounded-full p-2.5 hover:bg-muted" activeProps={{ className: "bg-secondary text-primary" }}>
      <Bell className="h-5 w-5" />
      {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-harvest px-1 text-[0.6rem] font-bold text-harvest-foreground">{count}</span>}
    </Link>
  );
}

const linkCls = "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground";
const activeCls = "!text-foreground bg-secondary";
const mobCls = "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground";
const mobActive = { className: "!text-primary bg-secondary" };

export function SiteNav() {
  const { user, signOut } = useAuth();
  const { t } = useT();
  const db = useDB();
  const navigate = useNavigate();
  const logout = () => { signOut(); navigate({ to: "/" }); };
  const unread = user ? db.notices.filter((n) => n.userId === user.id && !n.read).length : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {!user && (
              <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>{t("home")}</Link>
            )}
            {user?.role === "farmer" && <Link to="/farmer" className={linkCls} activeProps={{ className: activeCls }}>{t("myFarm")}</Link>}
            {user?.role === "admin" && <Link to="/admin" className={linkCls} activeProps={{ className: activeCls }}>{t("navAdmin")}</Link>}
            <Link to="/marketplace" className={linkCls} activeProps={{ className: activeCls }}>{t("marketplace")}</Link>
            {user?.role === "buyer" && <Link to="/buyer" className={linkCls} activeProps={{ className: activeCls }}>{t("navOrders")}</Link>}
            <Link to="/knowledge" className={linkCls} activeProps={{ className: activeCls }}>{t("navKnowledge")}</Link>
          </nav>
          <div className="flex items-center gap-1">
            <LangToggle />
            {user ? (
              <>
                <BellLink count={unread} />
                <span className="hidden text-sm text-muted-foreground lg:inline">{user.name}</span>
                <button onClick={logout} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}>
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>{t("login")}</Link>
                <Link to="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>{t("register")}</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {user && (
        <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl bg-card p-2 shadow-[var(--shadow-lift)] md:hidden">
          {user.role === "farmer" && <Link to="/farmer" className={mobCls} activeProps={mobActive}><Home className="h-5 w-5" /> {t("myFarm")}</Link>}
          {user.role === "admin" && <Link to="/admin" className={mobCls} activeProps={mobActive}><ShieldCheck className="h-5 w-5" /> {t("navAdmin")}</Link>}
          <Link to="/marketplace" className={mobCls} activeProps={mobActive}><Store className="h-5 w-5" /> {t("marketplace")}</Link>
          {user.role === "buyer" && <Link to="/buyer" className={mobCls} activeProps={mobActive}><ClipboardList className="h-5 w-5" /> {t("navOrders")}</Link>}
          <Link to="/knowledge" className={mobCls} activeProps={mobActive}><BookOpen className="h-5 w-5" /> {t("navKnowledge")}</Link>
          <button onClick={logout} className={mobCls}><LogOut className="h-5 w-5" /> {t("logout")}</button>
        </nav>
      )}
    </>
  );
}
