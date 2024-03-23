/*
  Warnings:

  - You are about to drop the `_SkillToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SkillToUser" DROP CONSTRAINT "_SkillToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SkillToUser" DROP CONSTRAINT "_SkillToUser_B_fkey";

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_SkillToUser";

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
