-- CreateTable
CREATE TABLE "CollegeComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colleges" TEXT[],
    "categories" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollegeComparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeComparison_userId_idx" ON "CollegeComparison"("userId");

-- AddForeignKey
ALTER TABLE "CollegeComparison" ADD CONSTRAINT "CollegeComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
