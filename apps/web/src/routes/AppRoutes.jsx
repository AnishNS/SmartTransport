import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/passenger" element={<PassengerDashboard />} />
        <Route path="/passenger/tracking" element={<LiveTracking />} />
        <Route path="/passenger/routes" element={<RoutePlanner />} />
        <Route path="/passenger/notifications" element={<Notifications role="passenger" />} />
        <Route path="/passenger/profile" element={<Profile role="passenger" />} />

        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/driver/routes" element={<DriverRoutes />} />
        <Route path="/driver/schedule" element={<DriverSchedule />} />
        <Route path="/driver/notifications" element={<Notifications role="driver" />} />
        <Route path="/driver/profile" element={<Profile role="driver" />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/fleet" element={<FleetManagement />} />
        <Route path="/admin/routes" element={<AdminRoutes />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/drivers" element={<AdminDrivers />} />
        <Route path="/admin/notifications" element={<Notifications role="admin" />} />
        <Route path="/admin/profile" element={<Profile role="admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;