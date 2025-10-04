"use client";

import { Toggle } from "~/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { EventCategory, FilterType } from "~/types/events";

interface FilterControlsProps {
  selectedFilter: FilterType;
  selectedCategory: EventCategory | "all";
  onFilterChange: (filter: FilterType) => void;
  onCategoryChange: (category: EventCategory | "all") => void;
  categories: EventCategory[];
  className?: string;
}

export function FilterControls({
  selectedFilter,
  selectedCategory,
  onFilterChange,
  onCategoryChange,
  categories,
  className
}: FilterControlsProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-start gap-6 p-6 bg-white rounded-lg border border-neutral-200 shadow-sm",
      className
    )}>
      {/* Time Filter Toggle */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-700 mb-0.5">
          Time Period
        </label>
        <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 h-10">
          <Toggle
            pressed={selectedFilter === "upcoming"}
            onPressedChange={() => onFilterChange("upcoming")}
            aria-label="Show upcoming events"
            className={cn(
              "px-4 py-1.5 h-10 min-w-[80px] text-sm font-medium transition-all rounded-md",
              "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-blue-700 data-[state=on]:border-blue-200",
              "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900 data-[state=off]:hover:bg-white/50",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            Upcoming
          </Toggle>
          <Toggle
            pressed={selectedFilter === "past"}
            onPressedChange={() => onFilterChange("past")}
            aria-label="Show past events"
            className={cn(
              "px-4 py-1.5 h-10 min-w-[80px] text-sm font-medium transition-all rounded-md",
              "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-blue-700 data-[state=on]:border-blue-200",
              "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900 data-[state=off]:hover:bg-white/50",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            Past
          </Toggle>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2 min-w-0 sm:min-w-[200px]">
        <label className="text-sm font-medium text-neutral-700 mb-0.5">
          Category
        </label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full h-10 bg-white border-neutral-200 shadow-sm hover:border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-neutral-200 shadow-lg rounded-lg p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value="all" className="hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
              All Categories
            </SelectItem>
            {categories.map((category) => (
              <SelectItem 
                key={category} 
                value={category}
                className="hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Results Count */}
      <div className="flex items-start sm:ml-auto sm:mt-7">
        <div className="text-xs text-neutral-500 px-3 py-2.5 h-10 bg-neutral-50 rounded-md border border-neutral-200 whitespace-nowrap flex items-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <div>
            Showing {selectedFilter} events
            {selectedCategory !== "all" && (
              <span className="block text-neutral-400">in {selectedCategory}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}