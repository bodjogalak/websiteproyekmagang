// Diskominfo Sulut Office Coordinates
export const OFFICE_LOCATION = {
  lat: 1.469940076052675,
  lng: 124.84486754110868
};

// Maximum allowed distance in meters
export const MAX_DISTANCE_METERS = 132.52; 

/**
 * Calculates the distance between two points using the Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (
    lat1 === undefined || lon1 === undefined || 
    lat2 === undefined || lon2 === undefined ||
    Number.isNaN(lat1) || Number.isNaN(lon1) || 
    Number.isNaN(lat2) || Number.isNaN(lon2)
  ) {
    throw new Error("Invalid coordinate data provided");
  }
  
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};