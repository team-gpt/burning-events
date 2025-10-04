import type { SanFranciscoArea, Coordinates } from "~/types/events";

/**
 * Center coordinates for San Francisco neighborhoods/areas
 * These coordinates represent the approximate geographical center of each area
 */
export const AREA_CENTER_COORDINATES: Record<SanFranciscoArea, Coordinates> = {
  'soma': { lat: 37.7849, lng: -122.4094 }, // South of Market
  'mission': { lat: 37.7599, lng: -122.4148 }, // Mission District
  'mission-bay': { lat: 37.7665, lng: -122.3927 }, // Mission Bay
  'castro': { lat: 37.7609, lng: -122.4350 }, // Castro District
  'nob-hill': { lat: 37.7925, lng: -122.4151 }, // Nob Hill
  'russian-hill': { lat: 37.8014, lng: -122.4161 }, // Russian Hill
  'north-beach': { lat: 37.8066, lng: -122.4105 }, // North Beach
  'chinatown': { lat: 37.7941, lng: -122.4078 }, // Chinatown
  'financial': { lat: 37.7946, lng: -122.4006 }, // Financial District
  'union-square': { lat: 37.7880, lng: -122.4074 }, // Union Square
  'hayes-valley': { lat: 37.7756, lng: -122.4244 }, // Hayes Valley
  'pacific-heights': { lat: 37.7886, lng: -122.4394 }, // Pacific Heights
  'marina': { lat: 37.8021, lng: -122.4416 }, // Marina District
  'presidio': { lat: 37.7989, lng: -122.4662 }, // Presidio
  'richmond': { lat: 37.7806, lng: -122.4644 }, // Richmond District
  'sunset': { lat: 37.7436, lng: -122.4814 }, // Sunset District
  'haight': { lat: 37.7692, lng: -122.4481 }, // Haight-Ashbury
  'potrero-hill': { lat: 37.7587, lng: -122.4037 }, // Potrero Hill
  'dogpatch': { lat: 37.7516, lng: -122.3889 }, // Dogpatch
  'tenderloin': { lat: 37.7835, lng: -122.4134 }, // Tenderloin
  'civic-center': { lat: 37.7799, lng: -122.4187 }, // Civic Center
  'western-addition': { lat: 37.7842, lng: -122.4331 }, // Western Addition
  'fillmore': { lat: 37.7842, lng: -122.4331 }, // Fillmore (overlaps with Western Addition)
  'japantown': { lat: 37.7857, lng: -122.4297 }, // Japantown
  'lower-haight': { lat: 37.7720, lng: -122.4361 }, // Lower Haight
  'glen-park': { lat: 37.7337, lng: -122.4336 }, // Glen Park
  'bernal-heights': { lat: 37.7441, lng: -122.4156 }, // Bernal Heights
  'outer-mission': { lat: 37.7284, lng: -122.4456 }, // Outer Mission
  'excelsior': { lat: 37.7249, lng: -122.4244 }, // Excelsior
  'visitacion-valley': { lat: 37.7178, lng: -122.4039 }, // Visitacion Valley
  'bayview': { lat: 37.7312, lng: -122.3826 }, // Bayview
  'hunters-point': { lat: 37.7312, lng: -122.3826 }, // Hunters Point (overlaps with Bayview)
} as const;

/**
 * Get center coordinates for a San Francisco area
 */
export function getAreaCenterCoordinates(area: SanFranciscoArea): Coordinates {
  return AREA_CENTER_COORDINATES[area];
}

/**
 * Get coordinates for an event - either exact coordinates or area center
 */
export function getEventCoordinates(event: { coordinates?: Coordinates; area?: SanFranciscoArea }): Coordinates | null {
  if (event.coordinates) {
    return event.coordinates;
  }
  
  if (event.area) {
    return getAreaCenterCoordinates(event.area);
  }
  
  return null;
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * Uses the Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if two coordinates are within a certain radius (in meters)
 */
export function areCoordinatesNear(coord1: Coordinates, coord2: Coordinates, radiusMeters: number = 100): boolean {
  const distanceKm = calculateDistance(coord1, coord2);
  return distanceKm * 1000 <= radiusMeters;
}