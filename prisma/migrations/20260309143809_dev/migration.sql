/*
  Warnings:

  - Made the column `hours_per_week` on table `Subject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "hours_per_week" SET NOT NULL,
ALTER COLUMN "hours_per_week" SET DEFAULT 0;
