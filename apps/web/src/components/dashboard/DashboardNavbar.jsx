import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bus, Bell, ChevronDown, User, Settings, LogOut, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getInitials } from "../../utils/format";

function DashboardNavbar({ title, onToggleSidebar, notificationCount = 0, user, sidebarCollapsed }) {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const role = ["passenger", "driver", "admin"].includes(pathParts[1]) ? pathParts[1] : "passenger";
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user: sessionUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentUser = user || sessionUser;
  const avatarInitials = getInitials(currentUser?.name) || "U";

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={`fixed right-0 top-0 z-30 h-16 border-b border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-900/80 ${
        sidebarCollapsed ? "lg:left-20" : "lg:left-64"
      } left-0`}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-xl p-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-600/20">
                <Bus size={18} className="text-white" />
              </div>
              <span className="hidden text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:block">
                Smart<span className="text-blue-600">Transport</span>
              </span>
            </Link>
            <span className="hidden h-5 w-px bg-gray-200 md:block" />
            <h1 className="hidden text-sm font-medium text-gray-600 md:block">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => navigate(`/${role}/notifications`)}
            className="relative rounded-xl p-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 transition-colors hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                {avatarInitials}
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl shadow-black/5 ring-1 ring-black/5">
                <div className="border-b border-gray-100 px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser?.name || "User"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {currentUser?.email || "user@smarttransport.in"}
                  </p>
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      navigate(`/${role}/profile`);
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/${role}/profile`);
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Settings size={16} /> Settings
                  </button>
                </div>
                <div className="mt-1 border-t border-gray-100 pt-1">
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
