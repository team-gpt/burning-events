import type { SanFranciscoArea, Coordinates } from "../types/events";

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
 * Extended mapping for database area names to coordinates
 * Maps actual database area names to San Francisco coordinates
 */
export const DATABASE_AREA_COORDINATES: Record<string, Coordinates> = {
  // Direct matches to our existing areas
  'SOMA': AREA_CENTER_COORDINATES['soma'],
  'Russian Hill': AREA_CENTER_COORDINATES['russian-hill'],
  'Mission': AREA_CENTER_COORDINATES['mission'],
  'Pacific Heights': AREA_CENTER_COORDINATES['pacific-heights'],
  'Nob Hill': AREA_CENTER_COORDINATES['nob-hill'],
  'Hayes Valley': AREA_CENTER_COORDINATES['hayes-valley'],
  'Marina': AREA_CENTER_COORDINATES['marina'],
  'Chinatown': AREA_CENTER_COORDINATES['chinatown'],
  'Dogpatch': AREA_CENTER_COORDINATES['dogpatch'],
  'North Beach': AREA_CENTER_COORDINATES['north-beach'],
  'Haight Ashbury': AREA_CENTER_COORDINATES['haight'],
  'Potrero Hill': AREA_CENTER_COORDINATES['potrero-hill'],
  'Castro': AREA_CENTER_COORDINATES['castro'],
  'Mission Bay': AREA_CENTER_COORDINATES['mission-bay'],
  'Civic Center': AREA_CENTER_COORDINATES['civic-center'],
  'Lower Haight': AREA_CENTER_COORDINATES['lower-haight'],
  
  // Additional SF areas with specific coordinates
  'Jackson Square': { lat: 37.7957, lng: -122.4024 },
  'FiDi (SF)': AREA_CENTER_COORDINATES['financial'], // Financial District
  'Downtown (SF)': { lat: 37.7879, lng: -122.4075 }, // Downtown/Union Square area
  'Duboce Triangle': { lat: 37.7692, lng: -122.4336 },
  'Union Square (SF)': AREA_CENTER_COORDINATES['union-square'],
  'Embarcadero': { lat: 37.7955, lng: -122.3937 },
  'Golden Gate Park': { lat: 37.7694, lng: -122.4862 },
  'Ocean Beach': { lat: 37.7544, lng: -122.5108 },
  'Salesforce Park': { lat: 37.7895, lng: -122.3967 },
  'Virtual (SF)': AREA_CENTER_COORDINATES['financial'], // Default to downtown for virtual events
  'Design District': AREA_CENTER_COORDINATES['soma'], // Part of SOMA
  'Rincon Hill': { lat: 37.7877, lng: -122.3927 },
  'South Beach': { lat: 37.7767, lng: -122.3912 },
  'NOPA': { lat: 37.7842, lng: -122.4331 }, // North of Panhandle
  "Fisherman's Wharf": { lat: 37.8080, lng: -122.4177 },
  'Cow Hollow': { lat: 37.7991, lng: -122.4394 },
  'Telegraph Hill': { lat: 37.8021, lng: -122.4058 },
  'Presidio Heights': { lat: 37.7886, lng: -122.4549 },
  'Lower Nob Hill': { lat: 37.7903, lng: -122.4151 },
  'Alamo Square': { lat: 37.7766, lng: -122.4341 },
  
  // Bay Area locations (outside SF but in the general region)
  'Culver City': { lat: 34.0211, lng: -118.3965 }, // LA area - far but included
  'Venice': { lat: 34.0195, lng: -118.4912 }, // LA area
  'Inglewood': { lat: 33.9617, lng: -118.3531 }, // LA area
  'San Mateo': { lat: 37.5630, lng: -122.3255 },
  'Stanford': { lat: 37.4275, lng: -122.1697 },
  'Palo Alto': { lat: 37.4419, lng: -122.1430 },
  'Hillsborough': { lat: 37.5747, lng: -122.3480 },
  'Oyster Point': { lat: 37.6647, lng: -122.3927 },
  'Mountain View': { lat: 37.3861, lng: -122.0839 },
  'East Bay': { lat: 37.8044, lng: -122.2712 }, // Oakland area
} as const;

/**
 * Get coordinates for any area name (from database or predefined areas)
 */
export function getAreaCoordinatesFlexible(areaName: string): Coordinates | null {
  // First try the database mapping
  if (DATABASE_AREA_COORDINATES[areaName]) {
    return DATABASE_AREA_COORDINATES[areaName];
  }
  
  // Then try the original SanFranciscoArea mapping if it's a valid key
  if (areaName in AREA_CENTER_COORDINATES) {
    return AREA_CENTER_COORDINATES[areaName as SanFranciscoArea];
  }
  
  return null;
}

/**
 * Get coordinates for an event - either exact coordinates or area center
 */
export function getEventCoordinates(event: { coordinates?: Coordinates; area?: string }): Coordinates | null {
  if (event.coordinates) {
    return event.coordinates;
  }
  
  if (event.area) {
    return getAreaCoordinatesFlexible(event.area);
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