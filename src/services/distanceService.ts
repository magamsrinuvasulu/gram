/**
 * Distance & Travel Estimation Utility for Rural Healthcare
 * Uses the Haversine Formula with rural road network topology adjustments
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // in meters
  source?: 'gps' | 'village_preset' | 'manual';
  label?: string;
}

export interface TravelEstimate {
  straightDistanceKm: number;
  roadDistanceKm: number;
  walking: {
    minutes: number;
    formatted: string;
    steps: number;
    calories: number;
  };
  vehicle: {
    minutes: number;
    formatted: string;
  };
  ambulance: {
    minutes: number;
    formatted: string;
  };
  bearing: string;
  compassAngle: number;
}

// Common rural village reference coordinates
export const VILLAGE_COORDINATE_PRESETS: { id: string; name: string; nameTe: string; nameHi: string; coords: Coordinates }[] = [
  {
    id: 'rampur',
    name: 'Rampur Village (Mandal Center)',
    nameTe: 'రాంపూర్ గ్రామం (మండల కేంద్రం)',
    nameHi: 'रामपुर गांव (मंडल केंद्र)',
    coords: { latitude: 16.5360, longitude: 80.7960, source: 'village_preset', label: 'Rampur Village Center' },
  },
  {
    id: 'gannavaram_town',
    name: 'Gannavaram Gram Panchayat',
    nameTe: 'గన్నవరం గ్రామ పంచాయతీ',
    nameHi: 'गन्नावरम ग्राम पंचायत',
    coords: { latitude: 16.5410, longitude: 80.8010, source: 'village_preset', label: 'Gannavaram Panchayat' },
  },
  {
    id: 'mustabada_rural',
    name: 'Mustabada Village Center',
    nameTe: 'ముస్తాబాద గ్రామ కేంద్రం',
    nameHi: 'मुस्तबादा ग्राम केंद्र',
    coords: { latitude: 16.5780, longitude: 80.7480, source: 'village_preset', label: 'Mustabada Village' },
  },
  {
    id: 'telaprolu_village',
    name: 'Telaprolu Village',
    nameTe: 'తేలప్రోలు గ్రామం',
    nameHi: 'तेलाप्रोलु गांव',
    coords: { latitude: 16.5690, longitude: 80.8650, source: 'village_preset', label: 'Telaprolu Village' },
  },
];

export const DEFAULT_VILLAGE_COORDINATES: Coordinates = VILLAGE_COORDINATE_PRESETS[0].coords;

/**
 * Calculates straight-line distance in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

/**
 * Calculates compass bearing from origin to destination
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { direction: string; angle: number } {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ['North (N)', 'North-East (NE)', 'East (E)', 'South-East (SE)', 'South (S)', 'South-West (SW)', 'West (W)', 'North-West (NW)'];
  const index = Math.round(brng / 45) % 8;

  return {
    direction: directions[index],
    angle: Math.round(brng),
  };
}

/**
 * Computes walking, vehicle, and emergency ambulance transit time and distance
 * In rural road networks, roads weave around agricultural fields and canals.
 * A rural circuity detour factor of ~1.26 applies.
 */
export function calculateTravelEstimate(
  userLat: number,
  userLon: number,
  destLat: number,
  destLon: number
): TravelEstimate {
  const straightKm = calculateHaversineDistanceKm(userLat, userLon, destLat, destLon);
  
  // Rural road circuity multiplier (typically 1.22x - 1.28x)
  const roadKm = Number((straightKm * 1.26).toFixed(1));

  // Walking: average rural walking pace is 4.5 km/h (75 m/min)
  const walkingMinutes = Math.max(1, Math.round((roadKm / 4.5) * 60));
  const steps = Math.round(roadKm * 1320); // ~1320 steps per km
  const calories = Math.round(roadKm * 55); // ~55 kcal per km

  // Two-Wheeler / Auto: average rural link road speed 24 km/h
  const vehicleMinutes = Math.max(1, Math.round((roadKm / 24) * 60));

  // 108 Emergency Ambulance: average 40 km/h with siren
  const ambulanceMinutes = Math.max(1, Math.round((roadKm / 40) * 60));

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
  };

  const bearingInfo = calculateBearing(userLat, userLon, destLat, destLon);

  return {
    straightDistanceKm: straightKm,
    roadDistanceKm: roadKm,
    walking: {
      minutes: walkingMinutes,
      formatted: formatDuration(walkingMinutes),
      steps,
      calories,
    },
    vehicle: {
      minutes: vehicleMinutes,
      formatted: formatDuration(vehicleMinutes),
    },
    ambulance: {
      minutes: ambulanceMinutes,
      formatted: formatDuration(ambulanceMinutes),
    },
    bearing: bearingInfo.direction,
    compassAngle: bearingInfo.angle,
  };
}

/**
 * Generates direct Google Maps walking direction URL
 */
export function getGoogleMapsWalkingUrl(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${destLat},${destLon}&travelmode=walking`;
}

/**
 * Generates direct Google Maps driving/vehicle direction URL
 */
export function getGoogleMapsDrivingUrl(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${destLat},${destLon}&travelmode=driving`;
}
