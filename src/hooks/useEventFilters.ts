"use client";

import { useState, useMemo } from "react";
import { filterEventsByTime } from "~/lib/date-utils";
import type { 
  Event, 
  EventCategory, 
  FilterType, 
  EventFilters, 
  LocationFilter,
  SanFranciscoArea,
  Coordinates 
} from "~/types/events";

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Filters events based on location criteria
 * @param events Events to filter
 * @param locationFilter Location filter configuration
 * @returns Filtered events
 */
function filterEventsByLocation(events: Event[], locationFilter: LocationFilter): Event[] {
  const filteredEvents = events.filter(event => {
    // If event has no location data and we're not including approximate, exclude it
    if (!event.coordinates && !event.area) {
      return false;
    }

    // If event only has approximate location and we're not including approximate, exclude it
    // Default to 'approximate' if locationType is not specified for backward compatibility
    const eventLocationType = event.locationType ?? 'approximate';
    if (eventLocationType === 'approximate' && !locationFilter.includeApproximate) {
      return false;
    }

    // Check if we have any location filters
    const hasAreaFilter = locationFilter.areas && locationFilter.areas.length > 0;
    const hasRadiusFilter = locationFilter.center && locationFilter.radius;

    // If no location filters are set, include all events with location data
    if (!hasAreaFilter && !hasRadiusFilter) {
      return true;
    }

    // Check if event matches area filter
    let matchesAreaFilter = false;
    if (hasAreaFilter && event.area) {
      matchesAreaFilter = locationFilter.areas!.includes(event.area);
    }

    // Check if event matches radius filter
    let matchesRadiusFilter = false;
    if (hasRadiusFilter && event.coordinates) {
      const distance = calculateDistance(locationFilter.center!, event.coordinates);
      matchesRadiusFilter = distance <= locationFilter.radius!;
    }

    // Include event if it matches ANY of the active filters
    return matchesAreaFilter || matchesRadiusFilter;
  });

  return filteredEvents;
}

interface UseEventFiltersProps {
  events?: Event[]; // Make events optional for backward compatibility
  initialFilters?: Partial<EventFilters>;
}

export function useEventFilters({ events = [], initialFilters }: UseEventFiltersProps) {
  const [filters, setFilters] = useState<EventFilters>({
    type: initialFilters?.type ?? "upcoming",
    category: initialFilters?.category ?? "all",
    location: initialFilters?.location,
  });

  // Keep filteredEvents for backward compatibility, but it will be empty if no events are passed
  const filteredEvents = useMemo(() => {
    if (events.length === 0) {
      return [];
    }

    // First filter by time (past/upcoming)
    let filtered = filterEventsByTime(events, filters.type);
    
    // Then filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter(event => event.category === filters.category);
    }
    
    // Finally filter by location if location filter is set
    if (filters.location) {
      filtered = filterEventsByLocation(filtered, filters.location);
    }
    
    return filtered;
  }, [events, filters]);

  const updateFilter = (newFilters: Partial<EventFilters>) => {
    setFilters(current => ({ ...current, ...newFilters }));
  };

  const setTimeFilter = (type: FilterType) => {
    updateFilter({ type });
  };

  const setCategoryFilter = (category: EventCategory | "all") => {
    updateFilter({ category });
  };

  const setLocationFilter = (locationFilter: LocationFilter | undefined) => {
    updateFilter({ location: locationFilter });
  };

  const clearLocationFilter = () => {
    updateFilter({ location: undefined });
  };

  const toggleAreaSelection = (area: SanFranciscoArea) => {
    const currentAreas = filters.location?.areas || [];
    const isCurrentlySelected = currentAreas.includes(area);
    
    let newAreas: SanFranciscoArea[];
    if (isCurrentlySelected) {
      // Remove area from selection
      newAreas = currentAreas.filter(a => a !== area);
    } else {
      // Add area to selection
      newAreas = [...currentAreas, area];
    }
    
    // If no areas selected, clear the location filter
    if (newAreas.length === 0) {
      updateFilter({ location: undefined });
    } else {
      // Update with new areas, keeping other location filter properties
      updateFilter({ 
        location: {
          ...filters.location,
          areas: newAreas,
          includeApproximate: true // Ensure we include approximate locations for area-based filtering
        }
      });
    }
  };

  const toggleCoordinateSelection = (coordinates: Coordinates, radius: number = 1) => {
    const currentLocation = filters.location;
    const isCurrentlySelected = currentLocation?.center && 
      currentLocation.center.lat === coordinates.lat && 
      currentLocation.center.lng === coordinates.lng;
    
    if (isCurrentlySelected) {
      // If clicking the same coordinates, clear radius-based filter but keep area filters
      if (currentLocation?.areas && currentLocation.areas.length > 0) {
        updateFilter({
          location: {
            areas: currentLocation.areas,
            includeApproximate: true
          }
        });
      } else {
        updateFilter({ location: undefined });
      }
    } else {
      // Add coordinate-based filtering, keeping existing area filters
      updateFilter({
        location: {
          ...currentLocation,
          center: coordinates,
          radius: radius,
          includeApproximate: true
        }
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      type: "upcoming",
      category: "all",
      location: undefined,
    });
  };

  return {
    filters,
    filteredEvents,
    updateFilter,
    setTimeFilter,
    setCategoryFilter,
    setLocationFilter,
    clearLocationFilter,
    toggleAreaSelection,
    toggleCoordinateSelection,
    resetFilters,
  };
}