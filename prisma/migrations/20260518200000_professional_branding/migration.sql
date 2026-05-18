-- CreateTable
CREATE TABLE "ProfessionalBranding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "brandName" TEXT,
    "brandLogoUrl" TEXT,
    "brandContactEmail" TEXT,
    "addonActive" BOOLEAN NOT NULL DEFAULT false,
    "interestedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "ProfessionalBranding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalBranding_userId_key" ON "ProfessionalBranding"("userId");
