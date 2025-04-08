/*
  Warnings:

  - Added the required column `DocType` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('EXAM', 'NOTES', 'ASSIGNMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "DocType" "DocType" NOT NULL;
