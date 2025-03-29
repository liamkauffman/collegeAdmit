-- CreateTable
CREATE TABLE "UserFavorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavorites_userId_idx" ON "UserFavorites"("userId");

-- CreateIndex
CREATE INDEX "UserFavorites_collegeId_idx" ON "UserFavorites"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorites_userId_collegeId_key" ON "UserFavorites"("userId", "collegeId");

-- AddForeignKey
ALTER TABLE "UserFavorites" ADD CONSTRAINT "UserFavorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
