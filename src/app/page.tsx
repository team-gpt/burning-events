"use client";

import { useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { EventsTimeline } from "~/components/events/EventsTimeline";
import { FilterControls } from "~/components/events/FilterControls";
import { useEventFilters } from "~/hooks/useEventFilters";
import { dummyEvents, getAllCategories } from "~/data/events";

export default function Home() {
  const [isLoading] = useState(false);
  const categories = getAllCategories();
  
  const {
    filters,
    filteredEvents,
    setTimeFilter,
    setCategoryFilter,
  } = useEventFilters({
    events: dummyEvents,
    initialFilters: { type: "upcoming", category: "all" }
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">
                Burning Events
              </h1>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span>{filteredEvents.length} events found</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Description */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Discover Amazing Events
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Explore upcoming conferences, workshops, meetups, and networking events. 
            Find your next great learning experience or professional opportunity.
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

        {/* Events Timeline */}
        <EventsTimeline
          events={filteredEvents}
          isLoading={isLoading}
          isPastEvents={filters.type === "past"}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-neutral-500">
            <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
            <p className="mt-1">Discover your next amazing event experience</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
