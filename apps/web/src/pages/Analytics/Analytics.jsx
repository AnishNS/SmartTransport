import { BarChart3 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function Analytics() {
  return (
    <DashboardLayout title="Analytics" role="admin">
      <PageHeader
        title="Analytics"
        subtitle="View detailed analytics and performance insights."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={BarChart3}
        title="Analytics"
        description="This feature is under development. You will soon be able to view detailed analytics and insights."
      />
    </DashboardLayout>
  );
}

export default Analytics;
