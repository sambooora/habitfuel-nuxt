/*
  Warnings:

  - A unique constraint covering the columns `[authId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authId" TEXT;

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleEncrypted" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "focusSessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "workSessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "elapsedWorkSeconds" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workDuration" INTEGER NOT NULL DEFAULT 1500,
    "shortBreakDuration" INTEGER NOT NULL DEFAULT 300,
    "longBreakDuration" INTEGER NOT NULL DEFAULT 900,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Statistic_userId_idx" ON "Statistic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Statistic_userId_periodType_periodStart_key" ON "Statistic"("userId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "Setting_userId_active_idx" ON "Setting"("userId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
