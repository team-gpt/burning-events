import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type assertions to help with TypeScript if Prisma types aren't generated yet
type PrismaClientWithEvent = PrismaClient & {
  event: any;
};

const prisma = new PrismaClient() as PrismaClientWithEvent;

interface JSONEvent {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  image?: string;
  venue_name?: string;
  address?: string;
  location_fallback?: string;
  url: string;
  organizers?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  hosts?: Array<{
    name: string;
    type?: string;
    url?: string;
  }>;
}

async function main() {
  console.log("Starting event import...");

  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, "all_partiful_events.json");
    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    const events: JSONEvent[] = JSON.parse(jsonContent);

    console.log(`Found ${events.length} events to import`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (const [index, event] of events.entries()) {
      try {
        // Skip events without required fields
        if (!event.title || !event.start_date || !event.url) {
          console.log(`Skipping event ${index + 1}: Missing required fields`);
          skipCount++;
          continue;
        }

        // Check if event already exists by URL
        const existingEvent = await prisma.event.findFirst({
          where: { url: event.url },
        });

        if (existingEvent) {
          console.log(`Event already exists: ${event.title}`);
          skipCount++;
          continue;
        }

        // Prepare event data
        const eventData = {
          title: event.title,
          description: event.description || "",
          startDate: new Date(event.start_date),
          endDate: event.end_date
            ? new Date(event.end_date)
            : new Date(event.start_date),
          image: event.image || "",
          venueName: event.venue_name || null,
          address: event.address || null,
          area: event.location_fallback || null,
          url: event.url,
        };

        // Create event with organizers
        const createdEvent = await prisma.event.create({
          data: {
            ...eventData,
            organizers: {
              create: [
                // Add organizers from the organizers array
                ...(event.organizers || []).map((org) => ({
                  name: org.name,
                  type: org.type || "Organization",
                  url: org.url || "",
                })),
                // Also add hosts as organizers if they exist
                ...(event.hosts || [])
                  .filter((host) => host.name)
                  .map((host) => ({
                    name: host.name,
                    type: host.type || "Person",
                    url: host.url || "",
                  })),
              ],
            },
          },
          include: {
            organizers: true,
          },
        });

        successCount++;
        console.log(`${successCount}. Imported: ${createdEvent.title}`);
      } catch (error) {
        errorCount++;
        console.error(
          `Error importing event ${index + 1} (${event.title}):`,
          error,
        );
      }
    }

    console.log("\n=== Import Summary ===");
    console.log(`Total events in file: ${events.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Skipped (already exists or invalid): ${skipCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Fatal error during import:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
