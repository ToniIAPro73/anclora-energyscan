import { getDemoAssessmentPayload } from '@/lib/demo-assets';
import { createStatelessAssessmentId, createStatelessPayload } from '@/lib/stateless-assessment';
import { buildAssessmentPdfResponse } from '@/lib/assessment-pdf-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get('lang') ?? new URL(req.url).searchParams.get('locale') ?? undefined;
  const demo = getDemoAssessmentPayload(locale);
  const payload = createStatelessPayload(demo.propertyData, {
    isDemo: demo.isDemo,
    attachments: demo.attachments,
    publicRef: demo.publicRef,
  });
  const demoId = createStatelessAssessmentId(payload);

  return buildAssessmentPdfResponse(req, demoId, { allowDemoPremium: true });
}
