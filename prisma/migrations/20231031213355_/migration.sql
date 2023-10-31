/*
  Warnings:

  - Added the required column `category` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "courseId" TEXT,
    "formationId" TEXT,
    "projectId" TEXT,
    CONSTRAINT "Skill_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Skill_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Skill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("courseId", "formationId", "icon", "id", "level", "name", "projectId") SELECT "courseId", "formationId", "icon", "id", "level", "name", "projectId" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
