CREATE TABLE "EnergyBillDataPoint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplyType" TEXT NOT NULL,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "consumptionKwh" DOUBLE PRECISION,
    "consumptionM3" DOUBLE PRECISION,
    "billingDays" INTEGER,
    "monthlyAmountEur" DOUBLE PRECISION,
    "zipCode" TEXT,
    "distributorName" TEXT,
    "billingYear" INTEGER,
    "billingMonth" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'calculator_import',
    CONSTRAINT "EnergyBillDataPoint_pkey" PRIMARY KEY ("id")
);
