import { PrismaClient } from "@prisma/client";
import { OpenAI } from "openai";
import pgvector from "pgvector";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 1536,
    });

    if (!response.data[0]?.embedding) {
      throw new Error("No embedding returned from OpenAI");
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function populateEmbeddings() {
  console.log("Starting to populate embeddings for event descriptions...");

  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("Error: OPENAI_API_KEY environment variable is not set");
      console.log("Please set your OpenAI API key in the .env file:");
      console.log("OPENAI_API_KEY=your-api-key-here");
      process.exit(1);
    }

    // Get all events that don't have embeddings yet
    const events = await prisma.$queryRaw`
      SELECT id, description 
      FROM "Event" 
      WHERE embeddings IS NULL
    `;

    console.log(`Found ${(events as any[]).length} events without embeddings`);

    // Process events in batches to avoid rate limits
    const batchSize = 10;
    const eventArray = events as any[];

    for (let i = 0; i < eventArray.length; i += batchSize) {
      const batch = eventArray.slice(i, i + batchSize);

      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(eventArray.length / batchSize)}`,
      );

      await Promise.all(
        batch.map(async (event: any) => {
          try {
            // Generate embedding for the description
            const embedding = await generateEmbedding(event.description);

            // Convert the embedding to pgvector format
            const vectorString = pgvector.toSql(embedding);

            // Update the event with the embedding
            await prisma.$executeRaw`
              UPDATE "Event" 
              SET embeddings = ${vectorString}::vector
              WHERE id = ${event.id}
            `;

            console.log(`✓ Updated embeddings for event: ${event.id}`);
          } catch (error) {
            console.error(
              `✗ Failed to update embeddings for event ${event.id}:`,
              error,
            );
          }
        }),
      );

      // Add a small delay between batches to respect rate limits
      if (i + batchSize < eventArray.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Embeddings population completed!");

    // Show some statistics
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_events,
        COUNT(embeddings) as events_with_embeddings,
        COUNT(*) - COUNT(embeddings) as events_without_embeddings
      FROM "Event"
    `;

    console.log("\nStatistics:");
    console.log(stats);
  } catch (error) {
    console.error("Error in migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
populateEmbeddings().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
