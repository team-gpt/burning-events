import { useMemo } from 'react';
import { getEventCoordinates, areCoordinatesNear } from '~/lib/area-coordinates';
import type { Event, Coordinates } from '~/types/events';

export type ClusteredMarker = {
  id: string;
  coordinates: Coordinates;
  events: Event[];
  isCluster: boolean;
  locationType: 'exact' | 'approximate';
  primaryCategory: string;
  area?: string; // SF area for approximate locations
  isSelected?: boolean; // Whether this marker is currently selected
};

/**
 * Custom hook for clustering event markers based on proximity
 */
export function useEventMarkers(
  events: Event[], 
  clusterRadius: number = 100,
  selectedAreas: string[] = [],
  selectedCoordinates?: Coordinates
) {
  return useMemo(() => {
    const markers: ClusteredMarker[] = [];
    
    events.forEach(event => {
      const coordinates = getEventCoordinates(event);
      if (!coordinates) return;

      // Check if we already have a marker at this location (within cluster radius)
      const existingMarker = markers.find(marker => 
        areCoordinatesNear(marker.coordinates, coordinates, clusterRadius)
      );

      if (existingMarker) {
        // Add to existing cluster
        existingMarker.events.push(event);
        existingMarker.isCluster = existingMarker.events.length > 1;
        
        // Update selection status - cluster is selected if any event is selected
        const isAreaSelected = event.area && selectedAreas.includes(event.area);
        const isCoordinateSelected = selectedCoordinates && 
          areCoordinatesNear(coordinates, selectedCoordinates, 50);
        if (isAreaSelected || isCoordinateSelected) {
          existingMarker.isSelected = true;
        }
        
        // Update primary category to most common one
        const categoryCounts = existingMarker.events.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        existingMarker.primaryCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || existingMarker.primaryCategory;
      } else {
        // Create new marker
        const isAreaSelected = event.area && selectedAreas.includes(event.area);
        const isCoordinateSelected = selectedCoordinates && 
          areCoordinatesNear(coordinates, selectedCoordinates, 50); // 50m tolerance for coordinate selection
        
        markers.push({
          id: `marker-${event.id}-${Date.now()}`,
          coordinates,
          events: [event],
          isCluster: false,
          locationType: event.coordinates ? 'exact' : 'approximate',
          primaryCategory: event.category,
          area: event.area,
          isSelected: isAreaSelected || isCoordinateSelected,
        });
      }
    });

    return markers;
  }, [events, clusterRadius, selectedAreas, selectedCoordinates]);
}

/**
 * Get statistics about the clustered markers
 */
export function getMarkerStats(markers: ClusteredMarker[]) {
  const totalEvents = markers.reduce((sum, marker) => sum + marker.events.length, 0);
  const clusteredMarkers = markers.filter(marker => marker.isCluster);
  const exactLocationMarkers = markers.filter(marker => marker.locationType === 'exact');
  const approximateLocationMarkers = markers.filter(marker => marker.locationType === 'approximate');

  return {
    totalMarkers: markers.length,
    totalEvents,
    clusteredMarkers: clusteredMarkers.length,
    exactLocationMarkers: exactLocationMarkers.length,
    approximateLocationMarkers: approximateLocationMarkers.length,
    averageEventsPerMarker: totalEvents / markers.length || 0,
  };
}