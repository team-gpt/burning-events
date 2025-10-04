-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "embeddings" vector(1536);
