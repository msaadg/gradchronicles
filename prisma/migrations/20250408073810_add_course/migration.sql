/*
  Warnings:

  - The values [OTHER] on the enum `DocType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `course` on the `Document` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFileName` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocType_new" AS ENUM ('EXAM', 'ASSIGNMENT', 'NOTES', 'OTHER_RESOURCES');
ALTER TABLE "Document" ALTER COLUMN "docType" TYPE "DocType_new" USING ("docType"::text::"DocType_new");
ALTER TYPE "DocType" RENAME TO "DocType_old";
ALTER TYPE "DocType_new" RENAME TO "DocType";
DROP TYPE "DocType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "course",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "originalFileName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
