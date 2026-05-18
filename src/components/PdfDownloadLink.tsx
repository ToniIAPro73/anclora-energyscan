'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { usePreferences } from './AppPreferencesProvider';
import type { SerializableBill } from '@/components/monetization/BillImporter';

function readSessionBills(): SerializableBill[] {
  try {
    const raw = sessionStorage.getItem('enerscan_bills');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PdfDownloadLink({ assessmentId, label }: { assessmentId: string; label?: string }) {
  const { language, currency, measurementSystem, dictionary: t } = usePreferences();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const utilityBills = readSessionBills();
      const params = new URLSearchParams({ lang: language, currency, units: measurementSystem });
      const url = `/api/assessment/${assessmentId}/pdf?${params.toString()}`;

      let response: Response;
      if (utilityBills.length > 0) {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utilityBills }),
        });
      } else {
        response = await fetch(url);
      }

      if (!response.ok) throw new Error('pdf_error');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Derive filename from Content-Disposition header or fallback
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `energyscan-informe-${assessmentId.slice(0, 8)}.pdf`;

      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#00DC82] px-8 py-4 font-heading font-bold text-[#0A0A0A] shadow-xl shadow-[#00DC82]/20 transition hover:brightness-110 disabled:opacity-70"
    >
      {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
      {label || t.downloadPdf}
    </button>
  );
}
