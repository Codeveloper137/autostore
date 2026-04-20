-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Vehicle_published_featured_idx" ON "Vehicle"("published", "featured");
