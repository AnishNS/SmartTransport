import axios from "axios";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocode(lat, lng) {
  const response = await axios.get(NOMINATIM_URL, {
    params: {
      lat,
      lon: lng,
      format: "json",
      addressdetails: 1,
    },
    headers: {
      "Accept-Language": "en",
    },
  });

  if (response.data && response.data.display_name) {
    const address = response.data.address || {};
    return {
      address: response.data.display_name,
      city: address.city || address.town || address.village || address.county || address.state,
      state: address.state,
      country: address.country,
    };
  }

  throw new Error("No address found for these coordinates");
}
