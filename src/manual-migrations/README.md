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

---

# Populate Embeddings Migration

This migration generates vector embeddings for event descriptions using OpenAI's text-embedding-3-small model.

## Prerequisites

1. Set your OpenAI API key in the `.env` file:

   ```
   OPENAI_API_KEY=your-api-key-here
   ```

2. Ensure the database has the pgvector extension enabled (already configured in docker-compose.yaml)

## Running the Embeddings Migration

```bash
pnpm tsx src/manual-migrations/populate-embeddings.ts
```

## What it does

The populate embeddings migration script:

- Queries all events that don't have embeddings yet
- Generates 1536-dimensional embeddings using OpenAI's text-embedding-3-small model
- Processes events in batches of 10 to respect rate limits
- Updates the embeddings column in the database
- Provides progress updates and statistics
- Includes error handling for individual events

## Technical Details

- Model: `text-embedding-3-small` with 1536 dimensions
- Vector storage: PostgreSQL pgvector extension
- Batch size: 10 events at a time
- Rate limiting: 1 second delay between batches

## Cost Considerations

OpenAI charges for embeddings API usage. The text-embedding-3-small model is cost-effective but still incurs charges based on the number of tokens processed. Monitor your usage to avoid unexpected costs.

## Rerunning the Migration

The script only processes events where `embeddings IS NULL`, so it's safe to rerun if interrupted. It will skip events that already have embeddings.

## Searching by Similarity

Once embeddings are populated, you can search for similar events using semantic search:

```bash
# Search with a custom query
pnpm tsx src/manual-migrations/search-by-embedding-example.ts "music festivals and dancing"

# Or run with default example
pnpm tsx src/manual-migrations/search-by-embedding-example.ts
```

The search uses cosine similarity to find events with descriptions semantically similar to your query.
