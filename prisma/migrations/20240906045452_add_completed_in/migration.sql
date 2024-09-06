-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completed_in" TEXT,
ALTER COLUMN "redefined_time" DROP NOT NULL;
