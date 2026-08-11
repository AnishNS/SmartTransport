import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Shield,
  Navigation,
  Bus,
  Route,
  Clock,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Settings,
  Bell,
  CheckCircle2,
  Lock,
  ChevronRight,
  Home,
  PhoneCall,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getPassengerProfile } from "../../services/mock/passengerService";
import {
  getCurrentDriver,
  getAssignedVehicle,
  getAssignedRoute,
} from "../../services/mock/driverService";
import { getAdminProfile } from "../../services/mock/adminService";
import { authService } from "../../services/auth";

const dashboardPaths = { passenger: "/passenger", driver: "/driver", admin: "/admin" };

const roleConfig = {
  passenger: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
    icon: User,
  },
  driver: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    icon: Navigation,
  },
  admin: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    gradient: "from-violet-500 to-violet-600",
    icon: Shield,
  },
};

// Identity (name, email, phone, role) is always read from the authenticated
// session so the profile reflects the account that actually logged in.
// Driver/admin operational details (vehicle, route, shift, department, region)
// still come from the demo data layer until backend management exists.
function getProfile(role, user) {
  if (role === "driver") {
    const driver = getCurrentDriver();
    const vehicle = getAssignedVehicle(driver?.id);
    const route = getAssignedRoute(driver?.id);
    return {
      name: user?.name || driver?.name || "Driver",
      email: user?.email || "driver@smarttransport.com",
      role: "Driver",
      details: [
        { icon: User, label: "Employee Code", value: driver?.employeeCode || "—" },
        { icon: Phone, label: "Contact", value: user?.phone || driver?.contact || "—" },
        { icon: Bus, label: "Assigned Vehicle", value: vehicle?.vehicleNumber || "—" },
        { icon: Route, label: "Assigned Route", value: route ? `Route ${route.routeNumber}` : "—" },
        { icon: Clock, label: "Shift", value: driver?.shift ? `${driver.shift.label} (${driver.shift.start} – ${driver.shift.end})` : "—" },
        { icon: Shield, label: "License Number", value: driver?.licenseNumber || "—" },
      ],
    };
  }

  if (role === "admin") {
    const profile = getAdminProfile();
    return {
      name: user?.name || profile.name,
      email: user?.email || profile.email,
      role: "Admin",
      details: [
        { icon: Shield, label: "Role", value: "Administrator" },
        { icon: MapPin, label: "Region", value: profile.region },
        { icon: Phone, label: "Contact", value: user?.phone || profile.phone },
        { icon: User, label: "Department", value: profile.department },
      ],
    };
  }

  const profile = getPassengerProfile();
  return {
    name: user?.name || "Passenger",
    email: user?.email || "",
    role: "Passenger",
    details: [
      { icon: Phone, label: "Phone Number", value: user?.phone || "—" },
      { icon: Home, label: "Address", value: user?.address || "—" },
      { icon: PhoneCall, label: "Emergency Contact", value: user?.emergencyContact || "—" },
      { icon: Bus, label: "Membership", value: profile.membership },
      { icon: Navigation, label: "Commute Preference", value: profile.commutePreference },
    ],
  };
}

const defaultSettings = {
  email: true,
  push: true,
  delayAlerts: true,
  weeklyDigest: false,
};

function Profile({ role = "passenger" }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const profile = getProfile(role, user);
  const config = roleConfig[role] || roleConfig.passenger;
  const [settings, setSettings] = useState(defaultSettings);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const logout = () => {
    authService.logoutUser();
    navigate("/login");
  };

  const settingsRows = [
    { key: "email", label: "Email Notifications", description: "Receive route and account updates by email.", icon: Mail },
    { key: "push", label: "Push Notifications", description: "Get real-time vehicle alerts on this device.", icon: Bell },
    { key: "delayAlerts", label: "Delay Alerts", description: "Be notified when your trips are running late.", icon: Clock },
    { key: "weeklyDigest", label: "Weekly Digest", description: "A summary of your activity every Monday morning.", icon: CheckCircle2 },
  ];

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${config.gradient}`} />
            <div className="flex flex-col items-center pt-4 text-center">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}
              >
                <config.icon size={40} />
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-900">
                {profile.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
              <span className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}>
                {profile.role}
              </span>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
              <h3 className="text-lg font-semibold tracking-tight text-gray-900">Account Details</h3>
            </div>
            <div className="space-y-4">
              {profile.details.map((detail) => (
                <div key={detail.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <detail.icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{detail.label}</p>
                    <p className="truncate text-sm font-medium text-gray-900">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">Account Settings</h3>
              </div>
              <Settings size={18} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {settingsRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <row.icon size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{row.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting(row.key)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                      settings[row.key] ? "bg-blue-600" : "bg-gray-200"
                    }`}
                    aria-label={row.label}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${
                        settings[row.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
              <h3 className="text-lg font-semibold tracking-tight text-gray-900">Security</h3>
            </div>
            <div className="space-y-3">
              <button className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Lock size={18} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Change Password</p>
                    <p className="mt-0.5 text-xs text-gray-500">Update your account password regularly.</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            </div>
          </Card>

          <Card className="border-red-100">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <LogOut size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Sign out of your account</p>
                  <p className="mt-0.5 text-xs text-gray-500">You can sign back in any time.</p>
                </div>
              </div>
              <Button variant="primary" size="md" icon={LogOut} onClick={logout} className="bg-red-600 hover:bg-red-700 focus:ring-red-500/30">
                Logout
              </Button>
            </div>
          </Card>

          <p className="text-center text-xs text-gray-400">
            Need help?{" "}
            <Link to={dashboardPaths[role]} className="font-medium text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;