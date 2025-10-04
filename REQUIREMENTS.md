# Events Dashboard Requirements

## Project Overview

You are tasked with transforming the current T3 stack boilerplate into a modern, Luma-inspired events dashboard. This dashboard will serve as a landing page that displays events in a timeline format with filtering capabilities.

### Goals
- Remove all T3 boilerplate UI components
- Create a clean, modern events dashboard
- Implement filtering for past/upcoming events and categories
- Use best practices with small, reusable components
- Follow Luma.com design inspiration for UI/UX

## Current Technical Stack

The project is built with:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **tRPC** for API layer (currently has demo post endpoints)
- **Prisma** for database (ignore for now, use dummy data)
- **React 19** for UI

## Required Dependencies to Install

Before starting, install these additional packages:

```bash
# Date manipulation
pnpm add moment

# Shadcn/ui setup (if not already configured)
npx shadcn@latest init

# Required Shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add toggle
npx shadcn@latest add select
npx shadcn@latest add skeleton
```

## Data Structure

### Event Interface

Create a TypeScript interface for events with these fields:

```typescript
interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string; // ISO string format
  location?: string;
  category: EventCategory;
  image?: string; // URL to event image
  description?: string;
}

type EventCategory = 
  | "Conference" 
  | "Workshop" 
  | "Social" 
  | "Networking" 
  | "Meetup" 
  | "Webinar";
```

### Dummy Data Requirements

Create a file `src/data/dummy-events.ts` with at least 15-20 mock events that include:

- **Past events** (3-5 events from previous days/weeks)
- **Today's events** (2-3 events)
- **Tomorrow's events** (2-3 events)
- **Future events** (8-10 events spread across different dates)
- **Mixed categories** to test filtering
- **Realistic data** (use real conference/event names if helpful)

Example dummy event:
```typescript
{
  id: "1",
  title: "React Conf 2024",
  subtitle: "The annual React community conference",
  date: "2024-10-15T10:00:00Z",
  location: "San Francisco, CA",
  category: "Conference",
  image: "https://example.com/react-conf.jpg"
}
```

## Component Architecture

Create the following components with their specifications:

### 1. EventCard Component
**File:** `src/components/events/EventCard.tsx`

**Props:**
```typescript
interface EventCardProps {
  event: Event;
  variant?: "default" | "compact";
}
```

**Requirements:**
- Display event title, subtitle, date/time, location, category
- Show category as a colored badge
- Include placeholder for event image
- Use Shadcn Card component as base
- Responsive design (stack on mobile)
- Hover effects for better UX

### 2. EventsTimeline Component
**File:** `src/components/events/EventsTimeline.tsx`

**Props:**
```typescript
interface EventsTimelineProps {
  events: Event[];
  isLoading?: boolean;
}
```

**Requirements:**
- Group events by date using Moment.js
- Display date headers: "Today", "Tomorrow", then actual dates
- Handle empty states
- Show loading skeleton when `isLoading` is true
- Sort events chronologically (most recent first for past, earliest first for upcoming)

### 3. FilterControls Component
**File:** `src/components/events/FilterControls.tsx`

**Props:**
```typescript
interface FilterControlsProps {
  selectedFilter: "upcoming" | "past";
  selectedCategory: EventCategory | "all";
  onFilterChange: (filter: "upcoming" | "past") => void;
  onCategoryChange: (category: EventCategory | "all") => void;
  categories: EventCategory[];
}
```

**Requirements:**
- Toggle component for Past/Upcoming (use Shadcn Toggle)
- Select/dropdown for categories (use Shadcn Select)
- Clear, accessible labels
- Responsive layout

### 4. DateGroupHeader Component
**File:** `src/components/events/DateGroupHeader.tsx`

**Props:**
```typescript
interface DateGroupHeaderProps {
  date: string; // ISO string
  eventCount: number;
}
```

**Requirements:**
- Display friendly date labels ("Today", "Tomorrow", or formatted date)
- Show event count for that day
- Consistent styling and spacing

### 5. LoadingState Component
**File:** `src/components/events/LoadingState.tsx`

**Requirements:**
- Use Shadcn Skeleton component
- Mimic the layout of actual EventCard
- Show 3-4 skeleton cards
- Smooth loading animation

### 6. EmptyState Component
**File:** `src/components/events/EmptyState.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  type: "no-events" | "no-results";
  message?: string;
}
```

**Requirements:**
- Display appropriate message based on type
- Include call-to-action or helpful text
- Centered layout with appropriate spacing

## Date Handling with Moment.js

### Required Date Functions

Create utility functions in `src/utils/dateUtils.ts`:

```typescript
// Group events by date
export function groupEventsByDate(events: Event[]): Record<string, Event[]>

// Get friendly date label
export function getFriendlyDateLabel(date: string): string

// Check if date is today, tomorrow, or past
export function getDateCategory(date: string): "today" | "tomorrow" | "past" | "future"

// Sort events within a day
export function sortEventsByTime(events: Event[]): Event[]
```

### Date Grouping Logic
- **Today**: Use "Today" as header
- **Tomorrow**: Use "Tomorrow" as header  
- **Other dates**: Use format like "Monday, Oct 15" for this week, "Oct 15, 2024" for other dates
- **Past events**: Most recent first
- **Upcoming events**: Earliest first

## Design Specifications

### Luma-Inspired Design Guidelines

**Color Palette:**
- Primary: Modern blues/purples (#6366f1, #8b5cf6)
- Background: Clean whites and light grays (#f8fafc, #f1f5f9)
- Text: Dark grays (#1e293b, #475569)
- Accent: Bright colors for categories (#ef4444, #22c55e, #f59e0b)

**Typography:**
- Headers: Bold, modern sans-serif
- Body: Clean, readable text
- Event titles: Medium weight, larger size
- Subtitles: Lighter weight, smaller size

**Spacing:**
- Use Tailwind's spacing scale consistently
- Cards: 4-6 padding units
- Sections: 8-12 margin units
- Tight spacing for related elements

**Cards:**
- Subtle shadows and borders
- Rounded corners (6-8px)
- Hover effects with slight elevation
- Clean, minimal design

### Responsive Breakpoints
- **Mobile (< 768px)**: Single column, stacked layout
- **Tablet (768px - 1024px)**: Adjusted padding, possibly 2-column for some elements
- **Desktop (> 1024px)**: Full layout with optimal spacing

## Implementation Steps

### Phase 1: Project Cleanup
1. **Remove T3 boilerplate:**
   - Clean `src/app/page.tsx` (remove all T3 demo content)
   - Delete `src/app/_components/post.tsx`
   - Remove or comment out post-related tRPC routes

2. **Set up dependencies:**
   - Install moment and shadcn components
   - Verify Tailwind CSS is working correctly

### Phase 2: Data Layer
1. **Create dummy data file:**
   - Build `src/data/dummy-events.ts` with comprehensive test data
   - Export events array and helper functions
   - Include variety of dates, categories, and realistic content

2. **Create utilities:**
   - Build `src/utils/dateUtils.ts` with all date manipulation functions
   - Test date grouping logic thoroughly

### Phase 3: Core Components
1. **Build base components in order:**
   - `DateGroupHeader` (simplest)
   - `EventCard` (core display component)
   - `LoadingState` and `EmptyState`
   - `FilterControls`
   - `EventsTimeline` (most complex, combines others)

2. **Test each component individually:**
   - Create with proper TypeScript interfaces
   - Test with various props and edge cases
   - Ensure responsive behavior

### Phase 4: Main Dashboard Integration
1. **Update main page (`src/app/page.tsx`):**
   - Import all necessary components
   - Implement state management for filters
   - Handle loading states
   - Connect all pieces together

2. **Implement filtering logic:**
   - Filter by past/upcoming based on current date
   - Filter by category
   - Combine multiple filters properly

### Phase 5: Styling and Polish
1. **Apply design system:**
   - Consistent spacing and typography
   - Proper color usage
   - Hover and interaction states

2. **Mobile optimization:**
   - Test on various screen sizes
   - Adjust layouts for mobile
   - Ensure touch-friendly interfaces

### Phase 6: Quality Assurance
1. **Run development checks:**
   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run dev
   ```

2. **Test functionality:**
   - All filters work correctly
   - Date grouping is accurate
   - Loading states appear appropriately
   - Responsive design works on mobile

## File Structure

Your final file structure should look like this:

```
src/
├── app/
│   ├── layout.tsx (existing)
│   └── page.tsx (updated dashboard)
├── components/
│   └── events/
│       ├── EventCard.tsx
│       ├── EventsTimeline.tsx
│       ├── FilterControls.tsx
│       ├── DateGroupHeader.tsx
│       ├── LoadingState.tsx
│       └── EmptyState.tsx
├── data/
│   └── dummy-events.ts
├── utils/
│   └── dateUtils.ts
└── types/
    └── events.ts (optional: centralized type definitions)
```

## Acceptance Criteria

### Must Have Features
- ✅ **Clean Dashboard**: No T3 boilerplate visible
- ✅ **Timeline Layout**: Events displayed chronologically with date groupings
- ✅ **Past/Upcoming Toggle**: Working filter with proper date logic
- ✅ **Category Filter**: Dropdown/select with all categories
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Loading States**: Skeleton components during loading
- ✅ **Empty States**: Proper messages when no events found
- ✅ **Type Safety**: All components properly typed with TypeScript

### Quality Requirements
- ✅ **No console errors or warnings**
- ✅ **Passes linting and type checking**
- ✅ **Clean, readable code with proper component separation**
- ✅ **Proper use of Tailwind CSS classes**
- ✅ **Accessibility considerations (alt tags, proper semantic HTML)**

### Design Requirements
- ✅ **Luma-inspired visual design**
- ✅ **Consistent spacing and typography**
- ✅ **Smooth hover effects and transitions**
- ✅ **Professional, modern appearance**

## Testing Guidelines

### Manual Testing Checklist
1. **Functionality:**
   - [ ] Past/Upcoming toggle changes event list
   - [ ] Category filter works for all categories
   - [ ] Date grouping is correct (Today, Tomorrow, specific dates)
   - [ ] Events sorted properly within each date group

2. **Edge Cases:**
   - [ ] No events in selected filter shows empty state
   - [ ] Loading state appears and disappears correctly
   - [ ] Dates crossing midnight work correctly

3. **Responsive:**
   - [ ] Desktop layout looks good
   - [ ] Tablet layout is usable
   - [ ] Mobile layout is clean and functional

4. **Performance:**
   - [ ] Page loads quickly
   - [ ] Filtering is responsive
   - [ ] No unnecessary re-renders

## Common Pitfalls to Avoid

1. **Date Issues:**
   - Always use consistent timezone handling
   - Test edge cases around midnight
   - Don't forget to handle invalid dates

2. **State Management:**
   - Keep filter state in the main page component
   - Don't mutate props directly
   - Handle loading states properly

3. **Performance:**
   - Don't filter/sort on every render
   - Use proper React keys for list items
   - Optimize re-renders with proper dependency arrays

4. **Styling:**
   - Test on different screen sizes early and often
   - Don't hardcode sizes that might break responsive design
   - Use Tailwind's responsive prefixes consistently

## Questions to Ask

If you encounter any ambiguity, consider these questions:
- How should events that span multiple days be handled?
- Should time be displayed in 12-hour or 24-hour format?
- What should happen if an event has no location?
- Should we show past events from all time or limit to recent past?
- How should very long event titles be handled (truncation)?

Remember: Focus on creating clean, reusable components that follow React and TypeScript best practices. The goal is a professional-looking events dashboard that can be easily extended with real data later.