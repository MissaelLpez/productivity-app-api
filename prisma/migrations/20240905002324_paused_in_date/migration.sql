/*
  Warnings:

  - The `paused_in` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "paused_in",
ADD COLUMN     "paused_in" TIMESTAMP(3);
