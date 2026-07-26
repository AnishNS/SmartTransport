import { Bell } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

const dashboardPaths = { passenger: "/passenger", driver: "/driver", admin: "/admin" };

function Notifications({ role = "passenger" }) {
  return (
    <DashboardLayout title="Notifications" role={role}>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with the latest alerts and notifications."
        breadcrumbs={[
          { label: "Dashboard", href: dashboardPaths[role] },
          { label: "Notifications" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Bell}
        title="Notifications"
        description="This feature is under development. You will soon be able to view all your notifications here."
      />
    </DashboardLayout>
  );
}

export default Notifications;
