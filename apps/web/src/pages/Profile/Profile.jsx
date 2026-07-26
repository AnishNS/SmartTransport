import { User } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

const dashboardPaths = { passenger: "/passenger", driver: "/driver", admin: "/admin" };

function Profile({ role = "passenger" }) {
  return (
    <DashboardLayout title="Profile" role={role}>
      <PageHeader
        title="Profile"
        subtitle="Manage your profile and account settings."
        breadcrumbs={[
          { label: "Dashboard", href: dashboardPaths[role] },
          { label: "Profile" },
        ]}
      />
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          Coming Soon
        </span>
      </div>
      <EmptyState
        icon={User}
        title="Profile"
        description="This feature is under development. You will soon be able to manage your profile and preferences."
      />
    </DashboardLayout>
  );
}

export default Profile;
