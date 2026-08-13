import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Inbox,
  ShieldAlert,
  AlertTriangle,
  Car,
  CheckCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { notificationService } from "../../services/notification";

const dashboardPaths = { passenger: "/passenger", driver: "/driver", admin: "/admin" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "report", label: "Reports" },
  { key: "assignment", label: "Assignments" },
  { key: "general", label: "General" },
];

const categoryConfig = {
  report: { key: "report", label: "Report", icon: ShieldAlert, bg: "bg-red-50", color: "text-red-600", accent: "border-l-red-500" },
  accident: { key: "report", label: "Accident", icon: AlertTriangle, bg: "bg-red-50", color: "text-red-600", accent: "border-l-red-500" },
  assignment: { key: "assignment", label: "Assignment", icon: Car, bg: "bg-blue-50", color: "text-blue-600", accent: "border-l-blue-500" },
  general: { key: "general", label: "Notification", icon: Bell, bg: "bg-violet-50", color: "text-violet-600", accent: "border-l-violet-500" },
};

function categorize(notification) {
  const text = `${notification.title} ${notification.message || ""}`.toLowerCase();
  if (/accident/.test(text)) return { category: "accident", filterKey: "report" };
  if (/(issue|report)/.test(text)) return { category: "report", filterKey: "report" };
  if (/(assigned|vehicle)/.test(text)) return { category: "assignment", filterKey: "assignment" };
  return { category: "general", filterKey: "general" };
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Notifications({ role = "passenger" }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const load = useCallback(async () => {
    const data = await notificationService.listNotifications();
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) setNotifications(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const items = useMemo(
    () =>
      notifications.map((notification) => {
        const { category, filterKey } = categorize(notification);
        return { ...notification, category, filterKey };
      }),
    [notifications]
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all" ? items : items.filter((item) => item.filterKey === activeFilter),
    [items, activeFilter]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.is_read !== true).length,
    [notifications]
  );

  const handleMarkRead = async (notification) => {
    if (notification.is_read === true) return;
    // Optimistic update so the UI feels instant; the backend scopes the change
    // to this user so it can never touch another user's rows.
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markNotificationRead(notification.id);
    } catch {
      // Leave the optimistic update; a refresh will resync the true state.
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.is_read !== true);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllNotificationsRead();
    } catch {
      // Ignored; refresh resyncs.
    }
  };

  return (
    <DashboardLayout title="Notifications" role={role}>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with the latest alerts and reports."
        breadcrumbs={[
          { label: "Dashboard", href: dashboardPaths[role] },
          { label: "Notifications" },
        ]}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const count =
              filter.key === "all"
                ? items.length
                : items.filter((item) => item.filterKey === filter.key).length;
            const active = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {filter.label}
                <span
                  className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <Bell size={12} />
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </span>
      </div>

      {loading ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-600">Loading notifications...</p>
        </Card>
      ) : loadError ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm font-medium text-red-600">{loadError}</p>
          <Button variant="outline" size="md" onClick={() => { setLoading(true); load().then(setNotifications).finally(() => setLoading(false)); }}>
            Retry
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="You're all caught up in this category."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const config = categoryConfig[notification.category] || categoryConfig.general;
            const isUnread = notification.is_read !== true;
            return (
              <button
                key={notification.id}
                onClick={() => handleMarkRead(notification)}
                className={`w-full rounded-2xl border border-gray-100 border-l-4 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${config.accent} ${
                  isUnread ? "ring-1 ring-blue-100" : "opacity-75"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`rounded-xl ${config.bg} p-2.5`}>
                    <config.icon size={18} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread && <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                      <p className={`text-sm font-bold ${isUnread ? "text-gray-900 dark:text-gray-100" : "text-gray-700"}`}>
                        {notification.title}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-500">{notification.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-400">{formatTime(notification.created_at)}</p>
                      {isUnread && <span className="text-xs font-semibold text-blue-500">New</span>}
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Notifications;