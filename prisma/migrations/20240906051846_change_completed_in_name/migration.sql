/*
  Warnings:

  - You are about to drop the column `completed_in` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completed_in",
ADD COLUMN     "remaining_time" TEXT;
