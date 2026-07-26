import { Map } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function LiveTracking() {
  return (
    <DashboardLayout title="Live Tracking" role="passenger">
      <PageHeader
        title="Live Tracking"
        subtitle="Track vehicles in real time on an interactive map."
        breadcrumbs={[
          { label: "Dashboard", href: "/passenger" },
          { label: "Live Tracking" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Map}
        title="Live Tracking"
        description="This feature is under development. You will soon be able to track vehicles in real time."
      />
    </DashboardLayout>
  );
}

export default LiveTracking;
