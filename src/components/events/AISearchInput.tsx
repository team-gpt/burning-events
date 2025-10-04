"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ArrowUp,
  Loader2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarComponent } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import type { EventCategory, FilterType } from "~/types/events";

interface AISearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
  // Filter props
  selectedFilter: FilterType;
  selectedCategory: EventCategory | "all";
  selectedDate?: Date;
  onFilterChange: (filter: FilterType) => void;
  onCategoryChange: (category: EventCategory | "all") => void;
  onDateChange: (date: Date | undefined) => void;
  categories: EventCategory[];
}

export function AISearchInput({
  onSearch,
  isLoading = false,
  error = null,
  placeholder = "Ask me about events... (e.g., 'AI events for founders')",
  className,
  selectedFilter,
  selectedCategory,
  selectedDate,
  onFilterChange,
  onCategoryChange,
  onDateChange,
  categories,
}: AISearchInputProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-4xl", className)}>
      {/* Search Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "relative flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
            "focus-within:border-neutral-300 focus-within:shadow-md",
            error && "border-red-200 focus-within:border-red-300",
          )}
        >
          {/* Main Input Row */}
          <div className="flex items-center">
            {/* Search Icon */}
            <div className="flex items-center pl-8">
              <Search className="h-6 w-6 text-neutral-400" />
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              style={{ outline: "none", boxShadow: "none" }}
              className={cn(
                "flex-1 resize-none border-0 bg-transparent px-8 py-8 text-xl text-neutral-900 placeholder:text-neutral-500",
                "outline-none focus:border-0 focus:shadow-none focus:ring-0 focus:outline-none",
                "max-h-28 min-h-[6rem] overflow-y-auto",
                isLoading && "opacity-50",
              )}
            />

            {/* Submit Button */}
            <div className="flex items-center p-4">
              <Button
                type="submit"
                size="icon"
                disabled={!query.trim() || isLoading}
                className={cn(
                  "h-12 w-12 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
                  "disabled:bg-neutral-300 disabled:text-neutral-500 disabled:hover:bg-neutral-300",
                  "transition-all duration-200",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ArrowUp className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Filter Buttons Row */}
          <div className="flex items-center gap-3 border-t border-neutral-100 p-6 pt-4">
            {/* Past/Upcoming Toggle */}
            <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
              <Toggle
                pressed={selectedFilter === "upcoming"}
                onPressedChange={() => onFilterChange("upcoming")}
                className={cn(
                  "h-7 rounded-md px-3 py-1 text-xs font-medium transition-all",
                  "data-[state=on]:bg-white data-[state=on]:text-blue-700 data-[state=on]:shadow-sm",
                  "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900",
                )}
              >
                Upcoming
              </Toggle>
              <Toggle
                pressed={selectedFilter === "past"}
                onPressedChange={() => onFilterChange("past")}
                className={cn(
                  "h-7 rounded-md px-3 py-1 text-xs font-medium transition-all",
                  "data-[state=on]:bg-white data-[state=on]:text-blue-700 data-[state=on]:shadow-sm",
                  "data-[state=off]:text-neutral-600 data-[state=off]:hover:text-neutral-900",
                )}
              >
                Past
              </Toggle>
            </div>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-7 border-neutral-200 px-3 text-xs text-neutral-600 hover:text-neutral-900",
                    selectedDate && "border-blue-200 text-blue-700",
                  )}
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  {selectedDate ? format(selectedDate, "MMM d") : "Date"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  initialFocus
                />
                {selectedDate && (
                  <div className="border-t border-neutral-200 p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDateChange(undefined)}
                      className="h-8 w-full text-xs"
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
