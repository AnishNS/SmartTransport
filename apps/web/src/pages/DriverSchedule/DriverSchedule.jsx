import { Calendar } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

function DriverSchedule() {
  return (
    <DashboardLayout title="Schedule" role="driver">
      <PageHeader
        title="Schedule"
        subtitle="Manage your weekly schedule and shifts."
        breadcrumbs={[
          { label: "Dashboard", href: "/driver" },
          { label: "Schedule" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={Calendar}
        title="Schedule"
        description="This feature is under development. You will soon be able to manage your schedule and shifts."
      />
    </DashboardLayout>
  );
}

export default DriverSchedule;
