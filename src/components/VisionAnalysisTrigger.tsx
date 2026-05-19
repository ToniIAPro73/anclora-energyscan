'use client';

import { useEffect } from 'react';

interface Props {
  assessmentId: string;
  language?: string;
}

export function VisionAnalysisTrigger({ assessmentId, language }: Props) {
  useEffect(() => {
    // Fire-and-forget: trigger vision analysis for unprocessed image attachments.
    // The PDF premium will pick up the results if ready; failure here is non-blocking.
    fetch(`/api/assessment/${assessmentId}/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: language ?? 'es' }),
    }).catch(() => {/* non-blocking */});
  }, [assessmentId, language]);

  return null;
}
