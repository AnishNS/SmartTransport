import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Route,
  Bell,
  User,
  Navigation,
  Calendar,
  Truck,
  BarChart3,
  Users,
  ChevronLeft,
  Bus,
} from "lucide-react";

const menuConfig = {
  passenger: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/passenger" },
    { label: "Live Tracking", icon: Map, path: "/passenger/tracking" },
    { label: "Route Planner", icon: Route, path: "/passenger/routes" },
    { label: "Notifications", icon: Bell, path: "/passenger/notifications" },
    { label: "Profile", icon: User, path: "/passenger/profile" },
  ],
  driver: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/driver" },
    { label: "My Routes", icon: Navigation, path: "/driver/routes" },
    { label: "Schedule", icon: Calendar, path: "/driver/schedule" },
    { label: "Notifications", icon: Bell, path: "/driver/notifications" },
    { label: "Profile", icon: User, path: "/driver/profile" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Fleet Management", icon: Truck, path: "/admin/fleet" },
    { label: "Route Management", icon: Route, path: "/admin/routes" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { label: "Drivers", icon: Users, path: "/admin/drivers" },
    { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    { label: "Profile", icon: User, path: "/admin/profile" },
  ],
};

function Sidebar({ collapsed, onToggle, role = "passenger", mobileOpen, onMobileClose }) {
  const location = useLocation();
  const items = menuConfig[role] || menuConfig.passenger;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div
          className={`flex h-16 items-center border-b border-slate-800/60 px-4 ${collapsed ? "lg:justify-center" : "lg:justify-between"}`}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/20">
              <Bus size={18} className="text-white" />
            </div>
            <span
              className={`text-base font-bold tracking-tight text-white transition-all duration-200 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              Smart<span className="text-blue-400">Transport</span>
            </span>
          </Link>
          <button
            onClick={onToggle}
            className={`hidden rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 lg:inline-flex ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      collapsed ? "lg:justify-center lg:px-2" : ""
                    } ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`shrink-0 ${active ? "text-white" : "text-slate-500"}`}
                    />
                    <span
                      className={`transition-opacity duration-200 ${
                        collapsed ? "lg:hidden" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={`border-t border-slate-800/60 p-3 ${collapsed ? "lg:text-center" : ""}`}
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-500 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800">
              <span className="text-[10px] font-bold text-slate-400">v</span>
            </div>
            <span className={collapsed ? "lg:hidden" : ""}>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
