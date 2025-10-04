# EventMap Component

The EventMap component is a React-Leaflet based interactive map for displaying and filtering events in San Francisco. It provides clustering, location filtering, and responsive design.

## Features

- **Interactive Map**: Built with React-Leaflet and OpenStreetMap tiles
- **Event Clustering**: Automatically groups events at similar locations
- **Location Filtering**: Click markers to filter events by area or radius
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized with React.memo, lazy loading, and efficient clustering
- **Error Handling**: Graceful handling of loading states and map errors

## Basic Usage

```tsx
import { EventMap } from '~/components/events/EventMap';

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  
  const handleLocationFilter = (filter: LocationFilter) => {
    // Handle location-based filtering
    console.log('Apply filter:', filter);
  };

  return (
    <EventMap
      events={events}
      onLocationFilter={handleLocationFilter}
      className="h-96"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `Event[]` | Yes | Array of events to display on the map |
| `onLocationFilter` | `(filter: LocationFilter) => void` | Yes | Callback when user clicks on markers for filtering |
| `selectedLocations` | `LocationFilter[]` | No | Array of currently active location filters |
| `className` | `string` | No | Additional CSS classes for the map container |

## Event Interface

Events can have either exact coordinates or approximate area locations:

```typescript
interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string; // ISO string
  category: EventCategory;
  
  // Exact location
  coordinates?: Coordinates;
  location?: string;
  venue_name?: string;
  address?: string;
  
  // Approximate location
  area?: SanFranciscoArea;
  locationType?: 'exact' | 'approximate';
  
  // Optional fields
  attendeeCount?: number;
  price?: { amount: number; currency: string };
  tags?: string[];
}
```

## Location Filtering

The component supports two types of location filtering:

### Area-based Filtering
```typescript
const areaFilter: LocationFilter = {
  areas: ['mission', 'soma'],
  includeApproximate: true
};
```

### Radius-based Filtering
```typescript
const radiusFilter: LocationFilter = {
  center: { lat: 37.7749, lng: -122.4194 },
  radius: 1, // kilometers
  includeApproximate: true
};
```

## Marker Types

### Single Event Markers
- **Exact locations**: Solid colored circle based on event category
- **Approximate locations**: Semi-transparent circle with dashed radius area
- **Color coding**: Each event category has a distinct color

### Clustered Markers
- **Multiple events**: Shows event count in a larger circle
- **Primary category**: Color based on most common category in cluster
- **Popup details**: Lists all events in the cluster

## Styling and Theming

The component uses Tailwind CSS classes and follows the existing design system:

```css
/* Custom marker styles in ~/styles/leaflet.css */
.custom-event-marker {
  /* Single event marker styling */
}

.custom-cluster-marker {
  /* Clustered marker styling */
}
```

Category colors are consistent with the EventCard component:
- Conference: Blue
- Workshop: Green  
- Social: Purple
- Networking: Orange
- Meetup: Indigo
- Webinar: Red

## Accessibility Features

- **ARIA labels**: Map has proper `role="application"` and `aria-label`
- **Keyboard navigation**: Map is focusable and supports keyboard interaction
- **Screen reader support**: Popups contain semantic HTML with proper headings
- **High contrast**: Markers have white borders for visibility
- **Focus management**: Proper focus handling for interactive elements

## Performance Optimization

- **Lazy loading**: React-Leaflet components are dynamically imported
- **Marker clustering**: Reduces DOM nodes and improves rendering
- **Memoization**: Uses React.memo and useMemo for expensive operations
- **Efficient updates**: Only re-renders when events or filters change

## Error Handling

The component handles various error scenarios:

- **Map loading failures**: Shows error message with retry option
- **Missing coordinates**: Gracefully handles events without location data
- **Network issues**: Fallback to offline map tiles when possible
- **Invalid data**: Validates event data before rendering markers

## Server-Side Rendering

The component is SSR-safe:
- Dynamic imports prevent hydration issues
- Loading states during client-side initialization
- Proper window object checks

## Advanced Usage with State Management

```tsx
import { EventMapExample } from '~/components/events/EventMapExample';

function EventsPage() {
  const events = useEvents();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Events in San Francisco</h1>
      <EventMapExample 
        events={events}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
```

## Testing

The component includes comprehensive tests:

```typescript
// Basic rendering test
import { render } from '@testing-library/react';
import { EventMap } from '~/components/events/EventMap';

test('renders loading state initially', () => {
  render(
    <EventMap
      events={mockEvents}
      onLocationFilter={jest.fn()}
    />
  );
  
  expect(screen.getByText('Initializing map...')).toBeInTheDocument();
});
```

## Dependencies

- `react-leaflet`: ^5.0.0 - React components for Leaflet
- `leaflet`: ^1.9.4 - Core mapping library
- `@types/leaflet`: ^1.9.20 - TypeScript definitions

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## File Structure

```
src/components/events/
├── EventMap.tsx              # Main component
├── EventMapExample.tsx       # Usage example with filtering
├── __tests__/
│   └── EventMap.test.tsx     # Test suite
src/hooks/
├── useEventMarkers.ts        # Marker clustering logic
src/lib/
├── area-coordinates.ts       # SF area coordinate mappings
src/styles/
├── leaflet.css              # Leaflet and custom map styles
```

## Contributing

When modifying the EventMap component:

1. Maintain accessibility standards
2. Test on mobile devices
3. Verify SSR compatibility
4. Update tests for new features
5. Follow existing code patterns

## Related Components

- `EventCard`: For displaying individual events
- `FilterControls`: For additional filtering options
- `EventsTimeline`: Alternative list view of events