import { 
  format, 
  isToday, 
  isTomorrow, 
  isPast, 
  parseISO, 
  startOfDay,
  compareAsc,
  compareDesc
} from "date-fns";
import type { Event, GroupedEvents, DateCategory } from "~/types/events";

/**
 * Get a friendly date label for display
 */
export function getFriendlyDateLabel(date: string): string {
  const parsedDate = parseISO(date);
  
  if (isToday(parsedDate)) {
    return "Today";
  }
  
  if (isTomorrow(parsedDate)) {
    return "Tomorrow";
  }
  
  // For this week, show day and date (e.g., "Monday, Oct 15")
  const now = new Date();
  const diffInDays = Math.abs(parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffInDays <= 7) {
    return format(parsedDate, "EEEE, MMM d");
  }
  
  // For other dates, show full date (e.g., "Oct 15, 2024")
  return format(parsedDate, "MMM d, yyyy");
}

/**
 * Categorize a date relative to today
 */
export function getDateCategory(date: string): DateCategory {
  const parsedDate = parseISO(date);
  
  if (isToday(parsedDate)) {
    return "today";
  }
  
  if (isTomorrow(parsedDate)) {
    return "tomorrow";
  }
  
  if (isPast(parsedDate)) {
    return "past";
  }
  
  return "future";
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: Event[]): GroupedEvents {
  const grouped: GroupedEvents = {};
  
  events.forEach((event) => {
    const dateKey = format(parseISO(event.date), "yyyy-MM-dd");
    
    grouped[dateKey] ??= [];
    
    grouped[dateKey].push(event);
  });
  
  // Sort events within each day by time
  Object.keys(grouped).forEach((dateKey) => {
    const dayEvents = grouped[dateKey];
    if (dayEvents) {
      grouped[dateKey] = sortEventsByTime(dayEvents);
    }
  });
  
  return grouped;
}

/**
 * Sort events by time within the same day
 */
export function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return compareAsc(dateA, dateB);
  });
}

/**
 * Sort grouped events by date (past events: most recent first, future events: earliest first)
 */
export function sortGroupedEventsByDate(
  groupedEvents: GroupedEvents, 
  isPastEvents = false
): [string, Event[]][] {
  const entries = Object.entries(groupedEvents);
  
  return entries.sort(([dateA], [dateB]) => {
    const parsedA = parseISO(dateA);
    const parsedB = parseISO(dateB);
    
    // For past events, show most recent first (descending)
    // For future events, show earliest first (ascending)
    return isPastEvents ? compareDesc(parsedA, parsedB) : compareAsc(parsedA, parsedB);
  });
}

/**
 * Filter events based on past/upcoming status
 */
export function filterEventsByTime(events: Event[], filterType: "past" | "upcoming"): Event[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  
  return events.filter((event) => {
    const eventDate = parseISO(event.date);
    
    if (filterType === "past") {
      return eventDate < todayStart;
    } else {
      return eventDate >= todayStart;
    }
  });
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatEventTime(date: string): string {
  return format(parseISO(date), "h:mm a");
}

/**
 * Check if an event is happening today
 */
export function isEventToday(date: string): boolean {
  return isToday(parseISO(date));
}

/**
 * Check if an event is happening tomorrow
 */
export function isEventTomorrow(date: string): boolean {
  return isTomorrow(parseISO(date));
}

/**
 * Get relative time until event (e.g., "in 2 hours", "tomorrow at 3pm")
 */
export function getRelativeEventTime(date: string): string {
  const eventDate = parseISO(date);
  
  if (isToday(eventDate)) {
    return `Today at ${formatEventTime(date)}`;
  }
  
  if (isTomorrow(eventDate)) {
    return `Tomorrow at ${formatEventTime(date)}`;
  }
  
  if (isPast(eventDate)) {
    return format(eventDate, "MMM d 'at' h:mm a");
  }
  
  return format(eventDate, "MMM d 'at' h:mm a");
}