/*
  Warnings:

  - You are about to drop the column `projectId` on the `Skill` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SkillsOnProject" (
    "skillId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    PRIMARY KEY ("skillId", "projectId"),
    CONSTRAINT "SkillsOnProject_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SkillsOnProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProjectToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL
);
INSERT INTO "new_Skill" ("category", "id", "level", "name") SELECT "category", "id", "level", "name" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToSkill_AB_unique" ON "_ProjectToSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToSkill_B_index" ON "_ProjectToSkill"("B");
