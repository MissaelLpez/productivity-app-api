/*
  Warnings:

  - Added the required column `redefined_time` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "redefined_time" TEXT NOT NULL;
