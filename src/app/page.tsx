"use client";
import { Calendar, Sparkles } from "lucide-react";
import { EventMap } from "~/components/events/EventMap";
import { MapEventsList } from "~/components/events/MapEventsList";
import { AISearchInput } from "~/components/events/AISearchInput";
import { useEventFilters } from "~/hooks/useEventFilters";
import { useAISearch } from "~/hooks/useAISearch";
import { api } from "~/trpc/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import logo from "../../public/logo.png";

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
            <div className="mt-3 flex flex-row items-center gap-2 sm:mt-6 sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg sm:-ml-24 sm:h-16 sm:w-16">
                <Image src={logo} alt="Logo" width={256} height={256} />
              </div>
              <h1 className="text-base font-bold sm:text-xl">Burning Events</h1>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-600 sm:gap-2 sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {displayEvents.length} events found
              </span>
              <span className="sm:hidden">{displayEvents.length} events</span>
              {hasActiveSearch && (
                <span className="hidden text-blue-600 sm:inline">
                  (AI search active)
                </span>
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
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MapEventsList
                  events={[]}
                  locationFilter={filters.location}
                  totalEventCount={allEvents.length}
                  onClearLocationFilter={clearLocationFilter}
                  isLoading={false}
                  isAISearching={true}
                  isAISearchResults={false}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <MapEventsList
                  events={displayEvents}
                  locationFilter={filters.location}
                  totalEventCount={allEvents.length}
                  onClearLocationFilter={clearLocationFilter}
                  isLoading={isLoading}
                  isAISearching={false}
                  isAISearchResults={hasActiveSearch}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Footer */}
    </main>
  );
}
