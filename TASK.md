# Map View Implementation Task

## Overview
We're adding a Map view to complement the existing List view. Users will be able to toggle between views, see events on a map with pins/areas, click to filter by location, and see filtered results below the map.

## Example Data Structure
Here's the expected data format we'll be working with:
```json
{
  "title": "Venture Voices: Peer-to-Peer Conversations - #SFTechWeek",
  "description": "The venture playbook is evolving — and everyone's writing their own version...",
  "start_date": "2025-10-06T20:00:00.000Z",
  "end_date": "2025-10-06T21:30:00.000Z",
  "image": "https://partiful.imgix.net/user/EhKBwieWrCaIDVeHqYm34XT80fd2/4d5f112b-67fd-4b09-8d?w=1000&h=1252&fit=clip",
  "venue_name": "Transamerica Redwood Park",
  "address": "600 Montgomery St, San Francisco, CA 94111",
  "area": "soma",
  "organizers": [
    {
      "name": "L Reddy",
      "type": "Person",
      "url": "https://partiful.com/u/EhKBwieWrCaIDVeHqYm34XT80fd2"
    }
  ]
}
```

## 1. Dependencies & Setup
- **Install React-Leaflet**: `npm install react-leaflet leaflet @types/leaflet`
- **Why React-Leaflet**: Free, no API keys required, good React integration, perfect for our use case
- **Add CSS**: Import Leaflet CSS in globals.css

## 2. Data Structure Updates

### Update Event Interface (`src/types/events.ts`)
```typescript
export interface Event {
  // existing fields...
  venue_name?: string;
  address?: string; 
  area?: string; // SF neighborhood like "soma", "mission"
  coordinates?: {
    lat: number;
    lng: number;
  };
  locationType: 'exact' | 'approximate'; // exact = has coordinates, approximate = area only
}
```

### Update Dummy Data (`src/data/events.ts`)
- Convert all events to SF locations
- Add coordinates for exact locations (use Google Maps/OpenStreetMap)
- Add area field for neighborhood-based events
- SF Areas to use: soma, mission, castro, marina, haight, richmond, sunset, nob-hill, financial-district

## 3. New Components

### A. ViewToggle Component (`src/components/events/ViewToggle.tsx`)
- Simple toggle between "List" and "Map" views
- Use existing Toggle component from UI library
- Place in FilterControls component

### B. EventMap Component (`src/components/events/EventMap.tsx`)
- Main map container using react-leaflet
- Props: events[], onLocationFilter(), selectedLocations[]
- Center on SF: lat: 37.7749, lng: -122.4194, zoom: 12
- Render MapMarker components for each unique location

### C. MapMarker Component (`src/components/events/MapMarker.tsx`)
- For exact locations: regular pin marker
- For approximate (area): circle marker with neighborhood name
- Show event count badge
- Click handler to trigger location filtering
- Popup with location details

### D. MapEventsList Component (`src/components/events/MapEventsList.tsx`)
- Simplified version of EventsTimeline
- Shows filtered events below map
- Maintains same styling and grouping as timeline view

## 4. State Management Updates

### Extend useEventFilters Hook (`src/hooks/useEventFilters.ts`)
- Add location filtering state
- Add functions: `setLocationFilter()`, `clearLocationFilter()`
- Update filtering logic to include location-based filtering

### Add Map View State (`src/app/page.tsx`)
- Add `viewMode: 'list' | 'map'` state
- Toggle between EventsTimeline and EventMap components

## 5. Implementation Steps

### Step 1: Install dependencies and setup
- Install React-Leaflet packages
- Add Leaflet CSS to globals.css

### Step 2: Update type definitions
- Modify Event interface
- Update EventFilters interface for location filtering

### Step 3: Update dummy data
- Research SF coordinates for venues
- Add neighborhood areas for events
- Set locationType for each event

### Step 4: Create ViewToggle component
- Simple toggle with "List" and "Map" options
- Integrate into FilterControls

### Step 5: Create map components
- EventMap (main container)
- MapMarker (individual pins/areas)  
- MapEventsList (filtered results)

### Step 6: Update filtering logic
- Extend useEventFilters for location filtering
- Handle both exact coordinates and area-based filtering

### Step 7: Integrate into main page
- Add view mode state
- Conditionally render List vs Map view
- Ensure filters persist between views

### Step 8: Styling and UX
- Match existing design system
- Responsive layout for map
- Loading states and error handling

## 6. Technical Details for Junior Developer

### React-Leaflet Basic Usage
```jsx
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';

<MapContainer center={[37.7749, -122.4194]} zoom={12}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lng]} />
  <Circle center={[lat, lng]} radius={1000} />
</MapContainer>
```

### Filtering Logic Approach
- When user clicks map marker, add location to `selectedLocations[]`
- Filter events where `event.area === selectedArea` OR `event.coordinates` within radius
- Update URL params to maintain filter state

### SF Neighborhood Coordinates (approximate centers)
- SOMA: [37.7749, -122.4194]
- Mission: [37.7599, -122.4148]
- Castro: [37.7609, -122.4350]
- Marina: [37.8021, -122.4363]
- Haight: [37.7692, -122.4481]
- Richmond: [37.7806, -122.4644]
- Sunset: [37.7434, -122.4822]
- Nob Hill: [37.7947, -122.4163]
- Financial District: [37.7946, -122.4013]

## 7. User Experience Requirements

### View Toggle Behavior
- Toggle should be prominently placed at the top
- Default view remains List view
- State should persist during session
- Smooth transition between views

### Map Interaction
- Click on pin/area to filter events by that location
- Multiple locations can be selected
- Clear visual indication of selected locations
- Clicking same location again should deselect it

### Filtered Events Display
- Events list appears below the map
- Maintains all existing filters (time, category)
- Shows same event cards as list view
- Maintains same grouping (today/tomorrow/future)
- Shows count of filtered events

## 8. Files to Create/Modify
- **Create**: `src/components/events/ViewToggle.tsx`
- **Create**: `src/components/events/EventMap.tsx` 
- **Create**: `src/components/events/MapMarker.tsx`
- **Create**: `src/components/events/MapEventsList.tsx`
- **Modify**: `src/types/events.ts`
- **Modify**: `src/data/events.ts`
- **Modify**: `src/hooks/useEventFilters.ts`
- **Modify**: `src/components/events/FilterControls.tsx`
- **Modify**: `src/app/page.tsx`
- **Modify**: `src/styles/globals.css`

## 9. Testing Considerations
- Test view toggle functionality
- Test location filtering on map
- Test that all existing filters work in map view
- Test responsive design on mobile devices
- Test with various event densities in different areas
- Test edge cases (events without location data)

## 10. Performance Notes
- Consider marker clustering if many events in same area
- Lazy load map component to improve initial page load
- Optimize re-renders when filtering
- Consider virtualizing events list if many filtered results

This plan provides a complete roadmap for implementing the Map view feature while maintaining all existing functionality and ensuring a smooth user experience.