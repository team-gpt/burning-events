"use client";

import { useState, useMemo } from "react";
import { filterEventsByTime } from "~/lib/date-utils";
import type { Event, EventCategory, FilterType, EventFilters } from "~/types/events";

interface UseEventFiltersProps {
  events: Event[];
  initialFilters?: Partial<EventFilters>;
}

export function useEventFilters({ events, initialFilters }: UseEventFiltersProps) {
  const [filters, setFilters] = useState<EventFilters>({
    type: initialFilters?.type ?? "upcoming",
    category: initialFilters?.category ?? "all",
  });

  const filteredEvents = useMemo(() => {
    // First filter by time (past/upcoming)
    let filtered = filterEventsByTime(events, filters.type);
    
    // Then filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter(event => event.category === filters.category);
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

  const resetFilters = () => {
    setFilters({
      type: "upcoming",
      category: "all",
    });
  };

  return {
    filters,
    filteredEvents,
    updateFilter,
    setTimeFilter,
    setCategoryFilter,
    resetFilters,
  };
}