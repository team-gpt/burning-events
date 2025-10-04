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

export function EventCard({ event, variant = "default", className }: EventCardProps) {
  const isCompact = variant === "compact";
  
  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
      "border border-neutral-200 hover:border-neutral-300",
      className
    )}>
      <CardHeader className={cn(
        "pb-3",
        isCompact ? "p-4" : "p-6"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={cn(
                  "text-xs font-medium",
                  categoryColors[event.category] ?? "bg-neutral-100 text-neutral-800"
                )}
              >
                {event.category}
              </Badge>
              {event.price && (
                <Badge className="text-xs">
                  ${event.price.amount}
                </Badge>
              )}
            </div>
            
            <h3 className={cn(
              "font-semibold text-neutral-900 line-clamp-1 group-hover:text-blue-700 transition-colors",
              isCompact ? "text-base" : "text-lg"
            )}>
              {event.title}
            </h3>
            
            <p className={cn(
              "text-neutral-600 line-clamp-2 mt-1",
              isCompact ? "text-sm" : "text-base"
            )}>
              {event.subtitle}
            </p>
          </div>
          
          {event.image && !isCompact && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "pt-0",
        isCompact ? "px-4 pb-4" : "px-6 pb-6"
      )}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{getRelativeEventTime(event.date)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          {event.attendeeCount && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Users className="w-4 h-4" />
              <span>{event.attendeeCount} attendees</span>
            </div>
          )}
          
          {event.tags && event.tags.length > 0 && !isCompact && (
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              <Tag className="w-3 h-3 text-neutral-400" />
              {event.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full"
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
  );
}