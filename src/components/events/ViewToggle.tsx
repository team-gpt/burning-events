"use client";

import { List, Map } from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import { cn } from "~/lib/utils";

type ViewType = 'list' | 'map';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export function ViewToggle({
  currentView,
  onViewChange,
  className
}: ViewToggleProps) {
  return (
    <div className={cn(
      "flex flex-col gap-2",
      className
    )}>
      <label className="text-sm font-medium text-neutral-700 mb-0.5">
        View Mode
      </label>
      <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 h-10">
        <Toggle
          pressed={currentView === "list"}
          onPressedChange={() => onViewChange("list")}
          aria-label="Switch to list view"
          className={cn(
            "px-3 py-1.5 h-9 min-w-[70px] text-sm font-medium transition-all rounded-md",
            "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-blue-700 data-[state=on]:border-blue-200",
            "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900 data-[state=off]:hover:bg-white/50",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "flex items-center justify-center gap-1.5"
          )}
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </Toggle>
        <Toggle
          pressed={currentView === "map"}
          onPressedChange={() => onViewChange("map")}
          aria-label="Switch to map view"
          className={cn(
            "px-3 py-1.5 h-9 min-w-[70px] text-sm font-medium transition-all rounded-md",
            "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-blue-700 data-[state=on]:border-blue-200",
            "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900 data-[state=off]:hover:bg-white/50",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "flex items-center justify-center gap-1.5"
          )}
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Map</span>
        </Toggle>
      </div>
    </div>
  );
}

export type { ViewType };