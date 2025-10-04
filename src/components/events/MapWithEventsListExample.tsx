/**
 * MapWithEventsList Usage Example
 * 
 * This file demonstrates how to integrate EventMap with MapEventsList
 * for a complete map-based event discovery experience.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { EventMap } from './EventMap';
import { MapEventsList } from './MapEventsList';
import { useEventFilters } from '~/hooks/useEventFilters';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { MapPin, Calendar, Filter, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { Event, LocationFilter, EventCategory } from '~/types/events';
import { getAreaDisplayName } from '~/types/events';

type MapWithEventsListExampleProps = {
  events: Event[];
  className?: string;
};

export function MapWithEventsListExample({ 
  events, 
  className 
}: MapWithEventsListExampleProps) {
  const [activeLocationFilter, setActiveLocationFilter] = useState<LocationFilter>();
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Use the existing event filters hook with location filter
  const {
    filters,
    filteredEvents,
    setLocationFilter,
    setCategoryFilter,
    clearLocationFilter,
    resetFilters,
  } = useEventFilters({ 
    events, 
    initialFilters: { 
      type: 'upcoming',
      category: 'all',
      location: activeLocationFilter 
    }
  });

  // Handle location filter changes from map interactions
  const handleLocationFilter = useCallback((locationFilter: LocationFilter) => {
    setIsMapLoading(true);
    setActiveLocationFilter(locationFilter);
    setLocationFilter(locationFilter);
    
    // Simulate filtering delay for better UX
    setTimeout(() => {
      setIsMapLoading(false);
    }, 300);
  }, [setLocationFilter]);

  // Handle clearing location filter
  const handleClearLocationFilter = useCallback(() => {
    setActiveLocationFilter(undefined);
    clearLocationFilter();
  }, [clearLocationFilter]);

  // Category filter options
  const categoryOptions: Array<{ value: EventCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'Conference', label: 'Conferences' },
    { value: 'Workshop', label: 'Workshops' },
    { value: 'Meetup', label: 'Meetups' },
    { value: 'Social', label: 'Social Events' },
    { value: 'Networking', label: 'Networking' },
    { value: 'Webinar', label: 'Webinars' },
  ];

  // Generate filter summary for display
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    
    if (filters.category !== 'all') {
      parts.push(filters.category);
    }
    
    if (activeLocationFilter?.areas && activeLocationFilter.areas.length > 0) {
      if (activeLocationFilter.areas.length === 1) {
        const area = activeLocationFilter.areas[0];
        parts.push(area ? `in ${getAreaDisplayName(area)}` : 'in selected area');
      } else {
        parts.push(`in ${activeLocationFilter.areas.length} areas`);
      }
    } else if (activeLocationFilter?.center && activeLocationFilter?.radius) {
      parts.push(`within ${activeLocationFilter.radius}km`);
    }
    
    return parts.length > 0 ? parts.join(' ') : 'All events';
  }, [filters.category, activeLocationFilter]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter Controls Header */}
      <Card className="border-neutral-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Event Map & List
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {filteredEvents.length} events
              </Badge>
              {(activeLocationFilter || filters.category !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-neutral-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Category:</span>
            <div className="flex gap-2 flex-wrap">
              {categoryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.category === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <span className="text-sm text-neutral-600">
              Showing: <span className="font-medium text-neutral-900">{filterSummary}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Map and Events Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <Card className="border-neutral-200">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-600" />
              <h3 className="font-medium text-neutral-900">Event Locations</h3>
              {activeLocationFilter && (
                <Badge variant="outline" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
          </div>
          
          <div className="relative">
            <EventMap
              events={filteredEvents}
              onLocationFilter={handleLocationFilter}
              selectedLocations={activeLocationFilter ? [activeLocationFilter] : undefined}
              className="h-[500px] rounded-b-lg"
            />
            {isMapLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-b-lg">
                <div className="flex items-center gap-2 text-neutral-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Updating map...</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Events List Section */}
        <Card className="border-neutral-200">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-600" />
                <h3 className="font-medium text-neutral-900">Events</h3>
              </div>
              {activeLocationFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLocationFilter}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            <MapEventsList
              events={filteredEvents}
              locationFilter={activeLocationFilter}
              totalEventCount={events.length}
              onClearLocationFilter={handleClearLocationFilter}
              isLoading={isMapLoading}
              className="border-0"
            />
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="border-neutral-200">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-neutral-600">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{filteredEvents.length}</div>
              <div className="text-sm text-neutral-600">Filtered Results</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredEvents.filter(e => e.coordinates).length}
              </div>
              <div className="text-sm text-neutral-600">With Locations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredEvents.map(e => e.category)).size}
              </div>
              <div className="text-sm text-neutral-600">Categories</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Example usage of the MapWithEventsListExample component:
 * 
 * ```tsx
 * import { MapWithEventsListExample } from '~/components/events/MapWithEventsListExample';
 * 
 * function EventsPage() {
 *   const { data: events, isLoading } = useEvents();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div className="container mx-auto py-8">
 *       <MapWithEventsListExample 
 *         events={events} 
 *         className="max-w-7xl mx-auto"
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * Features demonstrated:
 * - Integration between EventMap and MapEventsList
 * - State management for location filtering
 * - Category filtering combined with location filtering
 * - Loading states and user feedback
 * - Responsive layout for map and list
 * - Filter summary and statistics
 * - Clear filter actions
 */