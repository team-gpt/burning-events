import { OpenAI } from "openai";
import { z } from "zod";

// Define the schema for AI response
const AISearchKeywordsSchema = z.object({
  keywords: z
    .array(z.string())
    .describe(
      "Array of relevant keywords extracted from the user query for event search",
    ),
});

export type AISearchKeywords = z.infer<typeof AISearchKeywordsSchema>;

// Initialize OpenAI client (lazy initialization)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Extract search keywords from a natural language query using OpenAI
 */
export async function extractSearchKeywords(
  prompt: string,
): Promise<AISearchKeywords> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps extract search keywords from natural language queries about events. 
          
          Your task is to analyze user queries and extract:
          1. Relevant keywords that would help find events in a vector database
          2. Optional location/area filters if mentioned
          3. Optional time preferences (upcoming vs past events)
          
          Example queries and responses:
          - "AI events for founders" → keywords: ["AI", "artificial intelligence", "founders", "startup", "entrepreneurship"]
          - "networking events in SOMA" → keywords: ["networking", "professional"],
          - "past blockchain conferences" → keywords: ["blockchain", "crypto", "conference"]
          
          Be comprehensive with keywords to improve search results. Include synonyms and related terms.
          
          San Francisco areas you can suggest: SOMA, Mission Bay, Financial District, Castro, Mission, Sunset, Richmond, Presidio, Pacific Heights, Nob Hill, Russian Hill, North Beach, Chinatown, Hayes Valley, Tenderloin, Potrero Hill, Dogpatch, Embarcadero
          
          Respond with a JSON object matching the required schema.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "search_keywords",
          schema: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of relevant keywords extracted from the user query for event search",
              },
            },
            required: ["keywords"],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    try {
      const parsed = JSON.parse(content);
      return AISearchKeywordsSchema.parse(parsed);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content, parseError);
      // Fallback: use the original prompt as a single keyword
      return {
        keywords: [prompt],
      };
    }
  } catch (error) {
    console.error("Error extracting search keywords:", error);

    // Fallback: return the original prompt as a keyword
    return {
      keywords: [prompt],
    };
  }
}

/**
 * Combine multiple keyword arrays into a single search string
 */
export function combineKeywords(keywords: string[]): string {
  return keywords.join(" ");
}
