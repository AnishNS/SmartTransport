// Mock passenger data used by the Passenger dashboard (stats, favourites,
// recent trips, notifications) and shared admin analytics (daily passenger
// count + weekly trend).

export const passengerProfile = {
  id: "PS-001",
  name: "Ananya Iyer",
  email: "ananya@example.com",
  membership: "Smart Pass Member",
  commutePreference: "Bus",
};

export const favouriteRoutes = [
  { name: "Home → Office", from: "Gandhi Nagar", to: "Tech Park", frequency: "Daily" },
  { name: "Office → Home", from: "Tech Park", to: "Gandhi Nagar", frequency: "Daily" },
  { name: "Home → Market", from: "Gandhi Nagar", to: "City Market", frequency: "Weekends" },
];

export const recentTrips = [
  { from: "Bus Stand", to: "Gandhi Nagar", date: "Today, 8:30 AM", route: "Route 1C" },
  { from: "Tech Park", to: "Bus Stand", date: "Today, 6:15 PM", route: "Route 8M" },
  { from: "City Market", to: "Gandhi Nagar", date: "Yesterday, 10:00 AM", route: "Route 7G" },
  { from: "Railway Stn", to: "Tech Park", date: "Yesterday, 7:45 AM", route: "Route 2S" },
];

export const passengerNotifications = [
  { title: "Route 1C is on schedule", description: "Your bus will arrive at Gandhi Nagar stop in 2 minutes.", time: "Just now", type: "info" },
  { title: "Delay on Route 7G", description: "Route 7G is delayed by approximately 8 minutes due to traffic.", time: "15 min ago", type: "warning" },
  { title: "Route 2S occupancy alert", description: "Bus on Route 2S is at 85% capacity. Consider the next bus.", time: "1 hour ago", type: "alert" },
];

// Daily passenger count across the whole network (today).
export const dailyPassengerCount = 1847;

// Weekly passenger trend for the admin analytics preview.
export const weeklyPassengerData = [
  { day: "Mon", passengers: 1720 },
  { day: "Tue", passengers: 1590 },
  { day: "Wed", passengers: 1780 },
  { day: "Thu", passengers: 1660 },
  { day: "Fri", passengers: 1847 },
  { day: "Sat", passengers: 1420 },
  { day: "Sun", passengers: 1290 },
];
