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

  /**
   * Search events using text search and embeddings similarity
   */
  static async searchWithEmbeddings(prompt: string): Promise<Event[]> {
    try {
      // Perform text search in parallel with embedding generation
      const textSearchPromise = db.event.findMany({
        where: {
          OR: [
            {
              title: {
                contains: prompt,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: prompt,
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

      // Generate embedding for the search prompt
      const openai = getOpenAIClient();
      const embeddingPromise = openai.embeddings.create({
        model: "text-embedding-3-large",
        input: prompt,
        dimensions: 1536,
      });

      // Wait for both operations to complete
      const [textSearchResults, embeddingResponse] = await Promise.all([
        textSearchPromise,
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
            e.*,
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

      // Combine and deduplicate results
      const combinedResults = new Map<string, EventWithOrganizers>();

      // Add text search results first (they are exact matches)
      textSearchResults.forEach((event) => {
        combinedResults.set(event.id, event);
      });

      // Add vector search results (similarity-based)
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
      const textSearchResults = await db.event.findMany({
        where: {
          OR: [
            {
              title: {
                contains: prompt,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: prompt,
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

      return textSearchResults.map(convertPrismaEventToEvent);
    }
  }
}
