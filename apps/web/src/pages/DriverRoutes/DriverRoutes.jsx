import { Navigation } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function DriverRoutes() {
  return (
    <DashboardLayout title="My Routes" role="driver">
      <PageHeader
        title="My Routes"
        subtitle="View and manage your assigned routes."
        breadcrumbs={[
          { label: "Dashboard", href: "/driver" },
          { label: "My Routes" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Navigation}
        title="My Routes"
        description="This feature is under development. You will soon be able to view and manage all your assigned routes."
      />
    </DashboardLayout>
  );
}

export default DriverRoutes;
