"use client";

import { useState, useCallback } from "react";
import { api } from "~/trpc/react";
import type { Event, EventFilters } from "~/types/events";

interface AISearchResult {
  events: Event[];
  aiKeywords: string[];
  searchQuery: string;
}

interface AISearchState {
  isSearching: boolean;
  error: string | null;
  lastQuery: string | null;
  lastResult: AISearchResult | null;
}

interface UseAISearchProps {
  currentFilters?: Pick<EventFilters, "type" | "category" | "location">;
  onSearchComplete?: (result: AISearchResult) => void;
  onError?: (error: string) => void;
}

export function useAISearch({
  currentFilters,
  onSearchComplete,
  onError,
}: UseAISearchProps = {}) {
  const [searchState, setSearchState] = useState<AISearchState>({
    isSearching: false,
    error: null,
    lastQuery: null,
    lastResult: null,
  });

  // tRPC mutation for AI search
  const searchWithAI = api.events.searchWithAI.useMutation({
    onSuccess: (result) => {
      const aiResult: AISearchResult = {
        events: result.events,
        aiKeywords: result.aiKeywords,
        searchQuery: result.searchQuery,
      };

      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        error: null,
        lastResult: aiResult,
      }));

      onSearchComplete?.(aiResult);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to search events. Please try again.";

      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    },
  });

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        return;
      }

      const trimmedQuery = query.trim();

      setSearchState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
        lastQuery: trimmedQuery,
      }));

      // Prepare current filters for the API call
      const filters = {
        type: currentFilters?.type,
        category:
          currentFilters?.category === "all"
            ? undefined
            : currentFilters?.category,
        area: currentFilters?.location?.areas?.[0], // Use first area if multiple selected
      };

      searchWithAI.mutate({
        prompt: trimmedQuery,
        currentFilters: filters,
      });
    },
    [searchWithAI, currentFilters],
  );

  const clearSearch = useCallback(() => {
    setSearchState({
      isSearching: false,
      error: null,
      lastQuery: null,
      lastResult: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Helper to check if there's an active search
  const hasActiveSearch = Boolean(
    searchState.lastQuery && searchState.lastResult,
  );

  // Helper to get search result events
  const searchResultEvents = searchState.lastResult?.events || [];

  return {
    // State
    isSearching: searchState.isSearching,
    error: searchState.error,
    lastQuery: searchState.lastQuery,
    lastResult: searchState.lastResult,
    hasActiveSearch,
    searchResultEvents,

    // Actions
    performSearch,
    clearSearch,
    clearError,

    // Additional info
    aiKeywords: searchState.lastResult?.aiKeywords || [],
    searchQuery: searchState.lastResult?.searchQuery,
  };
}
