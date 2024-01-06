-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "projectId" TEXT,
    CONSTRAINT "Skill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("category", "id", "level", "name") SELECT "category", "id", "level", "name" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
