"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DateGroupHeader } from "./DateGroupHeader";
import { EventCard } from "./EventCard";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { useEventGrouping } from "~/hooks/useEventGrouping";
import { cn } from "~/lib/utils";
import type { Event } from "~/types/events";

interface EventsTimelineProps {
  events: Event[];
  isLoading?: boolean;
  isPastEvents?: boolean;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function EventsTimeline({ 
  events, 
  isLoading = false, 
  isPastEvents = false,
  className 
}: EventsTimelineProps) {
  const { groupedEvents } = useEventGrouping({ events, isPastEvents });

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState 
        type="no-results"
        className={className}
      />
    );
  }

  return (
    <motion.div 
      className={cn("space-y-8", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {groupedEvents.map(([dateKey, dayEvents]) => (
          <motion.div
            key={dateKey}
            variants={itemVariants}
            layout
            className="space-y-4"
          >
            <DateGroupHeader 
              date={dateKey} 
              eventCount={dayEvents.length}
            />
            
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              {dayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}