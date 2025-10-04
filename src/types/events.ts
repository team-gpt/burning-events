export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string; // ISO string format
  location?: string;
  venue_name?: string;
  address?: string;
  area?: SanFranciscoArea;
  coordinates?: Coordinates;
  locationType?: LocationType;
  category: EventCategory;
  image?: string; // URL to event image
  description?: string;
  attendeeCount?: number;
  price?: {
    amount: number;
    currency: string;
  };
  tags?: string[];
  url: string; // URL to the event page
}

export type EventCategory =
  | "Conference"
  | "Workshop"
  | "Social"
  | "Networking"
  | "Meetup"
  | "Webinar";

export type FilterType = "upcoming" | "past";


export interface EventFilters {
  type: FilterType;
  category: EventCategory | "all";
  location?: LocationFilter;
  dateFilter?: Date;
}

export type GroupedEvents = Record<string, Event[]>;

export type DateCategory = "today" | "tomorrow" | "past" | "future";

// Location-related types
export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationType = "exact" | "approximate";

/**
 * San Francisco neighborhood areas for event categorization
 * These represent major districts and neighborhoods in SF
 */
export type SanFranciscoArea =
  | "soma" // South of Market
  | "mission" // Mission District
  | "mission-bay" // Mission Bay
  | "castro" // Castro District
  | "nob-hill" // Nob Hill
  | "russian-hill" // Russian Hill
  | "north-beach" // North Beach
  | "chinatown" // Chinatown
  | "financial" // Financial District
  | "union-square" // Union Square
  | "hayes-valley" // Hayes Valley
  | "pacific-heights" // Pacific Heights
  | "marina" // Marina District
  | "presidio" // Presidio
  | "richmond" // Richmond District
  | "sunset" // Sunset District
  | "haight" // Haight-Ashbury
  | "potrero-hill" // Potrero Hill
  | "dogpatch" // Dogpatch
  | "tenderloin" // Tenderloin
  | "civic-center" // Civic Center
  | "western-addition" // Western Addition
  | "fillmore" // Fillmore
  | "japantown" // Japantown
  | "lower-haight" // Lower Haight
  | "glen-park" // Glen Park
  | "bernal-heights" // Bernal Heights
  | "outer-mission" // Outer Mission
  | "excelsior" // Excelsior
  | "visitacion-valley" // Visitacion Valley
  | "bayview" // Bayview
  | "hunters-point" // Hunters Point
  | "embarcadero"; // Embarcadero

/**
 * Bounds for San Francisco area - useful for map viewport
 */
export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Location filter configuration
 */
export interface LocationFilter {
  /** Selected SF areas to show events from */
  areas?: SanFranciscoArea[];
  /** Center point for radius-based filtering */
  center?: Coordinates;
  /** Radius in kilometers for location-based filtering */
  radius?: number;
  /** Whether to include events with only approximate locations */
  includeApproximate?: boolean;
}

/**
 * Map marker data for rendering events on map
 */
export interface EventMarker {
  id: string;
  eventId: string;
  coordinates: Coordinates;
  locationType?: LocationType;
  title: string;
  category: EventCategory;
  date: string;
  attendeeCount?: number;
  /** Indicates if this marker represents multiple events at the same location */
  isCluster?: boolean;
  /** Number of events at this location if clustered */
  eventCount?: number;
  /** Area this marker represents (for area-based events) */
  area?: SanFranciscoArea;
  /** Whether this marker/area is currently selected */
  isSelected?: boolean;
}

/**
 * Map interaction event types
 */
export interface MapInteractionEvent {
  type: "marker-click" | "marker-hover" | "map-click" | "bounds-change";
  payload: {
    eventId?: string;
    coordinates?: Coordinates;
    bounds?: GeoBounds;
    markerId?: string;
  };
}

/**
 * Map view state for managing map display preferences
 */
export interface MapViewState {
  center: Coordinates;
  zoom: number;
  bounds?: GeoBounds;
  selectedEventId?: string;
  hoveredEventId?: string;
}

/**
 * Constants for San Francisco geography
 */
export const SF_BOUNDS: GeoBounds = {
  north: 37.8324,
  south: 37.7049,
  east: -122.3482,
  west: -122.5143,
};

export const SF_CENTER: Coordinates = {
  lat: 37.7749,
  lng: -122.4194,
};

/**
 * Area display names for UI
 */
export const AREA_DISPLAY_NAMES: Record<SanFranciscoArea, string> = {
  soma: "SoMa",
  mission: "Mission",
  "mission-bay": "Mission Bay",
  castro: "Castro",
  "nob-hill": "Nob Hill",
  "russian-hill": "Russian Hill",
  "north-beach": "North Beach",
  chinatown: "Chinatown",
  financial: "Financial District",
  "union-square": "Union Square",
  "hayes-valley": "Hayes Valley",
  "pacific-heights": "Pacific Heights",
  marina: "Marina",
  presidio: "Presidio",
  richmond: "Richmond",
  sunset: "Sunset",
  haight: "Haight-Ashbury",
  "potrero-hill": "Potrero Hill",
  dogpatch: "Dogpatch",
  tenderloin: "Tenderloin",
  "civic-center": "Civic Center",
  "western-addition": "Western Addition",
  fillmore: "Fillmore",
  japantown: "Japantown",
  "lower-haight": "Lower Haight",
  "glen-park": "Glen Park",
  "bernal-heights": "Bernal Heights",
  "outer-mission": "Outer Mission",
  excelsior: "Excelsior",
  "visitacion-valley": "Visitacion Valley",
  bayview: "Bayview",
  "hunters-point": "Hunters Point",
  embarcadero: "Embarcadero",
} as const;

/**
 * Utility type for extracting area keys
 */
export type SanFranciscoAreaKey = keyof typeof AREA_DISPLAY_NAMES;

/**
 * Type guard to check if a string is a valid San Francisco area
 */
export function isSanFranciscoArea(value: string): value is SanFranciscoArea {
  return value in AREA_DISPLAY_NAMES;
}

/**
 * Helper function to get display name for an area
 */
export function getAreaDisplayName(area: SanFranciscoArea): string {
  return AREA_DISPLAY_NAMES[area];
}

/**
 * Helper function to convert Event to EventMarker
 */
export function eventToMarker(event: Event): EventMarker | null {
  if (!event.coordinates) {
    return null;
  }

  return {
    id: `marker-${event.id}`,
    eventId: event.id,
    coordinates: event.coordinates,
    locationType: event.locationType,
    title: event.title,
    category: event.category,
    date: event.date,
    attendeeCount: event.attendeeCount,
    isCluster: false,
    eventCount: 1,
  };
}

/**
 * Helper function to create a location filter for specific areas
 */
export function createAreaLocationFilter(
  areas: SanFranciscoArea[],
  includeApproximate: boolean = true,
): LocationFilter {
  return {
    areas,
    includeApproximate,
  };
}

/**
 * Helper function to create a location filter for radius-based filtering
 */
export function createRadiusLocationFilter(
  center: Coordinates,
  radius: number,
  includeApproximate: boolean = true,
): LocationFilter {
  return {
    center,
    radius,
    includeApproximate,
  };
}
