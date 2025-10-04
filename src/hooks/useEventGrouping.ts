"use client";

import { useMemo } from "react";
import { groupEventsByDate, sortGroupedEventsByDate } from "~/lib/date-utils";
import type { Event } from "~/types/events";

interface UseEventGroupingProps {
  events: Event[];
  isPastEvents?: boolean;
}

export function useEventGrouping({
  events,
  isPastEvents = false,
}: UseEventGroupingProps) {
  const groupedEvents = useMemo(() => {
    const grouped = groupEventsByDate(events);
    return sortGroupedEventsByDate(grouped, isPastEvents);
  }, [events, isPastEvents]);

  const totalEventCount = useMemo(() => {
    return events.length;
  }, [events]);

  const groupCount = useMemo(() => {
    return groupedEvents.length;
  }, [groupedEvents]);

  return {
    groupedEvents: events,
    totalEventCount,
    groupCount,
  };
}
