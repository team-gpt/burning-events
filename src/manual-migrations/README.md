# Manual Database Migrations

This directory contains manual migration scripts for populating and updating event data in the database.

## Prerequisites

1. Make sure your database is running:

   ```bash
   ./start-database.sh
   ```

2. Generate Prisma client (if not already done):

   ```bash
   pnpm prisma generate
   ```

3. Run database migrations (if not already done):
   ```bash
   pnpm prisma migrate dev
   ```

## Running the Migration

Run the import script:

```bash
pnpm tsx src/manual-migrations/populate-events.ts
```

## What it does

The migration script:

- Reads all events from `all_partiful_events.json`
- Validates required fields (title, start_date, url)
- Checks for duplicate events by URL
- Creates Event records with associated Organizer records
- Maps `location_fallback` to the `area` field
- Handles missing end_date by using start_date as fallback
- Combines both `organizers` and `hosts` arrays into Organizer records
- Provides a summary of imported, skipped, and failed events

## Fields Mapping

- `title` → `title`
- `description` → `description`
- `start_date` → `startDate`
- `end_date` → `endDate` (falls back to `startDate` if missing)
- `image` → `image`
- `venue_name` → `venueName`
- `address` → `address`
- `location_fallback` → `area`
- `url` → `url`
- `organizers` + `hosts` → `organizers` relation

## Skipped Fields

As requested, the following fields are ignored:

- `status`
- `attendance_mode`
- `display_datetime`
- `fetch_status`

## Known Issues

### Long Descriptions

Some events have very long descriptions that exceed PostgreSQL's btree index size limit (2704 bytes). The index on the description field has been removed to allow these events to be imported. If you need to search descriptions, consider using PostgreSQL's full-text search capabilities instead.

---

# Update Area Migration

This migration updates the area field for existing events based on location data from `partiful_urls_locations.json`.

## Running the Update Area Migration

After importing events, you can update their area field by running:

```bash
pnpm tsx src/manual-migrations/update-area.ts
```

## What it does

The update area migration script:

- Reads location data from `partiful_urls_locations.json`
- Filters out entries where location is null
- Matches events by URL (ignores the name field)
- Updates the area field only for events that are found in the database
- Skips events that already have the correct area
- Provides a summary of updated, not found, and unchanged events
- Shows area distribution statistics after the update

## Data Format

The `partiful_urls_locations.json` file should contain an array of objects with:

```json
{
  "partiful_url": "https://partiful.com/e/...",
  "location": "SOMA",
  "name": "Event Name (ignored for matching)"
}
```

## Important Notes

- Only events with non-null locations in the JSON file will be processed
- Matching is done strictly by URL, event names are ignored
- The script will not update events that already have the correct area value
- Run this migration after the initial event import (`populate-events.ts`)
