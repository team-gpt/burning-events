export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string; // ISO string format
  location?: string;
  category: EventCategory;
  image?: string; // URL to event image
  description?: string;
  attendeeCount?: number;
  price?: {
    amount: number;
    currency: string;
  };
  tags?: string[];
}

export type EventCategory = 
  | "Conference" 
  | "Workshop" 
  | "Social" 
  | "Networking" 
  | "Meetup" 
  | "Webinar";

export type FilterType = "upcoming" | "past";

export interface EventFilters {
  type: FilterType;
  category: EventCategory | "all";
}

export type GroupedEvents = Record<string, Event[]>;

export type DateCategory = "today" | "tomorrow" | "past" | "future";