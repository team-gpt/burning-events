"use client";

<<<<<<< Updated upstream
=======
import { useState, useMemo } from "react";
>>>>>>> Stashed changes
import { Calendar, Sparkles } from "lucide-react";
import { FilterControls } from "~/components/events/FilterControls";
import { EventMap } from "~/components/events/EventMap";
import { MapEventsList } from "~/components/events/MapEventsList";
import { useEventFilters } from "~/hooks/useEventFilters";
import { api } from "~/trpc/react";

export default function Home() {

  const {
    filters,
    setTimeFilter,
    setCategoryFilter,
    setLocationFilter,
    clearLocationFilter,
    toggleAreaSelection,
    toggleCoordinateSelection,
  } = useEventFilters({
    events: [], // We don't need to pass events anymore
    initialFilters: { type: "upcoming", category: "all" },
  });

  // Build query parameters from filters
  const queryParams = useMemo(() => ({
    upcoming: filters.type === "upcoming" ? true : filters.type === "past" ? false : undefined,
    category: filters.category === "all" ? undefined : filters.category,
    areas: filters.location?.areas,
    center: filters.location?.center,
    radius: filters.location?.radius,
    includeApproximate: filters.location?.includeApproximate ?? true,
  }), [filters]);

  // Fetch filtered events from the backend
  const { data: filteredEvents = [], isLoading } = api.events.getFiltered.useQuery(queryParams);

  // Fetch all events only for the map view (to show all markers)
  const { data: allEvents = [] } = api.events.getAll.useQuery(undefined, {
    // Only fetch when map view is active
    enabled: currentView === "map",
  });

  // Get unique categories from the filtered events
  const categories = useMemo(() => {
    const eventsToUse = currentView === "map" ? allEvents : filteredEvents;
    return Array.from(new Set(eventsToUse.map((event) => event.category)));
  }, [allEvents, filteredEvents, currentView]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">
                Burning Events
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="h-4 w-4" />
              <span>{filteredEvents.length} events found</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title & Description */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-neutral-900">
            Discover Amazing Events
          </h2>
          <p className="max-w-2xl text-lg text-neutral-600">
            Explore upcoming conferences, workshops, meetups, and networking
            events. Find your next great learning experience or professional
            opportunity.
          </p>
        </div>


        {/* Filters */}
        <div className="mb-8">
          <FilterControls
            selectedFilter={filters.type}
            selectedCategory={filters.category}
            onFilterChange={setTimeFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories}
          />
        </div>

        {/* Map and Events Content */}
        <div className="space-y-8">
          {/* Map */}
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <EventMap
              events={allEvents}
              onLocationFilter={setLocationFilter}
              selectedLocations={
                filters.location ? [filters.location] : undefined
              }
              onToggleArea={toggleAreaSelection}
              onToggleCoordinates={toggleCoordinateSelection}
              currentLocationFilter={filters.location}
              timeFilter={filters.type}
              categoryFilter={filters.category}
              className="h-64 md:h-80"
            />
          </div>

          {/* Events List Below Map */}
          <MapEventsList
            events={filteredEvents}
            locationFilter={filters.location}
            totalEventCount={allEvents.length}
            onClearLocationFilter={clearLocationFilter}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-neutral-500">
            <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
            <p className="mt-1">Discover your next amazing event experience</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
