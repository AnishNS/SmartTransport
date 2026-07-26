import { Route } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function AdminRoutes() {
  return (
    <DashboardLayout title="Route Management" role="admin">
      <PageHeader
        title="Route Management"
        subtitle="Configure and optimize route networks."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Route Management" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Route}
        title="Route Management"
        description="This feature is under development. You will soon be able to configure and manage route networks."
      />
    </DashboardLayout>
  );
}

export default AdminRoutes;
