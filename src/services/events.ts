import type { Event as PrismaEvent, Organizer } from "@prisma/client";
import type {
  Event,
  EventCategory,
  EventFilters,
  SanFranciscoArea,
} from "../types/events";
import { getAreaCoordinatesFlexible } from "../lib/area-coordinates";
import { db } from "../server/db";
import { OpenAI } from "openai";
import pgvector from "pgvector";

// Type for Event with organizers included
type EventWithOrganizers = PrismaEvent & {
  organizers: Organizer[];
};

// Initialize OpenAI client (lazy initialization)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

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
    url: prismaEvent.url,
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
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number },
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get events with comprehensive filtering
   */
  static async getFilteredEvents(filters?: {
    upcoming?: boolean;
    category?: EventCategory | "all";
    areas?: string[]; // Changed from single area to multiple areas
    center?: { lat: number; lng: number }; // For radius-based filtering
    radius?: number; // Radius in kilometers
    includeApproximate?: boolean; // Whether to include events with approximate locations
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const now = new Date();

    const whereClause: any = {};

    // Filter by upcoming/past
    if (filters?.upcoming !== undefined) {
      if (filters.upcoming) {
        whereClause.startDate = { gte: now };
      } else {
        whereClause.startDate = { lt: now };
      }
    }

    // Filter by areas (multiple areas support)
    if (filters?.areas && filters.areas.length > 0) {
      whereClause.area = {
        in: filters.areas,
      };
    }

    // Fetch events based on basic filters
    const prismaEvents = await db.event.findMany({
      where: whereClause,
      include: {
        organizers: true,
      },
      orderBy: {
        startDate: filters?.upcoming !== false ? "asc" : "desc",
      },
      // Don't apply limit/offset yet if we need to do radius filtering
      take: filters?.center && filters?.radius ? undefined : filters?.limit,
      skip: filters?.center && filters?.radius ? undefined : filters?.offset,
    });

    // Convert to Event type to get coordinates
    let events = prismaEvents.map(convertPrismaEventToEvent);

    // Apply radius-based filtering if needed
    if (filters?.center && filters?.radius) {
      events = events.filter((event) => {
        // Skip events without coordinates
        if (!event.coordinates) {
          return false;
        }

        // Skip approximate locations if not included
        if (
          event.locationType === "approximate" &&
          !filters.includeApproximate
        ) {
          return false;
        }

        // Calculate distance and check if within radius
        const distance = this.calculateDistance(
          filters.center!,
          event.coordinates,
        );
        return distance <= filters.radius!;
      });
    }

    // Apply category filter (if not done in DB query)
    if (filters?.category && filters.category !== "all") {
      events = events.filter((event) => event.category === filters.category);
    }

    // Apply pagination after all filtering
    if (filters?.center && filters?.radius) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      events = events.slice(start, end);
    }

    return events;
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
    return this.getFilteredEvents({ areas: [area] });
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

  /**
   * Search events using text search and embeddings similarity
   */
  static async searchWithEmbeddings(prompt: string): Promise<Event[]> {
    try {
      // Perform title and description searches separately in parallel with embedding generation
      const titleSearchPromise = db.event.findMany({
        where: {
          title: {
            contains: prompt,
            mode: "insensitive",
          },
        },
        include: {
          organizers: true,
        },
        orderBy: {
          startDate: "asc",
        },
      });

      const descriptionSearchPromise = db.event.findMany({
        where: {
          description: {
            contains: prompt,
            mode: "insensitive",
          },
        },
        include: {
          organizers: true,
        },
        orderBy: {
          startDate: "asc",
        },
      });

      // Generate embedding for the search prompt
      const openai = getOpenAIClient();
      const embeddingPromise = openai.embeddings.create({
        model: "text-embedding-3-large",
        input: prompt,
        dimensions: 1536,
      });

      // Wait for all operations to complete
      const [titleSearchResults, descriptionSearchResults, embeddingResponse] =
        await Promise.all([
          titleSearchPromise,
          descriptionSearchPromise,
          embeddingPromise,
        ]);

      // Perform vector similarity search if embedding was generated successfully
      let vectorSearchResults: EventWithOrganizers[] = [];

      if (embeddingResponse.data[0]?.embedding) {
        const queryEmbedding = embeddingResponse.data[0].embedding;
        const vectorString = pgvector.toSql(queryEmbedding);

        // Search for similar events using cosine similarity
        const similarEvents = await db.$queryRaw<EventWithOrganizers[]>`
          SELECT 
            e.id,
            e.title,
            e.description,
            e.start_date as "startDate",
            e.end_date as "endDate",
            e.image,
            e.venue_name as "venueName",
            e.address,
            e.area,
            e.url,
            e."createdAt",
            e."updatedAt",
            1 - (e.embeddings <=> ${vectorString}::vector) as similarity
          FROM "Event" e
          WHERE e.embeddings IS NOT NULL
          ORDER BY e.embeddings <=> ${vectorString}::vector
          LIMIT 20
        `;

        // We need to fetch organizers for vector search results
        const eventIds = similarEvents.map((e) => e.id);
        const eventsWithOrganizers = await db.event.findMany({
          where: {
            id: {
              in: eventIds,
            },
          },
          include: {
            organizers: true,
          },
        });

        // Create a map for quick lookup
        const organizersMap = new Map<string, Organizer[]>();
        eventsWithOrganizers.forEach((event) => {
          organizersMap.set(event.id, event.organizers);
        });

        // Attach organizers to vector search results
        vectorSearchResults = similarEvents.map((event) => ({
          ...event,
          organizers: organizersMap.get(event.id) || [],
        }));
      }

      // Combine and deduplicate results in priority order
      const combinedResults = new Map<string, EventWithOrganizers>();

      // 1. Add title matches first (highest priority)
      titleSearchResults.forEach((event) => {
        combinedResults.set(event.id, event);
      });

      // 2. Add description matches second (medium priority)
      descriptionSearchResults.forEach((event) => {
        if (!combinedResults.has(event.id)) {
          combinedResults.set(event.id, event);
        }
      });

      // 3. Add vector search results third (similarity-based, lowest priority)
      vectorSearchResults.forEach((event) => {
        if (!combinedResults.has(event.id)) {
          combinedResults.set(event.id, event);
        }
      });

      // Convert to array and return
      const events = Array.from(combinedResults.values());
      return events.map(convertPrismaEventToEvent);
    } catch (error) {
      console.error("Error in searchWithEmbeddings:", error);

      // Fallback to text-only search if embeddings search fails
      const [titleResults, descriptionResults] = await Promise.all([
        db.event.findMany({
          where: {
            title: {
              contains: prompt,
              mode: "insensitive",
            },
          },
          include: {
            organizers: true,
          },
          orderBy: {
            startDate: "asc",
          },
        }),
        db.event.findMany({
          where: {
            description: {
              contains: prompt,
              mode: "insensitive",
            },
          },
          include: {
            organizers: true,
          },
          orderBy: {
            startDate: "asc",
          },
        }),
      ]);

      // Combine results with proper priority
      const fallbackResults = new Map<string, EventWithOrganizers>();

      // Title matches first
      titleResults.forEach((event) => {
        fallbackResults.set(event.id, event);
      });

      // Description matches second
      descriptionResults.forEach((event) => {
        if (!fallbackResults.has(event.id)) {
          fallbackResults.set(event.id, event);
        }
      });

      return Array.from(fallbackResults.values()).map(
        convertPrismaEventToEvent,
      );
    }
  }
}
