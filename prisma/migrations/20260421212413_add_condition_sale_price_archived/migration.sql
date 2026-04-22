-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "condition" "VehicleCondition" NOT NULL DEFAULT 'USED',
ADD COLUMN     "salePriceAmount" INTEGER;

-- CreateIndex
CREATE INDEX "Vehicle_archivedAt_idx" ON "Vehicle"("archivedAt");
