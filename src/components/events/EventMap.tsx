'use client';

import { useMemo, useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Users, Calendar, Loader2, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { getRelativeEventTime } from "~/lib/date-utils";
import { useEventMarkers, type ClusteredMarker } from "~/hooks/useEventMarkers";
import type { Event, LocationFilter, Coordinates, SanFranciscoArea, FilterType, EventCategory } from "~/types/events";
import { AREA_DISPLAY_NAMES } from "~/types/events";
import { AREA_CENTER_COORDINATES } from "~/lib/area-coordinates";
import { filterEventsByTime } from "~/lib/date-utils";

// Import Leaflet styles
import "~/styles/leaflet.css";

// Dynamically import React-Leaflet components for SSR compatibility
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-50">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  )
});

const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Circle })), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Popup })), { ssr: false });

// San Francisco center coordinates
const SF_CENTER_COORDS: Coordinates = {
  lat: 37.7749,
  lng: -122.4194,
};

type EventMapProps = {
  events: Event[];
  onLocationFilter: (locationFilter: LocationFilter) => void;
  selectedLocations?: LocationFilter[];
  className?: string;
  // New props for toggle behavior
  onToggleArea?: (area: SanFranciscoArea) => void;
  onToggleCoordinates?: (coordinates: Coordinates, radius?: number) => void;
  currentLocationFilter?: LocationFilter;
  // Filters to apply for counting events in bubbles (but still show all areas)
  timeFilter?: FilterType;
  categoryFilter?: EventCategory | "all";
};


// Category colors matching EventCard
const categoryColors: Record<string, string> = {
  Conference: "bg-blue-500",
  Workshop: "bg-green-500", 
  Social: "bg-purple-500",
  Networking: "bg-orange-500",
  Meetup: "bg-indigo-500",
  Webinar: "bg-red-500",
};

// Category display colors for UI elements
const categoryDisplayColors: Record<string, string> = {
  Conference: "bg-blue-100 text-blue-800 border-blue-200",
  Workshop: "bg-green-100 text-green-800 border-green-200", 
  Social: "bg-purple-100 text-purple-800 border-purple-200",
  Networking: "bg-orange-100 text-orange-800 border-orange-200",
  Meetup: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Webinar: "bg-red-100 text-red-800 border-red-200",
};

export function EventMap({ 
  events, 
  onLocationFilter, 
  selectedLocations = [], 
  className,
  onToggleArea,
  onToggleCoordinates,
  currentLocationFilter,
  timeFilter = "upcoming",
  categoryFilter = "all"
}: EventMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet icon fix for Next.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        setLeafletLoaded(true);
      }).catch((error) => {
        console.error('Failed to load Leaflet:', error);
        setMapError('Failed to load map components');
      });
    }
  }, []);

  // Filter events based on time and category for displaying accurate counts
  const filteredEventsForCounting = useMemo(() => {
    let filtered = filterEventsByTime(events, timeFilter);
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    return filtered;
  }, [events, timeFilter, categoryFilter]);

  // Create clustered markers from filtered events with selection state
  const selectedAreas = currentLocationFilter?.areas || [];
  const selectedCoordinates = currentLocationFilter?.center;
  const clusteredMarkers = useEventMarkers(filteredEventsForCounting, 100, selectedAreas, selectedCoordinates);

  // Handle marker click for toggle selection behavior
  const handleMarkerClick = useCallback((marker: ClusteredMarker) => {
    if (marker.events.length === 1) {
      const event = marker.events[0]!;
      
      // Use toggle functions if available, otherwise fallback to old behavior
      if (event.area && onToggleArea) {
        onToggleArea(event.area);
      } else if (event.coordinates && onToggleCoordinates) {
        onToggleCoordinates(event.coordinates, 1); // 1km radius
      } else {
        // Fallback to old behavior for backward compatibility
        if (event.area) {
          onLocationFilter({
            areas: [event.area],
            includeApproximate: true,
          });
        } else if (event.coordinates) {
          onLocationFilter({
            center: event.coordinates,
            radius: 1, // 1km radius
            includeApproximate: true,
          });
        }
      }
    } else {
      // For clusters, handle each unique area/coordinate
      const areas = [...new Set(marker.events.map(e => e.area).filter(Boolean))];
      
      if (areas.length > 0 && onToggleArea) {
        // Toggle all areas in the cluster
        areas.forEach(area => onToggleArea(area as SanFranciscoArea));
      } else if (onToggleCoordinates) {
        // Toggle coordinate-based selection for cluster center
        onToggleCoordinates(marker.coordinates, 0.5); // 500m radius for clusters
      } else {
        // Fallback to old behavior
        onLocationFilter({
          center: marker.coordinates,
          radius: 0.5, // 500m radius for clusters
          includeApproximate: true,
        });
      }
    }
  }, [onLocationFilter, onToggleArea, onToggleCoordinates]);

  // Create custom marker icon
  const createMarkerIcon = useCallback((marker: ClusteredMarker) => {
    if (typeof window === 'undefined') return undefined;
    
    const isCluster = marker.isCluster;
    const eventCount = marker.events.length;
    const categoryColor = categoryColors[marker.primaryCategory] || 'bg-neutral-500';
    const isSelected = marker.isSelected;
    
    // Add visual selection indicators
    const selectionBorder = isSelected ? 'border-4 border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-2 border-white shadow-md';
    const selectionScale = isSelected ? 'transform scale-110' : '';
    
    if (isCluster) {
      return new (window as any).L.DivIcon({
        html: `
          <div class="w-8 h-8 rounded-full ${categoryColor} text-white flex items-center justify-center text-xs font-semibold ${selectionBorder} ${selectionScale} transition-all duration-200">
            ${eventCount}
          </div>
        `,
        className: 'custom-cluster-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    } else {
      const opacity = marker.locationType === 'approximate' ? 'opacity-75' : '';
      return new (window as any).L.DivIcon({
        html: `
          <div class="w-6 h-6 rounded-full ${categoryColor} ${opacity} ${selectionBorder} ${selectionScale} flex items-center justify-center transition-all duration-200">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        `,
        className: 'custom-event-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });
    }
  }, []);

  // Custom marker component
  const EventMarkerComponent = ({ marker }: { marker: ClusteredMarker }) => {
    const primaryEvent = marker.events[0]!;
    const eventCount = marker.events.length;
    const isCluster = eventCount > 1;
    const customIcon = createMarkerIcon(marker);
    
    return (
      <Marker
        position={[marker.coordinates.lat, marker.coordinates.lng]}
        icon={customIcon}
        eventHandlers={{
          click: () => handleMarkerClick(marker),
        }}
      >
        <Popup
          maxWidth={320}
          minWidth={200}
          closeButton={true}
          autoClose={false}
          closeOnEscapeKey={true}
        >
          <div className="min-w-64 max-w-80">
            {isCluster ? (
              <ClusterPopupContent events={marker.events} />
            ) : (
              <SingleEventPopupContent event={primaryEvent} />
            )}
          </div>
        </Popup>
      </Marker>
    );
  };

  // Handle map ready state
  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
    setMapError(null);
  }, []);

  // Handle map errors
  const handleMapError = useCallback((error: Error) => {
    console.error('Map error:', error);
    setMapError('Failed to load map');
  }, []);

  // Show loading state during SSR or while Leaflet is loading
  if (typeof window === 'undefined' || !leafletLoaded) {
    return (
      <div className={cn(
        "w-full h-96 md:h-[500px] bg-neutral-50 flex items-center justify-center rounded-lg border",
        className
      )}>
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (mapError) {
    return (
      <div className={cn(
        "w-full h-96 md:h-[500px] bg-neutral-50 flex items-center justify-center rounded-lg border",
        className
      )}>
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Unable to load map</p>
          <p className="text-xs text-neutral-500 mt-1">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-96 md:h-[500px] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 relative",
      className
    )}>
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-[1000]">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={[SF_CENTER_COORDS.lat, SF_CENTER_COORDS.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {clusteredMarkers.map((marker) => (
          <EventMarkerComponent key={marker.id} marker={marker} />
        ))}
        
        {/* Clickable area circles for SF neighborhoods */}
        {Object.entries(AREA_CENTER_COORDINATES).map(([area, coordinates]) => {
          const isSelected = selectedAreas.includes(area as SanFranciscoArea);
          const areaEvents = filteredEventsForCounting.filter(event => event.area === area);
          const hasEvents = areaEvents.length > 0;
          
          // Only show areas that have events (after filtering)
          if (!hasEvents) return null;
          
          return (
            <Circle
              key={`area-${area}`}
              center={[coordinates.lat, coordinates.lng]}
              radius={600} // 600m radius for neighborhood areas
              pathOptions={{
                color: isSelected ? '#3b82f6' : '#9ca3af',
                fillColor: isSelected ? '#3b82f6' : '#9ca3af',
                fillOpacity: isSelected ? 0.25 : 0.08,
                weight: isSelected ? 3 : 1.5,
                dashArray: isSelected ? undefined : '8, 4',
                className: isSelected ? 'area-circle-selected' : 'area-circle-unselected',
              }}
              eventHandlers={{
                click: () => {
                  if (onToggleArea) {
                    onToggleArea(area as SanFranciscoArea);
                  }
                },
                mouseover: (e) => {
                  const circle = e.target;
                  circle.setStyle({
                    weight: isSelected ? 4 : 3,
                    color: isSelected ? '#2563eb' : '#6b7280',
                    fillOpacity: isSelected ? 0.35 : 0.15,
                  });
                  
                  // Show tooltip
                  circle.bindTooltip(
                    `${AREA_DISPLAY_NAMES[area as SanFranciscoArea]} (${areaEvents.length} events)`, 
                    { 
                      permanent: false,
                      direction: 'top',
                      className: 'area-tooltip'
                    }
                  ).openTooltip();
                },
                mouseout: (e) => {
                  const circle = e.target;
                  circle.setStyle({
                    weight: isSelected ? 3 : 1.5,
                    color: isSelected ? '#3b82f6' : '#9ca3af',
                    fillOpacity: isSelected ? 0.25 : 0.08,
                  });
                  circle.closeTooltip();
                },
              }}
            >
              <Popup>
                <div className="p-3 min-w-48">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">
                      {AREA_DISPLAY_NAMES[area as SanFranciscoArea]}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {areaEvents.length} events
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-600 mb-3">
                    Click the area or this button to {isSelected ? 'deselect' : 'select'} this neighborhood
                  </p>
                  <button
                    onClick={() => onToggleArea?.(area as SanFranciscoArea)}
                    className={cn(
                      "w-full text-xs px-3 py-1.5 rounded font-medium transition-colors",
                      isSelected 
                        ? "bg-blue-500 text-white hover:bg-blue-600" 
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    )}
                  >
                    {isSelected ? '✓ Selected' : 'Select Area'}
                  </button>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {/* Show approximate area circles for events without exact coordinates */}
        {clusteredMarkers
          .filter(marker => marker.locationType === 'approximate')
          .map((marker) => {
            const categoryColor = categoryColors[marker.primaryCategory]?.replace('bg-', '') || 'neutral';
            const colorMap: Record<string, string> = {
              'blue-500': '#3b82f6',
              'green-500': '#10b981',
              'purple-500': '#8b5cf6',
              'orange-500': '#f97316',
              'indigo-500': '#6366f1',
              'red-500': '#ef4444',
              'neutral': '#6b7280',
            };
            const circleColor = colorMap[categoryColor] || '#6b7280';
            
            return (
              <Circle
                key={`circle-${marker.id}`}
                center={[marker.coordinates.lat, marker.coordinates.lng]}
                radius={300} // 300m radius for approximate areas
                pathOptions={{
                  color: circleColor,
                  fillColor: circleColor,
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5, 5',
                }}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}

// Single event popup content
function SingleEventPopupContent({ event }: { event: Event }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={cn(
                  "text-xs font-medium",
                  categoryDisplayColors[event.category] || "bg-neutral-100 text-neutral-800"
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
            
            <h3 className="font-semibold text-base text-neutral-900 line-clamp-2">
              {event.title}
            </h3>
            
            <p className="text-sm text-neutral-600 line-clamp-3 mt-1">
              {event.subtitle}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Calendar className="w-3 h-3" />
              <span>{getRelativeEventTime(event.date)}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            
            {event.attendeeCount && (
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Users className="w-3 h-3" />
                <span>{event.attendeeCount} attendees</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Cluster popup content
function ClusterPopupContent({ events }: { events: Event[] }) {
  const eventCount = events.length;
  const categories = [...new Set(events.map(e => e.category))];
  
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-base text-neutral-900">
              {eventCount} Events at this location
            </h3>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map(category => (
                <Badge 
                  key={category}
                  className={cn(
                    "text-xs font-medium",
                    categoryDisplayColors[category] || "bg-neutral-100 text-neutral-800"
                  )}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="border-b border-neutral-100 last:border-b-0 pb-2 last:pb-0">
                <p className="font-medium text-sm text-neutral-900 line-clamp-1">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{getRelativeEventTime(event.date)}</span>
                </div>
              </div>
            ))}
            
            {events.length > 5 && (
              <p className="text-xs text-neutral-500 text-center pt-1">
                +{events.length - 5} more events
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}