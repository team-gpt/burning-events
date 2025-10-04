import { getFriendlyDateLabel } from "~/lib/date-utils";
import { cn } from "~/lib/utils";

interface DateGroupHeaderProps {
  date: string; // ISO string
  eventCount: number;
  className?: string;
}

export function DateGroupHeader({ date, eventCount, className }: DateGroupHeaderProps) {
  const friendlyDate = getFriendlyDateLabel(date);
  
  return (
    <div className={cn(
      "flex items-center justify-between py-4 border-b border-neutral-200",
      className
    )}>
      <h2 className="text-xl font-semibold text-neutral-900">
        {friendlyDate}
      </h2>
      <span className="text-sm text-neutral-500 font-medium">
        {eventCount} {eventCount === 1 ? "event" : "events"}
      </span>
    </div>
  );
}