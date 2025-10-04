/**
 * EventMap Usage Example
 * 
 * This file demonstrates how to use the EventMap component
 * with proper state management and location filtering.
 */

'use client';

import { useState, useCallback } from 'react';
import { EventMap } from './EventMap';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { MapPin, Filter, X } from 'lucide-react';
import type { Event, LocationFilter, SanFranciscoArea } from '~/types/events';
import { getAreaDisplayName } from '~/types/events';

type EventMapExampleProps = {
  events: Event[];
  className?: string;
};

export function EventMapExample({ events, className }: EventMapExampleProps) {
  const [selectedLocations, setSelectedLocations] = useState<LocationFilter[]>([]);

  // Handle location filter from map interactions
  const handleLocationFilter = useCallback((locationFilter: LocationFilter) => {
    // Check if this filter already exists
    const existingFilter = selectedLocations.find(filter => 
      JSON.stringify(filter) === JSON.stringify(locationFilter)
    );

    if (!existingFilter) {
      setSelectedLocations(prev => [...prev, locationFilter]);
    }
  }, [selectedLocations]);

  // Remove a specific location filter
  const removeLocationFilter = useCallback((index: number) => {
    setSelectedLocations(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all location filters
  const clearAllFilters = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  // Apply location filters to events
  const filteredEvents = events.filter(event => {
    if (selectedLocations.length === 0) return true;

    return selectedLocations.some(filter => {
      // Area-based filtering
      if (filter.areas && event.area) {
        return filter.areas.includes(event.area);
      }

      // Radius-based filtering
      if (filter.center && filter.radius && event.coordinates) {
        const distance = calculateDistance(event.coordinates, filter.center);
        return distance <= filter.radius;
      }

      return false;
    });
  });

  return (
    <div className={className}>
      {/* Filter Display */}
      {selectedLocations.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Active Location Filters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((filter, index) => (
                <FilterBadge
                  key={index}
                  filter={filter}
                  onRemove={() => removeLocationFilter(index)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <EventMap
        events={filteredEvents}
        onLocationFilter={handleLocationFilter}
        selectedLocations={selectedLocations}
        className="mb-4"
      />

      {/* Results Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4" />
              <span>
                Showing {filteredEvents.length} of {events.length} events
                {selectedLocations.length > 0 && ' (filtered)'}
              </span>
            </div>
            
            {selectedLocations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Show All Events
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for filter badges
function FilterBadge({ filter, onRemove }: { filter: LocationFilter; onRemove: () => void }) {
  const getFilterDescription = (filter: LocationFilter): string => {
    if (filter.areas) {
      return filter.areas.map(area => getAreaDisplayName(area)).join(', ');
    }
    
    if (filter.center && filter.radius) {
      return `${filter.radius}km radius`;
    }
    
    return 'Location filter';
  };

  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 pr-1"
    >
      <MapPin className="w-3 h-3" />
      <span className="text-xs">{getFilterDescription(filter)}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-4 w-4 p-0 hover:bg-neutral-200"
      >
        <X className="w-3 h-3" />
      </Button>
    </Badge>
  );
}

// Helper function for distance calculation (duplicated from area-coordinates.ts for example)
function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
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
 * Usage Example:
 * 
 * ```tsx
 * import { EventMapExample } from '~/components/events/EventMapExample';
 * 
 * export function EventsPage() {
 *   const events = useEvents(); // Your event data
 *   
 *   return (
 *     <div className="container mx-auto p-4">
 *       <h1 className="text-2xl font-bold mb-6">Events Map</h1>
 *       <EventMapExample 
 *         events={events}
 *         className="max-w-4xl mx-auto"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */