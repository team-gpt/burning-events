/**
 * MapEventsList Component
 * 
 * A specialized event list component optimized for map view interactions.
 * Displays filtered events below the map using the same layout and styling 
 * as the main EventsTimeline component while providing location-specific features.
 * 
 * Features:
 * - Reuses existing EventCard and DateGroupHeader components
 * - Shows location filter summary with clear action
 * - Handles area-based and radius-based filtering
 * - Provides loading states and empty state handling
 * - Responsive design with proper accessibility
 * - Smooth animations using Framer Motion
 * 
 * @example
 * ```tsx
 * <MapEventsList 
 *   events={filteredEvents}
 *   locationFilter={{ areas: ['soma'], includeApproximate: true }}
 *   totalEventCount={allEvents.length}
 *   onClearLocationFilter={() => setLocationFilter(undefined)}
 *   isLoading={false}
 * />
 * ```
 */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Search } from "lucide-react";
import { DateGroupHeader } from "./DateGroupHeader";
import { EventCard } from "./EventCard";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { useEventGrouping } from "~/hooks/useEventGrouping";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { Event, LocationFilter } from "~/types/events";
import { getAreaDisplayName } from "~/types/events";

/**
 * Props for the MapEventsList component
 */
interface MapEventsListProps {
  /** Filtered events to display */
  events: Event[];
  /** Active location filter configuration */
  locationFilter?: LocationFilter;
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Total count of events before filtering (for display in filter summary) */
  totalEventCount?: number;
  /** Callback to clear the location filter */
  onClearLocationFilter?: () => void;
}

interface FilterSummaryProps {
  locationFilter: LocationFilter;
  filteredCount: number;
  totalCount: number;
  onClearFilter?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const FilterSummary = React.memo(function FilterSummary({ 
  locationFilter, 
  filteredCount, 
  totalCount, 
  onClearFilter 
}: FilterSummaryProps) {
  const getFilterDescription = React.useMemo(() => {
    if (locationFilter.areas && locationFilter.areas.length > 0) {
      if (locationFilter.areas.length === 1) {
        const area = locationFilter.areas[0];
        return area ? `Events in ${getAreaDisplayName(area)}` : "Events in selected area";
      } else if (locationFilter.areas.length <= 3) {
        const areaNames = locationFilter.areas.map(area => area ? getAreaDisplayName(area) : "Unknown area");
        return `Events in ${areaNames.slice(0, -1).join(", ")} and ${areaNames[areaNames.length - 1]}`;
      } else {
        return `Events in ${locationFilter.areas.length} areas`;
      }
    }
    
    if (locationFilter.center && locationFilter.radius) {
      return `Events within ${locationFilter.radius}km`;
    }
    
    return "Filtered events";
  }, [locationFilter]);

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between py-4 px-1 border-b border-neutral-200 bg-core-main"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-neutral-700">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-neutral-900 truncate">
            {getFilterDescription}
          </h2>
        </div>
        
        <Badge 
          variant="secondary" 
          className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
        >
          {filteredCount} of {totalCount} events
        </Badge>
      </div>
      
      {onClearFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilter}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 flex-shrink-0"
          aria-label="Clear location filter"
        >
          <X className="w-4 h-4" />
          Clear filter
        </Button>
      )}
    </motion.div>
  );
});

const MapEmptyState = React.memo(function MapEmptyState({ 
  locationFilter, 
  onClearFilter,
  className 
}: { 
  locationFilter?: LocationFilter; 
  onClearFilter?: () => void;
  className?: string;
}) {
  const message = React.useMemo(() => {
    if (locationFilter?.areas && locationFilter.areas.length > 0) {
      if (locationFilter.areas.length === 1) {
        const area = locationFilter.areas[0];
        return area ? `No events found in ${getAreaDisplayName(area)}.` : "No events found in the selected area.";
      }
      return "No events found in the selected areas.";
    }
    
    if (locationFilter?.center && locationFilter?.radius) {
      return `No events found within ${locationFilter.radius}km of the selected location.`;
    }
    
    return "No events match the current location filter.";
  }, [locationFilter]);

  return (
    <motion.div 
      className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-neutral-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No events in this location
      </h3>
      
      <p className="text-neutral-600 mb-6 max-w-md">
        {message}
      </p>
      
      <div className="space-y-2 text-sm text-neutral-500">
        <p>Try selecting a different area on the map or</p>
        {onClearFilter && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onClearFilter}
            className="mt-3"
          >
            <X className="w-4 h-4 mr-2" />
            Clear location filter
          </Button>
        )}
      </div>
    </motion.div>
  );
});

export const MapEventsList = React.memo(function MapEventsList({ 
  events, 
  locationFilter,
  className,
  isLoading = false,
  totalEventCount = 0,
  onClearLocationFilter
}: MapEventsListProps) {
  const { groupedEvents } = useEventGrouping({ events, isPastEvents: false });

  if (isLoading) {
    return (
      <div className={cn("bg-core-main", className)}>
        {locationFilter && (
          <FilterSummary
            locationFilter={locationFilter}
            filteredCount={0}
            totalCount={totalEventCount}
            onClearFilter={onClearLocationFilter}
          />
        )}
        <LoadingState className="px-6 py-4" count={3} />
      </div>
    );
  }

  const hasLocationFilter = Boolean(locationFilter);
  const showEmptyState = events.length === 0;

  return (
    <div className={cn("bg-core-main", className)}>
      {/* Filter Summary Header */}
      <AnimatePresence>
        {hasLocationFilter && locationFilter && (
          <FilterSummary
            locationFilter={locationFilter}
            filteredCount={events.length}
            totalCount={totalEventCount}
            onClearFilter={onClearLocationFilter}
          />
        )}
      </AnimatePresence>

      {/* Events List or Empty State */}
      <div className="px-6 py-4">
        <AnimatePresence mode="wait">
          {showEmptyState ? (
            <MapEmptyState
              key="empty-state"
              locationFilter={locationFilter}
              onClearFilter={onClearLocationFilter}
            />
          ) : (
            <motion.div 
              key="events-list"
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {groupedEvents.map(([dateKey, dayEvents]) => (
                <motion.div
                  key={dateKey}
                  variants={itemVariants}
                  layout
                  className="space-y-4"
                >
                  <DateGroupHeader 
                    date={dateKey} 
                    eventCount={dayEvents.length}
                  />
                  
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                  >
                    {dayEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        variants={itemVariants}
                        layout
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <EventCard 
                          event={event} 
                          className="border-neutral-200 hover:border-neutral-300"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

MapEventsList.displayName = "MapEventsList";