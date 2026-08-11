import { useState, useMemo } from "react";
import {
  Bell,
  Bus,
  Route,
  Clock,
  CheckCheck,
  Inbox,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { getPassengerNotifications } from "../../services/mock/passengerService";
import { getDriverNotifications, getCurrentDriver } from "../../services/mock/driverService";
import { getAlerts } from "../../services/mock/adminService";

const dashboardPaths = { passenger: "/passenger", driver: "/driver", admin: "/admin" };

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "transport", label: "Transport Updates" },
  { key: "route", label: "Route Changes" },
  { key: "delay", label: "Delay Alerts" },
];

const categoryConfig = {
  transport: { icon: Bus, label: "Transport Update", bg: "bg-blue-50", color: "text-blue-600", accent: "border-l-blue-500" },
  route: { icon: Route, label: "Route Change", bg: "bg-violet-50", color: "text-violet-600", accent: "border-l-violet-500" },
  delay: { icon: Clock, label: "Delay Alert", bg: "bg-amber-50", color: "text-amber-600", accent: "border-l-amber-500" },
};

function categorizeNotification(notification) {
  const text = `${notification.title} ${notification.description}`.toLowerCase();
  if (/(delay|delayed|late|traffic)/.test(text)) return "delay";
  if (/(assigned|optimiz|rerout|changed|change|new route)/.test(text)) return "route";
  return "transport";
}

function Notifications({ role = "passenger" }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadIds, setUnreadIds] = useState(() => {
    const notifications = getNotifications(role);
    return new Set(notifications.map((n) => n.id));
  });

  const notifications = useMemo(() => getNotifications(role), [role]);

  const items = useMemo(
    () =>
      notifications.map((notification) => {
        const category = categorizeNotification(notification);
        return { ...notification, category };
      }),
    [notifications]
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  const unreadCount = filtered.reduce((acc, item) => acc + (unreadIds.has(item.id) ? 1 : 0), 0);

  const markAsRead = (id) => {
    setUnreadIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const markAllRead = () => {
    setUnreadIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((item) => next.delete(item.id));
      return next;
    });
  };

  return (
    <DashboardLayout title="Notifications" role={role}>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with the latest alerts and notifications."
        breadcrumbs={[
          { label: "Dashboard", href: dashboardPaths[role] },
          { label: "Notifications" },
        ]}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>
              Mark All Read
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === "all"
                ? items.length
                : items.filter((item) => item.category === cat.key).length;
            const active = activeFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {cat.label}
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="You're all caught up in this category."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const config = categoryConfig[notification.category] || categoryConfig.transport;
            const isUnread = unreadIds.has(notification.id);
            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
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
                      {isUnread && (
                        <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                      <p className={`text-sm font-bold ${isUnread ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-400">{notification.time}</p>
                      {isUnread && (
                        <span className="text-xs font-semibold text-blue-500">New</span>
                      )}
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

function getNotifications(role) {
  const sources = {
    passenger: () =>
      getPassengerNotifications().map((n, i) => ({ id: `PS-NTF-${i + 1}`, ...n })),
    driver: () => {
      const driver = getCurrentDriver();
      return getDriverNotifications(driver?.id).map((n, i) => ({ id: `DR-NTF-${i + 1}`, ...n }));
    },
    admin: () =>
      getAlerts().map((n, i) => ({ id: `AD-NTF-${i + 1}`, ...n })),
  };
  return (sources[role] || sources.passenger)();
}

export default Notifications;