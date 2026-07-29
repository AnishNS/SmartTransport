export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
      },
      (err) => reject(translateGeolocationError(err)),
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      },
    );
  });
}

export function translateGeolocationError(err) {
  let message;
  switch (err.code) {
    case err.PERMISSION_DENIED:
      message = "Location permission denied. Please enable location access in your browser settings.";
      break;
    case err.POSITION_UNAVAILABLE:
      message = "Location information is unavailable";
      break;
    case err.TIMEOUT:
      message = "The request to get your location timed out";
      break;
    default:
      message = "An unknown error occurred while getting location";
  }
  return new Error(message);
}
