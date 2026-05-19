-- DropIndex
DROP INDEX "KnowledgeEntry_category_region_active_idx";

-- CreateTable
CREATE TABLE "AttachmentAnalysis" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "imageType" TEXT,
    "detectedJson" JSONB,
    "confidence" TEXT,
    "reportSummary" TEXT,
    "warnings" JSONB,
    "errorMessage" TEXT,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttachmentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentAnalysis_attachmentId_key" ON "AttachmentAnalysis"("attachmentId");

-- AddForeignKey
ALTER TABLE "AttachmentAnalysis" ADD CONSTRAINT "AttachmentAnalysis_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "AssessmentAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
