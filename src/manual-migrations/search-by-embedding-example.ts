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
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    dimensions: 1536,
  });

  if (!response.data[0]?.embedding) {
    throw new Error("No embedding returned from OpenAI");
  }

  return response.data[0].embedding;
}

async function searchEventsBySimilarity(query: string, limit: number = 10) {
  console.log(`Searching for events similar to: "${query}"`);

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    const vectorString = pgvector.toSql(queryEmbedding);

    // Search for similar events using cosine similarity
    const similarEvents = await prisma.$queryRaw`
      SELECT 
        id,
        title,
        description,
        area,
        "start_date",
        1 - (embeddings <=> ${vectorString}::vector) as similarity
      FROM "Event"
      WHERE embeddings IS NOT NULL
      ORDER BY embeddings <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    console.log(`\nTop ${limit} similar events:\n`);

    (similarEvents as any[]).forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Area: ${event.area || "N/A"}`);
      console.log(`   Date: ${new Date(event.startDate).toLocaleDateString()}`);
      console.log(`   Similarity: ${(event.similarity * 100).toFixed(2)}%`);
      console.log(`   Description: ${event.description.substring(0, 100)}...`);
      console.log();
    });
  } catch (error) {
    console.error("Error searching events:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
async function main() {
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    process.exit(1);
  }

  // Example searches
  const searchQueries = ["Fireside Chat"];

  // Run a search based on command line argument or default
  const query = process.argv[2] || searchQueries[0];

  if (!query) {
    console.error("Error: query is not set");
    process.exit(1);
  }

  await searchEventsBySimilarity(query, 5);
}

// Run the example
main().catch((error) => {
  console.error("Search failed:", error);
  process.exit(1);
});
