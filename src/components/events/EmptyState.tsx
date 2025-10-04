import { Calendar, Search } from "lucide-react";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  type: "no-events" | "no-results";
  message?: string;
  className?: string;
}

const emptyStateConfig = {
  "no-events": {
    icon: Calendar,
    title: "No events found",
    defaultMessage: "There are no events scheduled for this time period.",
    actionText: "Check back later for new events!"
  },
  "no-results": {
    icon: Search,
    title: "No matching events",
    defaultMessage: "No events match your current filters.",
    actionText: "Try adjusting your filters or check back later."
  }
};

export function EmptyState({ type, message, className }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {config.title}
      </h3>
      
      <p className="text-neutral-600 mb-4 max-w-md">
        {message ?? config.defaultMessage}
      </p>
      
      <p className="text-sm text-neutral-500">
        {config.actionText}
      </p>
    </div>
  );
}