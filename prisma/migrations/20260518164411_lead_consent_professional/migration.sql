-- Lead: professional consent fields
ALTER TABLE "Lead" ADD COLUMN "consentObtainedBy"    TEXT;
ALTER TABLE "Lead" ADD COLUMN "consentMethod"         TEXT;
ALTER TABLE "Lead" ADD COLUMN "consentObtainedAt"     TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "consentText"           TEXT;
ALTER TABLE "Lead" ADD COLUMN "consentWithdrawToken"  TEXT;
ALTER TABLE "Lead" ADD COLUMN "clientEmail"           TEXT;
ALTER TABLE "Lead" ADD COLUMN "clientName"            TEXT;
ALTER TABLE "Lead" ADD COLUMN "clientPhone"           TEXT;

CREATE UNIQUE INDEX "Lead_consentWithdrawToken_key" ON "Lead"("consentWithdrawToken");
