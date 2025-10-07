import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventsService } from "~/services/events";
import { extractSearchKeywords, combineKeywords } from "~/services/aiSearch";

export const eventsRouter = createTRPCRouter({
  /**
   * Get all events
   */
  getAll: publicProcedure.query(async () => {
    return EventsService.getAllEvents();
  }),

  /**
   * Get filtered events with comprehensive filtering
   */
  getFiltered: publicProcedure
    .input(
      z.object({
        upcoming: z.boolean().optional(),
        category: z.string().optional(),
        areas: z.array(z.string()).optional(), // Multiple areas support
        center: z
          .object({
            lat: z.number(),
            lng: z.number(),
          })
          .optional(), // Center point for radius filtering
        radius: z.number().positive().optional(), // Radius in kilometers
        includeApproximate: z.boolean().optional().default(true), // Include approximate locations
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }),
    )
    .query(async ({ input }) => {
      return EventsService.getFilteredEvents({
        upcoming: input.upcoming,
        category: input.category as any,
        areas: input.areas,
        center: input.center,
        radius: input.radius,
        includeApproximate: input.includeApproximate,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /**
   * Get upcoming events
   */
  getUpcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      return EventsService.getUpcomingEvents(input.limit);
    }),

  /**
   * Get past events
   */
  getPast: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      return EventsService.getPastEvents(input.limit);
    }),

  /**
   * Get event by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return EventsService.getEventById(input.id);
    }),

  /**
   * Get events by area
   */
  getByArea: publicProcedure
    .input(z.object({ area: z.string() }))
    .query(async ({ input }) => {
      return EventsService.getEventsByArea(input.area);
    }),

  /**
   * Search events
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return EventsService.searchEvents(input.query);
    }),

  /**
   * Get unique areas
   */
  getAreas: publicProcedure.query(async () => {
    return EventsService.getAreas();
  }),

  /**
   * Get event count
   */
  getCount: publicProcedure
    .input(
      z.object({
        upcoming: z.boolean().optional(),
        area: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return EventsService.getEventCount({
        upcoming: input.upcoming,
        area: input.area,
      });
    }),

  /**
   * Search events with embeddings (combined text and vector search)
   */
  searchWithEmbeddings: publicProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .query(async ({ input }) => {
      return EventsService.searchWithEmbeddings(input.prompt);
    }),

  /**
   * Search events using AI-generated keywords with embeddings
   */
  searchWithAI: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        currentFilters: z
          .object({
            type: z.enum(["upcoming", "past", "all"]).optional(),
            category: z.string().optional(),
            area: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log(
          "AI Search at",
          new Date().toISOString(),
          "with query",
          input.prompt,
        );
        // Extract keywords using AI
        const aiKeywords = await extractSearchKeywords(input.prompt);

        // Combine keywords into a single search string
        const searchQuery = combineKeywords(aiKeywords.keywords);

        // Search events using the combined keywords
        let events = await EventsService.searchWithEmbeddings(searchQuery);

        // Apply additional filters based on AI suggestions and current filters
        const now = new Date();

        // Determine time filter
        const timeFilter = input.currentFilters?.type;

        // Apply time filtering
        if (timeFilter === "upcoming") {
          events = events.filter((event) => new Date(event.date) >= now);
        } else if (timeFilter === "past") {
          events = events.filter((event) => new Date(event.date) < now);
        }

        // Apply area filtering
        const areaFilter = input.currentFilters?.area;
        if (areaFilter && areaFilter !== "all") {
          events = events.filter((event) => event.area === areaFilter);
        }

        // Apply category filtering
        const categoryFilter = input.currentFilters?.category;
        if (categoryFilter && categoryFilter !== "all") {
          events = events.filter((event) => event.category === categoryFilter);
        }

        return {
          events,
          aiKeywords: aiKeywords.keywords,
          searchQuery,
        };
      } catch (error) {
        console.error("Error in AI search:", error);

        // Fallback to regular embedding search
        const events = await EventsService.searchWithEmbeddings(input.prompt);

        return {
          events,
          aiKeywords: [input.prompt],
          searchQuery: input.prompt,
        };
      }
    }),
});
