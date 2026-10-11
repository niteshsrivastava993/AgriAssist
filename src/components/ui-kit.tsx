import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[var(--shadow-clay)] hover:brightness-110",
        harvest: "bg-harvest text-harvest-foreground shadow-[var(--shadow-clay)] hover:brightness-105",
        soft: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground hover:bg-muted",
        outline: "border border-border text-foreground hover:bg-card",
        onImage: "bg-background/90 text-foreground backdrop-blur hover:bg-background",
        danger: "text-destructive border border-destructive/30 hover:bg-destructive/10",
      },
      size: { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-base py-3.5" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({ className, variant, size, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...p} />;
}

export function DemoBadge({ className }: { className?: string | undefined }) {
  const { t } = useT();
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-harvest/50 bg-harvest/15 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-harvest-foreground", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-harvest" /> {t("demo")}
    </span>
  );
}

export function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}
export const inputCls = "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm shadow-[var(--shadow-clay-pressed)] outline-none transition focus:border-primary";

export function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />;
}

export type FormErrors = Partial<Record<"name" | "email" | "pw" | "pw2" | "form" | "qty" | "offer" | "title" | "variety" | "fieldId" | "sownOn" | "expectedHarvest" | "area" | "soil" | "cropId" | "amount" | "qtl" | "price" | "location" | "phone" | "mode" | "stock" | "priceKg" | "minKg" | "priceBulk" | "minBulk", string>>;

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function PageHeader({ eyebrow, title, sub, actions, demo }: { eyebrow: string; title: ReactNode; sub?: string | undefined; actions?: ReactNode; demo?: boolean | undefined }) {
  return (
    <header className="grid gap-6 border-b border-border pb-8 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{eyebrow}</p>{demo && <DemoBadge />}</div>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.05] md:text-5xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">{actions}</div>}
    </header>
  );
}

export function Pill({ tone = "muted", children }: { tone?: "muted" | "good" | "warn" | "bad" | undefined; children: ReactNode }) {
  const c = { muted: "bg-muted text-muted-foreground", good: "bg-secondary text-primary", warn: "bg-harvest/20 text-harvest-foreground", bad: "bg-destructive/10 text-destructive" }[tone];
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", c)}>{children}</span>;
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground"><p>{children}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full bg-muted p-1">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition", value === o.id ? "bg-card text-foreground shadow-[var(--shadow-clay)]" : "text-muted-foreground hover:text-foreground")}>{o.label}</button>
      ))}
    </div>
  );
}

export function Drawer({ title, eyebrow, onClose, children }: { title: string; eyebrow?: string | undefined; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/40" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={(e) => e.stopPropagation()} className="page-enter flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-background p-8">
        <div className="flex items-start justify-between">
          <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="mt-1 text-3xl font-semibold">{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-xl leading-none hover:bg-muted">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
