-- AddForeignKey
ALTER TABLE "UserFavorites" ADD CONSTRAINT "UserFavorites_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
