-- CreateTable
CREATE TABLE "CollegeTopMajor" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeTopMajor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeAdditionalInfo" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "rankings" JSONB,
    "sizeInfo" JSONB,
    "internationalStudentPercent" DOUBLE PRECISION,
    "qualityOfLife" JSONB,
    "employmentOutcomes" JSONB,
    "graduateSchoolOutcomes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeAdditionalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeTopMajor_collegeId_idx" ON "CollegeTopMajor"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "CollegeAdditionalInfo_collegeId_key" ON "CollegeAdditionalInfo"("collegeId");

-- AddForeignKey
ALTER TABLE "CollegeTopMajor" ADD CONSTRAINT "CollegeTopMajor_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeAdditionalInfo" ADD CONSTRAINT "CollegeAdditionalInfo_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
