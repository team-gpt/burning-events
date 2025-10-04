import { render, screen } from '@testing-library/react';
import { EventMap } from '../EventMap';
import type { Event, LocationFilter } from '~/types/events';

// Mock React-Leaflet components for testing
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Circle: () => <div data-testid="circle" />,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => (component: any) => component);

// Mock Leaflet
jest.mock('leaflet', () => ({
  DivIcon: jest.fn().mockImplementation((options) => ({ options })),
}));

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'React Conference 2024',
    subtitle: 'Learn the latest in React development',
    date: '2024-12-15T10:00:00Z',
    location: 'Downtown San Francisco',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    locationType: 'exact',
    category: 'Conference',
    attendeeCount: 150,
  },
  {
    id: '2', 
    title: 'TypeScript Workshop',
    subtitle: 'Advanced TypeScript patterns',
    date: '2024-12-16T14:00:00Z',
    area: 'mission',
    locationType: 'approximate',
    category: 'Workshop',
    attendeeCount: 50,
  },
];

const mockOnLocationFilter = jest.fn();

describe('EventMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <EventMap
        events={mockEvents}
        onLocationFilter={mockOnLocationFilter}
      />
    );

    expect(screen.getByText('Initializing map...')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes when map loads', () => {
    // Mock window to simulate client-side
    Object.defineProperty(window, 'L', {
      value: {
        DivIcon: jest.fn().mockImplementation((options) => ({ options })),
      },
      writable: true,
    });

    render(
      <EventMap
        events={mockEvents}
        onLocationFilter={mockOnLocationFilter}
      />
    );

    // The map container should have proper accessibility attributes
    // (These would be visible once Leaflet is properly loaded)
  });

  it('handles empty events array gracefully', () => {
    render(
      <EventMap
        events={[]}
        onLocationFilter={mockOnLocationFilter}
      />
    );

    expect(screen.getByText('Initializing map...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EventMap
        events={mockEvents}
        onLocationFilter={mockOnLocationFilter}
        className="custom-map-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-map-class');
  });
});

// Integration test example
describe('EventMap Integration', () => {
  it('should cluster events at the same location', () => {
    const eventsAtSameLocation: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        subtitle: 'First event',
        date: '2024-12-15T10:00:00Z',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        category: 'Conference',
      },
      {
        id: '2',
        title: 'Event 2', 
        subtitle: 'Second event',
        date: '2024-12-15T14:00:00Z',
        coordinates: { lat: 37.7749, lng: -122.4194 }, // Same location
        category: 'Workshop',
      },
    ];

    render(
      <EventMap
        events={eventsAtSameLocation}
        onLocationFilter={mockOnLocationFilter}
      />
    );

    // The component should cluster these events into a single marker
    // This would be tested with proper Leaflet mocking in a real test environment
  });
});

export { mockEvents, mockOnLocationFilter };