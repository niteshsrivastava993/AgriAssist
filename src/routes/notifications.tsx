import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Store, CloudSun, Sprout, Info, X } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, noticeService } from "@/services/store";
import type { Notice } from "@/data/mockData";
import { Button, Empty, PageHeader, Segmented } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — AgriAssist" },
    { name: "description", content: "Purchase updates, weather alerts and reminders." },
    { property: "og:title", content: "Notifications — AgriAssist" },
    { property: "og:description", content: "Everything that needs your attention." },
  ] }),
  component: () => <RoleGuard roles={["farmer", "buyer", "admin"]}><NotificationsPage /></RoleGuard>,
});

const icon: Record<Notice["kind"], typeof Store> = { market: Store, weather: CloudSun, advisory: Sprout, system: Info };

function NotificationsPage() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const mine = db.notices.filter((n) => n.userId === user?.id);
  const shown = mine.filter((n) => filter === "all" || !n.read);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="page-enter mx-auto max-w-3xl px-5 py-10">
      <PageHeader eyebrow={t("navNotifications")} title={t("unreadCount", { n: unread })}
        actions={unread > 0 ? <Button size="sm" variant="soft" onClick={() => noticeService.markAllRead(user!.id)}>{t("markAllRead")}</Button> : undefined} />
      <div className="mt-8"><Segmented label={t("filter")} value={filter} onChange={setFilter} options={[{ id: "all", label: t("all") }, { id: "unread", label: t("unread") }]} /></div>
      {shown.length === 0 ? <div className="mt-8"><Empty>{t("allCaughtUp")}</Empty></div> : (
        <ul className="mt-8 space-y-2">
          {shown.map((n) => {
            const I = icon[n.kind];
            const body = <>
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", n.read ? "bg-muted text-muted-foreground" : "bg-secondary text-primary")}><I className="h-5 w-5" /></span>
              <span className="flex-1"><span className={cn("block text-sm", !n.read && "font-semibold")}>{t(n.key as Key, n.params)}</span><span className="text-xs text-muted-foreground">{d(n.createdAt)} · {t(`nk_${n.kind}` as Key)}</span></span>
              {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-harvest" aria-label={t("unread")} />}
            </>;
            return (
              <li key={n.id} className={cn("flex items-center gap-2 rounded-2xl border p-2 pr-3", n.read ? "border-border" : "border-harvest/40 bg-card")}>
                {n.link ? <Link to={n.link} onClick={() => noticeService.markRead(n.id)} className="flex flex-1 items-center gap-4 rounded-xl p-2 hover:bg-muted/50">{body}</Link>
                  : <button onClick={() => noticeService.markRead(n.id)} className="flex flex-1 items-center gap-4 rounded-xl p-2 text-left">{body}</button>}
                <button onClick={() => noticeService.remove(n.id)} aria-label={t("dismiss")} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
