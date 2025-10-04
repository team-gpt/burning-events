import type { Event as PrismaEvent, Organizer } from "@prisma/client";
import type {
  Event,
  EventCategory,
  EventFilters,
  SanFranciscoArea,
} from "../types/events";
import { getAreaCoordinatesFlexible } from "../lib/area-coordinates";
import { db } from "../server/db";

// Type for Event with organizers included
type EventWithOrganizers = PrismaEvent & {
  organizers: Organizer[];
};

/**
 * Converts a Prisma Event (with organizers) to our Event type
 */
function convertPrismaEventToEvent(prismaEvent: EventWithOrganizers): Event {
  // Try to get coordinates from area if available
  let coordinates: { lat: number; lng: number } | undefined = undefined;
  let locationType: "exact" | "approximate" = "approximate";

  if (prismaEvent.area) {
    const areaCoords = getAreaCoordinatesFlexible(prismaEvent.area);
    if (areaCoords) {
      coordinates = areaCoords;
      locationType = "approximate";
    } else {
      console.warn(`Unknown area: ${prismaEvent.area}`);
    }
  }

  return {
    id: prismaEvent.id,
    title: prismaEvent.title,
    subtitle:
      prismaEvent.description && prismaEvent.description.length > 100
        ? prismaEvent.description.substring(0, 100) + "..."
        : prismaEvent.description || "",
    date: prismaEvent.startDate.toISOString(),
    location: prismaEvent.address || undefined,
    venue_name: prismaEvent.venueName || undefined,
    address: prismaEvent.address || undefined,
    area: prismaEvent.area as SanFranciscoArea | undefined,
    coordinates,
    locationType,
    category: "Meetup" as EventCategory,
    image: prismaEvent.image || undefined,
    description: prismaEvent.description || undefined,
  };
}

export class EventsService {
  /**
   * Get all events from the database
   */
  static async getAllEvents(): Promise<Event[]> {
    const prismaEvents = await db.event.findMany({
      include: {
        organizers: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    console.log("Raw prisma events count:", prismaEvents.length);
    console.log(
      "First event sample:",
      prismaEvents.length > 0
        ? {
            id: prismaEvents[0]!.id,
            title: prismaEvents[0]!.title,
            area: prismaEvents[0]!.area,
            address: prismaEvents[0]!.address,
          }
        : "No events found",
    );

    const convertedEvents = prismaEvents.map(convertPrismaEventToEvent);

    console.log("Converted events count:", convertedEvents.length);
    console.log(
      "First converted event coordinates:",
      convertedEvents.length > 0
        ? {
            id: convertedEvents[0]!.id,
            area: convertedEvents[0]!.area,
            coordinates: convertedEvents[0]!.coordinates,
            locationType: convertedEvents[0]!.locationType,
          }
        : "No converted events",
    );

    return convertedEvents;
  }

  /**
   * Get events with filtering
   */
  static async getFilteredEvents(filters?: {
    upcoming?: boolean;
    category?: EventCategory | "all";
    area?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const now = new Date();

    const whereClause: {
      startDate?: { gte: Date } | { lt: Date };
      area?: string;
    } = {};

    // Filter by upcoming/past
    if (filters?.upcoming !== undefined) {
      if (filters.upcoming) {
        whereClause.startDate = { gte: now };
      } else {
        whereClause.startDate = { lt: now };
      }
    }

    // Filter by area
    if (filters?.area && filters.area !== "all") {
      whereClause.area = filters.area;
    }

    const prismaEvents = await db.event.findMany({
      where: whereClause,
      include: {
        organizers: true,
      },
      orderBy: {
        startDate: filters?.upcoming !== false ? "asc" : "desc",
      },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return prismaEvents.map(convertPrismaEventToEvent);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(limit?: number): Promise<Event[]> {
    return this.getFilteredEvents({
      upcoming: true,
      limit,
    });
  }

  /**
   * Get past events
   */
  static async getPastEvents(limit?: number): Promise<Event[]> {
    return this.getFilteredEvents({
      upcoming: false,
      limit,
    });
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<Event | null> {
    const prismaEvent = await db.event.findUnique({
      where: { id },
      include: {
        organizers: true,
      },
    });

    if (!prismaEvent) {
      return null;
    }

    return convertPrismaEventToEvent(prismaEvent);
  }

  /**
   * Get events by area
   */
  static async getEventsByArea(area: string): Promise<Event[]> {
    return this.getFilteredEvents({ area });
  }

  /**
   * Search events by title or description
   */
  static async searchEvents(query: string): Promise<Event[]> {
    const prismaEvents = await db.event.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            venueName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        organizers: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return prismaEvents.map(convertPrismaEventToEvent);
  }

  /**
   * Get unique areas from events
   */
  static async getAreas(): Promise<string[]> {
    const areas = await db.event.findMany({
      select: {
        area: true,
      },
      distinct: ["area"],
      where: {
        area: {
          not: null,
        },
      },
    });

    const uniqueAreas = areas
      .map((event) => event.area)
      .filter((area): area is string => area !== null);

    console.log("Unique areas in database:", uniqueAreas);

    return uniqueAreas;
  }

  /**
   * Get event count
   */
  static async getEventCount(filters?: {
    upcoming?: boolean;
    area?: string;
  }): Promise<number> {
    const now = new Date();

    const whereClause: {
      startDate?: { gte: Date } | { lt: Date };
      area?: string;
    } = {};

    if (filters?.upcoming !== undefined) {
      if (filters.upcoming) {
        whereClause.startDate = { gte: now };
      } else {
        whereClause.startDate = { lt: now };
      }
    }

    if (filters?.area && filters.area !== "all") {
      whereClause.area = filters.area;
    }

    return db.event.count({
      where: whereClause,
    });
  }
}
