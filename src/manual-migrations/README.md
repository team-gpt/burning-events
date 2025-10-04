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

---

# TRPC Search Endpoint

## searchWithEmbeddings Endpoint

A new TRPC endpoint has been added to search events using both text search and semantic embeddings search.

### Endpoint Details

- **Endpoint**: `events.searchWithEmbeddings`
- **Input**: `{ prompt: string }` - A search query
- **Output**: Array of Event objects

### Features

1. **Text Search**: Searches for the prompt in event titles and descriptions using case-insensitive substring matching
2. **Semantic Search**: Converts the prompt to embeddings using OpenAI's text-embedding-3-large model and finds similar events using cosine similarity
3. **Combined Results**: Deduplicates and returns results from both search methods
4. **Fallback**: If embeddings search fails (e.g., OpenAI API key not set), falls back to text-only search

### Requirements

- **OPENAI_API_KEY** environment variable must be set for embeddings search to work
- Events must have embeddings populated (use `populate-embeddings.ts` script)

### Testing the Endpoint

A test script is provided to test the endpoint:

```bash
pnpm tsx src/manual-migrations/test-search-endpoint.ts
```

This will run several test searches and display the results.

### Example Usage in Code

```typescript
// Using the TRPC client
const results = await trpc.events.searchWithEmbeddings.query({
  prompt: "AI and machine learning meetups",
});

// Results will include events that:
// - Have "AI" or "machine learning" in their title/description
// - Have semantic similarity to the prompt based on their embeddings
```

### How It Works

1. **Parallel Processing**: Text search and embedding generation happen in parallel for better performance
2. **Vector Search**: Uses pgvector's cosine distance operator (`<=>`) to find similar events
3. **Result Limit**: Returns up to 20 events from vector search, combined with all text matches
4. **Deduplication**: Events found by both methods appear only once in results
5. **Error Handling**: Gracefully falls back to text-only search if embeddings fail

---

# Update Descriptions Migration

This migration cleans up event descriptions by removing prefixed day/time information and cutting until specific patterns.

## Running the Update Descriptions Migration

```bash
pnpm tsx src/manual-migrations/update-descriptions.ts
```

## What it does

The update descriptions migration script:

- Identifies events with descriptions starting with day names (Monday-Sunday)
- Searches for specific cut patterns:
  - "+<number>" (e.g., +3, +12234)
  - "spots left"
- Removes all content before and including these patterns
- Preserves the actual description content after the patterns
- Provides a summary of updated, skipped, and failed events
- Shows sample updated events for verification

## Pattern Examples

**Before:**

```
"Tuesday, Oct 79:00am – 3:00pmPTGMTHosted byᵔ▿ᵔᵔ◡ᵔ+4The SR005 cohort is taking the stage..."
```

**After:**

```
"The SR005 cohort is taking the stage..."
```

**Before:**

```
"Thursday, Oct 94:30pm – 7:30pmPTGMTHosted by⚆◟⚆^⎵^+40/493 spots leftJoin Atlassian to celebrate..."
```

**After:**

```
"Join Atlassian to celebrate..."
```

## Important Notes

- Only processes events where descriptions start with day names
- Safe to rerun - only updates events that match the pattern
- Preserves descriptions that don't match the pattern
- Trims whitespace from cleaned descriptions
- Run after initial event import for best results
