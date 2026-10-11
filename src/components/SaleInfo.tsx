import type { Listing } from "@/data/mockData";
import { useT } from "@/lib/i18n";
import { inr } from "@/components/ui-kit";
import { useQty } from "@/components/LocationPicker";
import { cn } from "@/lib/utils";

/** Sale mode chips with price unit and minimum order, for one listing. */
export function SaleInfo({ listing: l, className }: { listing: Listing; className?: string | undefined }) {
  const { t } = useT();
  const q = useQty();
  return (
    <div className={cn("flex flex-wrap gap-2 text-xs", className)}>
      {l.regular && (
        <span className="rounded-xl bg-secondary px-3 py-1.5">
          <b className="text-primary">{t("mode_regular")}</b> · {inr(l.regular.pricePerKg)}/{t("unit_kg")} · {t("minOrder")} {q(l.regular.minKg / 100, "kg")}
        </span>
      )}
      {l.bulk && (
        <span className="rounded-xl bg-harvest/20 px-3 py-1.5">
          <b>{t("mode_bulk")}</b> · {inr(l.bulk.pricePerQtl)}/{t("unit_qtl")} · {t("minOrder")} {q(l.bulk.minQtl, "qtl")}
        </span>
      )}
    </div>
  );
}
