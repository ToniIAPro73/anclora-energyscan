'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function DeleteAssessmentButton({ assessmentId, language, label, errorLabel }: {
  assessmentId: string;
  language: 'es' | 'en' | 'de';
  label: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function deleteAssessment() {
    const confirmation = language === 'en'
      ? 'Delete this assessment and all its files and extracted data? This cannot be undone.'
      : language === 'de'
        ? 'Diese Bewertung mit allen Dateien und extrahierten Daten löschen? Dies kann nicht rückgängig gemacht werden.'
        : '¿Eliminar esta valoración con sus archivos y datos derivados? No se puede deshacer.';
    if (!window.confirm(confirmation)) return;

    setPending(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('deletion failed');
      router.replace('/');
      router.refresh();
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={deleteAssessment}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-muted hover:border-[#EF4444]/50 hover:text-[#EF4444] disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        {pending ? '…' : label}
      </button>
      {failed && <p role="alert" className="text-sm text-[#EF4444]">{errorLabel}</p>}
    </div>
  );
}
