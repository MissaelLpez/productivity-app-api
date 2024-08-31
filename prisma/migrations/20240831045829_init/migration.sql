-- CreateEnum
CREATE TYPE "Status" AS ENUM ('todo', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'todo',
    "defined_time" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "paused_in" TEXT,
    "list_number" SERIAL NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);
