import { Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function AdminDrivers() {
  return (
    <DashboardLayout title="Drivers" role="admin">
      <PageHeader
        title="Drivers"
        subtitle="Manage driver accounts and assignments."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Drivers" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Users}
        title="Drivers"
        description="This feature is under development. You will soon be able to manage driver accounts and assignments."
      />
    </DashboardLayout>
  );
}

export default AdminDrivers;
