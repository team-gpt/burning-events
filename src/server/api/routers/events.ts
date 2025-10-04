import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventsService } from "~/services/events";

export const eventsRouter = createTRPCRouter({
  /**
   * Get all events
   */
  getAll: publicProcedure.query(async () => {
    return EventsService.getAllEvents();
  }),

  /**
   * Get filtered events
   */
  getFiltered: publicProcedure
    .input(
      z.object({
        upcoming: z.boolean().optional(),
        category: z.string().optional(),
        area: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      return EventsService.getFilteredEvents({
        upcoming: input.upcoming,
        category: input.category as any,
        area: input.area,
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
      })
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
      })
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
      })
    )
    .query(async ({ input }) => {
      return EventsService.getEventCount({
        upcoming: input.upcoming,
        area: input.area,
      });
    }),
});