import type { ReactNode } from "react";
import hands from "@/assets/farm-hands.jpg";
import { useT } from "@/lib/i18n";

export function AuthLayout({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const { t } = useT();
  return (
    <div className="page-enter mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
      <div className="relative hidden overflow-hidden rounded-[2rem] md:block">
        <img src={hands} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="grain-overlay absolute inset-0" />
        <p className="absolute bottom-8 left-8 right-8 font-display text-3xl leading-tight text-ivory">{t("authQuote")}</p>
      </div>
      <div className="clay p-8 md:p-10">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="mb-8 mt-2 text-muted-foreground">{sub}</p>
        {children}
      </div>
    </div>
  );
}
