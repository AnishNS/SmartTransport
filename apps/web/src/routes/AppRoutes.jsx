import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { authService } from "../services/auth";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import PassengerDashboard from "../pages/PassengerDashboard/PassengerDashboard";
import DriverDashboard from "../pages/DriverDashboard/DriverDashboard";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import LiveTracking from "../pages/LiveTracking/LiveTracking";
import RoutePlanner from "../pages/RoutePlanner/RoutePlanner";
import Analytics from "../pages/Analytics/Analytics";
import Notifications from "../pages/Notifications/Notifications";
import Profile from "../pages/Profile/Profile";
import DriverRoutes from "../pages/DriverRoutes/DriverRoutes";
import DriverSchedule from "../pages/DriverSchedule/DriverSchedule";
import FleetManagement from "../pages/FleetManagement/FleetManagement";
import AdminRoutes from "../pages/AdminRoutes/AdminRoutes";
import AdminDrivers from "../pages/AdminDrivers/AdminDrivers";

// Renders `children` only when the current session user's role is included in
// `roles`. Otherwise the user is redirected: signed-out users go to /login,
// signed-in users are sent to their own dashboard. The destination is always
// derived from the authenticated user's actual role, never from the URL.
function ProtectedRoute({ roles, children }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={authService.roleHomePath[user.role] || "/"} replace />;
  }

  return children;
}

// Role-aware fallback for unknown URLs: signed-in users go to their dashboard,
// everyone else lands on the public home page.
function FallbackRoute() {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={authService.roleHomePath[user.role] || "/"} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/tracking"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <LiveTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/routes"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <RoutePlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/notifications"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <Notifications role="passenger" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/profile"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <Profile role="passenger" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute roles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/routes"
          element={
            <ProtectedRoute roles={["driver"]}>
              <DriverRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/schedule"
          element={
            <ProtectedRoute roles={["driver"]}>
              <DriverSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/notifications"
          element={
            <ProtectedRoute roles={["driver"]}>
              <Notifications role="driver" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute roles={["driver"]}>
              <Profile role="driver" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fleet"
          element={
            <ProtectedRoute roles={["admin"]}>
              <FleetManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/routes"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Notifications role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Profile role="admin" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
