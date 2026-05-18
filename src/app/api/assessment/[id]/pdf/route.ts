import { buildAssessmentPdfResponse } from '@/lib/assessment-pdf-response';
import type { UtilityBillData } from '@/lib/domain/energy-assessment';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return buildAssessmentPdfResponse(req, params.id);
}

// POST allows the client to include session utility bills (from the calculator)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const utilityBills: UtilityBillData[] | undefined = Array.isArray(body.utilityBills)
    ? (body.utilityBills as UtilityBillData[])
    : undefined;
  return buildAssessmentPdfResponse(req, params.id, { utilityBills });
}
