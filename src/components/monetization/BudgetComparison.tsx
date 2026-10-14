'use client';

import { FormEvent, useState } from 'react';
import { usePreferences } from '@/components/AppPreferencesProvider';

type Line = { description: string; quantity?: number; unit?: string; unitPrice?: number; total?: number };
type Match = { left: Line; right: Line; category: string; unit: string; quantity: string; scope: 'UNKNOWN'; vat: 'UNKNOWN'; structure: string; priceStatus: 'NO_REFERENCE' };
type Result = { matches: Match[]; unmatchedLeft: { line: Line }[]; unmatchedRight: { line: Line }[]; priceComparisonAvailable: false };

export const budgetComparisonCopy = {
  es: { title: 'Comparar dos presupuestos', left: 'Presupuesto A', right: 'Presupuesto B', placeholder: 'Pega aquí las partidas del presupuesto…', submit: 'Comparar estructura', loading: 'Comparando…', failed: 'No se pudo comparar. Revisa que ambos textos incluyan partidas.', disclaimer: 'La comparación es estructural. El alcance y el IVA son desconocidos. No se evalúan precios ni se recomienda una oferta.', match: 'Partidas emparejadas', onlyLeft: 'Solo en A', onlyRight: 'Solo en B', category: 'Categoría', unit: 'Unidad', quantity: 'Cantidad', scope: 'Alcance: desconocido', vat: 'IVA: desconocido', noPrice: 'Sin referencia comparable', amount: 'Importe indicado', empty: 'No se detectaron partidas.' },
  ca: { title: 'Comparar dos pressupostos', left: 'Pressupost A', right: 'Pressupost B', placeholder: 'Enganxa aquí les partides del pressupost…', submit: 'Comparar l’estructura', loading: 'Comparant…', failed: 'No s’han pogut comparar. Revisa que tots dos textos incloguin partides.', disclaimer: 'La comparació és estructural. L’abast i l’IVA són desconeguts. No s’avaluen preus ni es recomana cap oferta.', match: 'Partides aparellades', onlyLeft: 'Només a A', onlyRight: 'Només a B', category: 'Categoria', unit: 'Unitat', quantity: 'Quantitat', scope: 'Abast: desconegut', vat: 'IVA: desconegut', noPrice: 'Sense referència comparable', amount: 'Import indicat', empty: 'No s’han detectat partides.' },
  en: { title: 'Compare two budgets', left: 'Budget A', right: 'Budget B', placeholder: 'Paste budget line items here…', submit: 'Compare structure', loading: 'Comparing…', failed: 'Comparison failed. Check that both texts contain line items.', disclaimer: 'This is a structural comparison. Scope and VAT are unknown. Prices are not evaluated and no offer is recommended.', match: 'Matched line items', onlyLeft: 'Only in A', onlyRight: 'Only in B', category: 'Category', unit: 'Unit', quantity: 'Quantity', scope: 'Scope: unknown', vat: 'VAT: unknown', noPrice: 'No comparable reference', amount: 'Reported amount', empty: 'No line items detected.' },
  de: { title: 'Zwei Angebote vergleichen', left: 'Angebot A', right: 'Angebot B', placeholder: 'Angebotspositionen hier einfügen…', submit: 'Struktur vergleichen', loading: 'Vergleich läuft…', failed: 'Vergleich nicht möglich. Beide Texte müssen Positionen enthalten.', disclaimer: 'Der Vergleich betrifft die Struktur. Leistungsumfang und Mehrwertsteuer sind unbekannt. Preise werden nicht bewertet und kein Angebot wird empfohlen.', match: 'Zugeordnete Positionen', onlyLeft: 'Nur in A', onlyRight: 'Nur in B', category: 'Kategorie', unit: 'Einheit', quantity: 'Menge', scope: 'Leistungsumfang: unbekannt', vat: 'MwSt.: unbekannt', noPrice: 'Keine vergleichbare Referenz', amount: 'Angegebener Betrag', empty: 'Keine Positionen erkannt.' },
  fr: { title: 'Comparer deux devis', left: 'Devis A', right: 'Devis B', placeholder: 'Collez les postes du devis ici…', submit: 'Comparer la structure', loading: 'Comparaison…', failed: 'Comparaison impossible. Vérifiez que les deux textes contiennent des postes.', disclaimer: 'La comparaison porte sur la structure. Le périmètre et la TVA sont inconnus. Les prix ne sont pas évalués et aucune offre n’est recommandée.', match: 'Postes associés', onlyLeft: 'Uniquement dans A', onlyRight: 'Uniquement dans B', category: 'Catégorie', unit: 'Unité', quantity: 'Quantité', scope: 'Périmètre : inconnu', vat: 'TVA : inconnue', noPrice: 'Aucune référence comparable', amount: 'Montant indiqué', empty: 'Aucun poste détecté.' },
  it: { title: 'Confronta due preventivi', left: 'Preventivo A', right: 'Preventivo B', placeholder: 'Incolla qui le voci del preventivo…', submit: 'Confronta la struttura', loading: 'Confronto…', failed: 'Confronto non riuscito. Verifica che entrambi i testi contengano voci.', disclaimer: 'Il confronto riguarda la struttura. Ambito e IVA sono sconosciuti. I prezzi non vengono valutati e non viene consigliata alcuna offerta.', match: 'Voci abbinate', onlyLeft: 'Solo in A', onlyRight: 'Solo in B', category: 'Categoria', unit: 'Unità', quantity: 'Quantità', scope: 'Ambito: sconosciuto', vat: 'IVA: sconosciuta', noPrice: 'Nessun riferimento comparabile', amount: 'Importo indicato', empty: 'Nessuna voce rilevata.' },
  pt: { title: 'Comparar dois orçamentos', left: 'Orçamento A', right: 'Orçamento B', placeholder: 'Cole aqui os itens do orçamento…', submit: 'Comparar estrutura', loading: 'A comparar…', failed: 'Não foi possível comparar. Confirme que ambos os textos incluem itens.', disclaimer: 'A comparação é estrutural. O âmbito e o IVA são desconhecidos. Os preços não são avaliados e nenhuma proposta é recomendada.', match: 'Itens associados', onlyLeft: 'Apenas em A', onlyRight: 'Apenas em B', category: 'Categoria', unit: 'Unidade', quantity: 'Quantidade', scope: 'Âmbito: desconhecido', vat: 'IVA: desconhecido', noPrice: 'Sem referência comparável', amount: 'Valor indicado', empty: 'Não foram detetados itens.' },
} as const;

export function dimension(value: string, lang: keyof typeof budgetComparisonCopy): string {
  const map: Record<string, Record<string, string>> = {
    MATCH: { es: 'Coincide', ca: 'Coincideix', en: 'Match', de: 'Übereinstimmung', fr: 'Correspond', it: 'Corrisponde', pt: 'Corresponde' },
    MISMATCH: { es: 'No coincide', ca: 'No coincideix', en: 'Mismatch', de: 'Abweichung', fr: 'Diffère', it: 'Non corrisponde', pt: 'Não corresponde' },
    UNKNOWN: { es: 'Desconocido', ca: 'Desconegut', en: 'Unknown', de: 'Unbekannt', fr: 'Inconnu', it: 'Sconosciuto', pt: 'Desconhecido' },
  };
  return map[value]?.[lang] ?? value;
}

export function BudgetComparison() {
  const { selectedLanguage } = usePreferences();
  const lang = selectedLanguage as keyof typeof budgetComparisonCopy;
  const t = budgetComparisonCopy[lang] ?? budgetComparisonCopy.en;
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(''); setResult(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/budget-review/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ leftText: form.get('leftText'), rightText: form.get('rightText') }) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error();
      setResult(payload.result);
    } catch { setError(t.failed); } finally { setLoading(false); }
  }

  const lineAmount = (line: Line) => line.total == null ? '—' : new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(line.total);
  return <section className="surface mt-8 rounded-3xl border p-6 lg:p-8">
    <h2 className="font-heading text-xl font-bold">{t.title}</h2>
    <p className="mt-2 text-sm text-muted">{t.disclaimer}</p>
    <form onSubmit={compare} className="mt-5 grid gap-4 md:grid-cols-2">
      {[['leftText', t.left], ['rightText', t.right]].map(([name, label]) => <label key={name} className="block text-sm font-semibold">{label}<textarea required minLength={20} maxLength={80000} name={name} rows={8} placeholder={t.placeholder} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-normal" /></label>)}
      <div className="md:col-span-2"><button disabled={loading} className="rounded-full bg-[#00DC82] px-6 py-3 font-bold text-[#07140f] disabled:opacity-60">{loading ? t.loading : t.submit}</button></div>
    </form>
    {error && <p role="alert" className="mt-4 text-sm text-[#EF4444]">{error}</p>}
    {result && <div className="mt-6 space-y-5" aria-live="polite">
      <div><h3 className="font-semibold">{t.match}</h3>{result.matches.length === 0 && <p className="mt-2 text-sm text-muted">{t.empty}</p>}
        <div className="mt-2 space-y-3">{result.matches.map((item, index) => <article key={index} className="rounded-2xl border border-white/10 p-4 text-sm">
          <p className="font-medium">{item.left.description}</p>
          <div className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2"><span>{t.left}: {lineAmount(item.left)}</span><span>{t.right}: {lineAmount(item.right)}</span><span>{t.category}: {dimension(item.category, lang)}</span><span>{t.unit}: {dimension(item.unit, lang)}</span><span>{t.quantity}: {dimension(item.quantity, lang)}</span><span>{t.scope}; {t.vat}</span></div>
          <p className="mt-2 text-xs text-amber-400">{t.noPrice}</p>
        </article>)}</div>
      </div>
      {[[t.onlyLeft, result.unmatchedLeft], [t.onlyRight, result.unmatchedRight]].map(([label, lines]) => <div key={label as string}><h3 className="font-semibold">{label as string}</h3>{(lines as { line: Line }[]).length === 0 ? <p className="mt-1 text-sm text-muted">—</p> : <ul className="mt-2 space-y-1 text-sm">{(lines as { line: Line }[]).map(({ line }, index) => <li key={index} className="flex justify-between gap-4"><span>{line.description}</span><span className="shrink-0 text-muted">{lineAmount(line)} · {t.noPrice}</span></li>)}</ul>}</div>)}
    </div>}
  </section>;
}
