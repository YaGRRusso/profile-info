-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FormationToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FormationToSkill_AB_unique" ON "_FormationToSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_FormationToSkill_B_index" ON "_FormationToSkill"("B");

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormationToSkill" ADD CONSTRAINT "_FormationToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormationToSkill" ADD CONSTRAINT "_FormationToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
