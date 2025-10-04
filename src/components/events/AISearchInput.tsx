"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowUp, Loader2, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { DatePicker } from "~/components/ui/date-picker";
import { cn } from "~/lib/utils";
import type { EventCategory, FilterType } from "~/types/events";

interface AISearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
  // Filter props
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
}

export function AISearchInput({
  onSearch,
  isLoading = false,
  error = null,
  placeholder = "Ask me about events... (e.g., 'AI events for founders')",
  className,
  selectedDate,
  onDateChange,
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
                "flex-1 resize-none border-0 bg-transparent px-8 py-8 text-xl text-neutral-900 placeholder:text-base placeholder:text-neutral-500",
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
          <div className="flex items-center gap-3 border-t border-neutral-100 p-6 pt-4">
            {/* Food Toggle with Coming Soon Badge */}
            <div className="relative">
              <Toggle
                pressed={false}
                disabled={true}
                className={cn(
                  "h-7 rounded-md px-3 py-1 text-xs font-medium transition-all",
                  "opacity-50 pointer-events-none cursor-not-allowed",
                  "border border-neutral-200 bg-neutral-100 text-neutral-500"
                )}
              >
                Food
              </Toggle>
              <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                Soon
              </div>
            </div>

            {/* Is Paid Toggle (Disabled) */}
            <Toggle
              pressed={false}
              disabled={true}
              className={cn(
                "h-7 rounded-md px-3 py-1 text-xs font-medium transition-all",
                "opacity-50 pointer-events-none cursor-not-allowed",
                "border border-neutral-200 bg-neutral-100 text-neutral-500"
              )}
            >
              Is Paid
            </Toggle>

            {/* Keynotes Toggle (Disabled) */}
            <Toggle
              pressed={false}
              disabled={true}
              className={cn(
                "h-7 rounded-md px-3 py-1 text-xs font-medium transition-all",
                "opacity-50 pointer-events-none cursor-not-allowed",
                "border border-neutral-200 bg-neutral-100 text-neutral-500"
              )}
            >
              Keynotes
            </Toggle>

            {/* Disabled Date Picker */}
            <DatePicker
              date={undefined}
              onDateChange={undefined}
              placeholder="Date"
              className="h-7 text-xs opacity-50 pointer-events-none"
              disabled={true}
            />
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
