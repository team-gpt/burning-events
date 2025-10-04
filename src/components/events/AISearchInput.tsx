"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface AISearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
}

export function AISearchInput({
  onSearch,
  isLoading = false,
  error = null,
  placeholder = "Ask me about events... (e.g., 'AI events for founders')",
  className,
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
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Search Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "relative flex items-center rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
            "focus-within:border-neutral-300 focus-within:shadow-md",
            error && "border-red-200 focus-within:border-red-300"
          )}
        >
          {/* Search Icon */}
          <div className="flex items-center pl-4">
            <Search className="h-5 w-5 text-neutral-400" />
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
            style={{ outline: 'none', boxShadow: 'none' }}
            className={cn(
              "flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-500",
              "focus:outline-none focus:ring-0 focus:border-0 outline-none focus:shadow-none",
              "min-h-[2.5rem] max-h-32 overflow-y-auto",
              isLoading && "opacity-50"
            )}
          />

          {/* Submit Button */}
          <div className="flex items-center p-2">
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim() || isLoading}
              className={cn(
                "h-8 w-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900",
                "disabled:bg-neutral-300 disabled:hover:bg-neutral-300 disabled:text-neutral-500",
                "transition-all duration-200"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-3 text-xs text-neutral-500 text-center">
        Try queries like "networking events in SOMA" or "AI founders events"
      </div>
    </div>
  );
}