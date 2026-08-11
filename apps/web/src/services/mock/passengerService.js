// Mock passenger service.
//
// Supplies the Passenger Dashboard with profile, favourite routes, recent
// trips, notifications and shared passenger statistics derived from the mock
// data layer.

import {
  passengerProfile,
  favouriteRoutes,
  recentTrips,
  passengerNotifications,
  dailyPassengerCount,
  weeklyPassengerData,
} from "../../data/mock/passengerData";

export function getPassengerProfile() {
  return passengerProfile;
}

export function getFavouriteRoutes() {
  return favouriteRoutes;
}

export function getRecentTrips() {
  return recentTrips;
}

export function getPassengerNotifications() {
  return passengerNotifications;
}

export function getSavedRoutesCount() {
  return favouriteRoutes.length;
}

export function getDailyPassengerCount() {
  return dailyPassengerCount;
}

export function getWeeklyPassengerData() {
  return weeklyPassengerData;
}
