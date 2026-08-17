import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { notificationService } from "../services/notification";
import { useAuth } from "../context/AuthContext";

function DashboardLayout({ title, role = "passenger", children, user }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const { user: sessionUser } = useAuth();
  const currentUser = user || sessionUser;

  useEffect(() => {
    let active = true;
    notificationService
      .listNotifications()
      .then((notifications) => {
        if (!active) return;
        setNotificationCount(
          notifications.filter((n) => n.is_read !== true).length
        );
      })
      .catch(() => {
        if (active) setNotificationCount(0);
      });
    return () => {
      active = false;
    };
  }, [location.pathname, currentUser?.id]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        role={role}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <DashboardNavbar
          title={title}
          onToggleSidebar={toggleSidebar}
          notificationCount={notificationCount}
          user={currentUser}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="pt-16">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}

export default DashboardLayout;
