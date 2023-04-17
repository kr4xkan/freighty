/*
  Warnings:

  - Made the column `tripId` on table `Checkpoint` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Checkpoint" ALTER COLUMN "tripId" SET NOT NULL;
