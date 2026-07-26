import { Route } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function RoutePlanner() {
  return (
    <DashboardLayout title="Route Planner" role="passenger">
      <PageHeader
        title="Route Planner"
        subtitle="Plan and optimize your travel routes efficiently."
        breadcrumbs={[
          { label: "Dashboard", href: "/passenger" },
          { label: "Route Planner" },
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
        title="Route Planner"
        description="This feature is under development. You will soon be able to plan and optimize your routes."
      />
    </DashboardLayout>
  );
}

export default RoutePlanner;
