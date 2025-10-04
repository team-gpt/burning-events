-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image" TEXT NOT NULL,
    "venue_name" TEXT,
    "address" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE INDEX "Event_url_idx" ON "Event"("url");

-- CreateIndex
CREATE INDEX "Event_title_idx" ON "Event"("title");

-- CreateIndex
CREATE INDEX "Event_description_idx" ON "Event"("description");

-- CreateIndex
CREATE INDEX "Event_venue_name_idx" ON "Event"("venue_name");

-- CreateIndex
CREATE INDEX "Event_address_idx" ON "Event"("address");

-- CreateIndex
CREATE INDEX "Event_start_date_idx" ON "Event"("start_date");

-- CreateIndex
CREATE INDEX "Event_area_idx" ON "Event"("area");

-- CreateIndex
CREATE INDEX "Organizer_name_idx" ON "Organizer"("name");

-- CreateIndex
CREATE INDEX "Organizer_type_idx" ON "Organizer"("type");

-- CreateIndex
CREATE INDEX "Organizer_url_idx" ON "Organizer"("url");

-- CreateIndex
CREATE INDEX "Organizer_event_id_idx" ON "Organizer"("event_id");

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
