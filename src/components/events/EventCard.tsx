import { MapPin, Users, Tag, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { getRelativeEventTime } from "~/lib/date-utils";
import type { Event } from "~/types/events";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact";
  className?: string;
}

const categoryColors: Record<string, string> = {
  Conference: "bg-blue-100 text-blue-800 border-blue-200",
  Workshop: "bg-green-100 text-green-800 border-green-200",
  Social: "bg-purple-100 text-purple-800 border-purple-200",
  Networking: "bg-orange-100 text-orange-800 border-orange-200",
  Meetup: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Webinar: "bg-red-100 text-red-800 border-red-200",
};

export function EventCard({
  event,
  variant = "default",
  className,
}: EventCardProps) {
  const isCompact = variant === "compact";

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
          "border border-neutral-200 hover:border-neutral-300",
          className,
        )}
      >
        <CardHeader className={cn("pb-3", isCompact ? "p-4" : "p-6")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-xs font-medium",
                    categoryColors[event.category] ??
                      "bg-neutral-100 text-neutral-800",
                  )}
                >
                  {event.category}
                </Badge>
                {event.price && (
                  <Badge className="text-xs">${event.price.amount}</Badge>
                )}
              </div>

              <h3
                className={cn(
                  "line-clamp-1 font-semibold text-neutral-900 transition-colors group-hover:text-blue-700",
                  isCompact ? "text-base" : "text-lg",
                )}
              >
                {event.title}
              </h3>

              <p
                className={cn(
                  "mt-1 line-clamp-2 text-neutral-600",
                  isCompact ? "text-sm" : "text-base",
                )}
              >
                {event.subtitle}
              </p>
            </div>

            {event.image && !isCompact && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent
          className={cn("pt-0", isCompact ? "px-4 pb-4" : "px-6 pb-6")}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="h-4 w-4" />
              <span>{getRelativeEventTime(event.date)}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            {event.attendeeCount && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Users className="h-4 w-4" />
                <span>{event.attendeeCount} attendees</span>
              </div>
            )}

            {event.tags && event.tags.length > 0 && !isCompact && (
              <div className="mt-3 flex flex-wrap items-center gap-1">
                <Tag className="h-3 w-3 text-neutral-400" />
                {event.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                  >
                    {tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span className="text-xs text-neutral-400">
                    +{event.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
