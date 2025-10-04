import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateEventDescriptions() {
  console.log("Starting description update migration...\n");

  try {
    // Get all events with descriptions
    const events = await prisma.event.findMany({
      where: {
        description: {
          not: undefined,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    console.log(`Found ${events.length} events with descriptions to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (const event of events) {
      try {
        const originalDescription = event.description!;
        let newDescription = originalDescription;

        // Check if description starts with a day name
        const startsWithDay = dayNames.some((day) =>
          originalDescription.startsWith(day),
        );

        if (startsWithDay) {
          // Find the position after "+number" pattern or "spots left"
          let cutPosition = -1;

          // First, try to find "spots left"
          const spotsLeftIndex = originalDescription.indexOf("spots left");
          if (spotsLeftIndex !== -1) {
            // Cut after "spots left"
            cutPosition = spotsLeftIndex + "spots left".length;
          } else {
            // Look for "+number" pattern
            const plusNumberMatch = originalDescription.match(/\+\d+/);
            if (plusNumberMatch && plusNumberMatch.index !== undefined) {
              // Cut after the "+number" pattern
              cutPosition = plusNumberMatch.index + plusNumberMatch[0].length;
            }
          }

          if (cutPosition !== -1) {
            // Cut the description and trim any leading/trailing whitespace
            newDescription = originalDescription.substring(cutPosition).trim();

            // Update the event if the description changed
            if (newDescription !== originalDescription) {
              await prisma.event.update({
                where: { id: event.id },
                data: { description: newDescription },
              });
              updatedCount++;
              console.log(`✓ Updated: "${event.title}"`);
              console.log(
                `  Old (first 100 chars): ${originalDescription.substring(0, 100)}...`,
              );
              console.log(
                `  New (first 100 chars): ${newDescription.substring(0, 100)}...`,
              );
              console.log();
            } else {
              skippedCount++;
            }
          } else {
            // Description starts with day but no pattern found
            console.log(
              `⚠ Warning: "${event.title}" starts with day but no pattern found`,
            );
            console.log(
              `  Description: ${originalDescription.substring(0, 150)}...`,
            );
            console.log();
            skippedCount++;
          }
        } else {
          // Description doesn't start with a day name
          skippedCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Error processing event "${event.title}":`, error);
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total events processed: ${events.length}`);
    console.log(`✓ Updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`✗ Errors: ${errorCount}`);

    // Show some examples of updated descriptions
    if (updatedCount > 0) {
      console.log("\n=== Sample Updated Events ===");
      const updatedEvents = await prisma.event.findMany({
        where: {
          description: {
            not: undefined,
          },
        },
        select: {
          title: true,
          description: true,
        },
        take: 3,
        orderBy: {
          updatedAt: "desc",
        },
      });

      updatedEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   ${event.description?.substring(0, 200)}...`);
      });
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateEventDescriptions()
  .then(() => {
    console.log("\nMigration completed successfully!");
  })
  .catch((error) => {
    console.error("Migration error:", error);
    process.exit(1);
  });
