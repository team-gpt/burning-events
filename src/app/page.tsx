"use client";
import { Calendar, Sparkles } from "lucide-react";
import { EventMap } from "~/components/events/EventMap";
import { MapEventsList } from "~/components/events/MapEventsList";
import { AISearchInput } from "~/components/events/AISearchInput";
import { useEventFilters } from "~/hooks/useEventFilters";
import { useAISearch } from "~/hooks/useAISearch";
import { api } from "~/trpc/react";
export default function Home() {
  // Fetch all events from the database
  const { data: allEvents = [], isLoading } = api.events.getAll.useQuery();
  // Get unique categories from the fetched events
  const categories = Array.from(
    new Set(allEvents.map((event) => event.category)),
  );
  const {
    filters,
    filteredEvents,
    setTimeFilter,
    setCategoryFilter,
    setDateFilter,
    setLocationFilter,
    clearLocationFilter,
    toggleAreaSelection,
    toggleCoordinateSelection,
  } = useEventFilters({
    events: allEvents,
    initialFilters: { type: "upcoming", category: "all" },
  });

  // AI Search hook
  const {
    isSearching,
    error: searchError,
    hasActiveSearch,
    searchResultEvents,
    performSearch,
    clearSearch,
  } = useAISearch({
    currentFilters: {
      type: filters.type,
      category: filters.category,
      location: filters.location,
    },
    onSearchComplete: (_result) => {
      // Auto-scroll to map after search completes
      const mapElement = document.getElementById("events-map");
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  });

  // Use AI search results if available, otherwise use filtered events
  const displayEvents = hasActiveSearch ? searchResultEvents : filteredEvents;

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <header className="border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="h-4 w-4" />
              <span>{displayEvents.length} events found</span>
              {hasActiveSearch && (
                <span className="text-blue-600">(AI search active)</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* AI Search Section */}
      <section className="border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-6">
            <AISearchInput
              onSearch={performSearch}
              isLoading={isSearching}
              error={searchError}
              className="w-full max-w-3xl"
              selectedDate={filters.dateFilter}
              onDateChange={setDateFilter}
            />

            {hasActiveSearch && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-neutral-600">
                  Showing AI search results
                </span>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* Map and Events Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Map */}
          <div
            id="events-map"
            className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
          >
            <EventMap
              events={displayEvents}
              onLocationFilter={setLocationFilter}
              selectedLocations={
                filters.location ? [filters.location] : undefined
              }
              onToggleArea={toggleAreaSelection}
              onToggleCoordinates={toggleCoordinateSelection}
              currentLocationFilter={filters.location}
              timeFilter={filters.type}
              categoryFilter={filters.category}
              className="h-[400px] lg:h-[600px]"
            />
          </div>
          {/* Events List */}
          <MapEventsList
            events={displayEvents}
            locationFilter={filters.location}
            totalEventCount={allEvents.length}
            onClearLocationFilter={clearLocationFilter}
            isLoading={isLoading}
          />
        </div>
      </div>
      {/* Footer */}
    </main>
  );
}
