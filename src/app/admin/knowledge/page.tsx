'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, EyeOff, RotateCcw, BookOpen } from 'lucide-react';
import { KnowledgeEntryForm, type KnowledgeEntry as Entry } from '@/components/admin/KnowledgeEntryForm';
import { KNOWLEDGE_CATEGORIES, SPAIN_REGIONS } from '@/lib/knowledge/constants';
import { usePreferences } from '@/components/AppPreferencesProvider';

// --- i18n inline (same pattern as other admin pages) ---
const headings = {
  es: {
    title: 'Base de conocimiento',
    subtitle: 'Entradas utilizadas por el analizador de presupuestos y el asistente IA',
    newEntry: 'Nueva entrada',
    back: 'Volver a métricas',
    filterAll: 'Todas las categorías',
    filterAllRegions: 'Todas las regiones',
    filterNational: 'Nacional',
    filterActive: 'Solo activas',
    filterInactive: 'Solo inactivas',
    filterBoth: 'Activas e inactivas',
    colCategory: 'Categoría',
    colRegion: 'Alcance',
    colTitle: 'Título',
    colUpdated: 'Actualizado',
    colStatus: 'Estado',
    colActions: 'Acciones',
    national: 'Nacional',
    activeLabel: 'Activa',
    inactiveLabel: 'Inactiva',
    editBtn: 'Editar',
    deactivateBtn: 'Desactivar',
    reactivateBtn: 'Reactivar',
    noEntries: 'No hay entradas que coincidan con los filtros.',
    loading: 'Cargando…',
    errorLoad: 'Error al cargar entradas.',
    forbidden: 'Acceso no autorizado',
    forbiddenCopy: 'Solo los administradores pueden acceder a esta sección.',
    formCreate: 'Nueva entrada de conocimiento',
    formEdit: 'Editar entrada',
    title_f: 'Título',
    category: 'Categoría',
    region: 'Comunidad Autónoma',
    regionNational: '— Nacional (todas las regiones) —',
    content: 'Contenido',
    tags: 'Palabras clave',
    tagsHint: 'aerotermia, subvención, IDAE… (separadas por coma)',
    validFrom: 'Válido desde',
    validUntil: 'Válido hasta',
    sourceUrl: 'URL de la fuente',
    sourceLabel: 'Etiqueta de la fuente',
    active: 'Entrada activa (visible para el sistema)',
    save: 'Guardar',
    saving: 'Guardando…',
    cancel: 'Cancelar',
    errorSave: 'Error al guardar. Inténtalo de nuevo.',
    categories: {
      regulation: 'Normativa',
      subsidy: 'Subvención',
      price_reference: 'Precio de referencia',
      faq: 'FAQ',
      other: 'Otro',
    },
  },
  en: {
    title: 'Knowledge Base',
    subtitle: 'Entries used by the budget analyzer and AI assistant',
    newEntry: 'New entry',
    back: 'Back to metrics',
    filterAll: 'All categories',
    filterAllRegions: 'All regions',
    filterNational: 'National',
    filterActive: 'Active only',
    filterInactive: 'Inactive only',
    filterBoth: 'Active and inactive',
    colCategory: 'Category',
    colRegion: 'Scope',
    colTitle: 'Title',
    colUpdated: 'Updated',
    colStatus: 'Status',
    colActions: 'Actions',
    national: 'National',
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    editBtn: 'Edit',
    deactivateBtn: 'Deactivate',
    reactivateBtn: 'Reactivate',
    noEntries: 'No entries match the filters.',
    loading: 'Loading…',
    errorLoad: 'Error loading entries.',
    forbidden: 'Unauthorized access',
    forbiddenCopy: 'Only administrators can access this section.',
    formCreate: 'New knowledge entry',
    formEdit: 'Edit entry',
    title_f: 'Title',
    category: 'Category',
    region: 'Autonomous Community',
    regionNational: '— National (all regions) —',
    content: 'Content',
    tags: 'Keywords',
    tagsHint: 'heat pump, subsidy, IDAE… (comma-separated)',
    validFrom: 'Valid from',
    validUntil: 'Valid until',
    sourceUrl: 'Source URL',
    sourceLabel: 'Source label',
    active: 'Entry active (visible to the system)',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    errorSave: 'Error saving. Please try again.',
    categories: {
      regulation: 'Regulation',
      subsidy: 'Subsidy',
      price_reference: 'Price reference',
      faq: 'FAQ',
      other: 'Other',
    },
  },
  de: {
    title: 'Wissensdatenbank',
    subtitle: 'Eintraege fuer den Budgetanalysator und den KI-Assistenten',
    newEntry: 'Neuer Eintrag',
    back: 'Zurueck zu Metriken',
    filterAll: 'Alle Kategorien',
    filterAllRegions: 'Alle Regionen',
    filterNational: 'National',
    filterActive: 'Nur aktive',
    filterInactive: 'Nur inaktive',
    filterBoth: 'Aktive und inaktive',
    colCategory: 'Kategorie',
    colRegion: 'Geltungsbereich',
    colTitle: 'Titel',
    colUpdated: 'Aktualisiert',
    colStatus: 'Status',
    colActions: 'Aktionen',
    national: 'National',
    activeLabel: 'Aktiv',
    inactiveLabel: 'Inaktiv',
    editBtn: 'Bearbeiten',
    deactivateBtn: 'Deaktivieren',
    reactivateBtn: 'Reaktivieren',
    noEntries: 'Keine Eintraege entsprechen den Filtern.',
    loading: 'Laedt…',
    errorLoad: 'Fehler beim Laden der Eintraege.',
    forbidden: 'Kein Zugriff',
    forbiddenCopy: 'Nur Administratoren können auf diesen Bereich zugreifen.',
    formCreate: 'Neuer Wissenseintrag',
    formEdit: 'Eintrag bearbeiten',
    title_f: 'Titel',
    category: 'Kategorie',
    region: 'Autonome Gemeinschaft',
    regionNational: '— National (alle Regionen) —',
    content: 'Inhalt',
    tags: 'Schluesselwoerter',
    tagsHint: 'Waermepumpe, Foerderung, IDAE… (durch Komma getrennt)',
    validFrom: 'Gueltig ab',
    validUntil: 'Gueltig bis',
    sourceUrl: 'Quell-URL',
    sourceLabel: 'Quellenbezeichnung',
    active: 'Eintrag aktiv (sichtbar fuer das System)',
    save: 'Speichern',
    saving: 'Speichert…',
    cancel: 'Abbrechen',
    errorSave: 'Fehler beim Speichern. Bitte versuchen Sie es erneut.',
    categories: {
      regulation: 'Vorschrift',
      subsidy: 'Foerderung',
      price_reference: 'Preisreferenz',
      faq: 'FAQ',
      other: 'Sonstiges',
    },
  },
};

const categoryColors: Record<string, string> = {
  regulation:      'bg-blue-500/20 text-blue-400',
  subsidy:         'bg-[#00DC82]/20 text-[#00DC82]',
  price_reference: 'bg-[#FFB020]/20 text-[#FFB020]',
  faq:             'bg-purple-500/20 text-purple-400',
  other:           'bg-white/10 text-muted',
};

function getRegionLabel(code: string | null, lang: 'es' | 'en' | 'de', national: string) {
  if (!code) return national;
  const r = SPAIN_REGIONS.find((x) => x.code === code);
  if (!r) return code;
  return lang === 'en' ? r.en : lang === 'de' ? r.de : r.es;
}

export default function KnowledgePage() {
  const { language: lang } = usePreferences();
  const t = headings[lang] || headings.es;
  const locale = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'es-ES';

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterActive, setFilterActive] = useState('true');

  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | undefined>(undefined);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterRegion === 'national') params.set('region', 'national');
      else if (filterRegion) params.set('region', filterRegion);
      if (filterActive !== 'all') params.set('active', filterActive);
      const res = await fetch(`/api/admin/knowledge?${params}`);
      if (res.status === 403) { setForbidden(true); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries(data.entries);
    } catch {
      setLoadError(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filterCategory, filterRegion, filterActive]);

  async function toggleActive(entry: Entry) {
    const res = await fetch(`/api/admin/knowledge/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !entry.active }),
    });
    if (res.ok) {
      setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, active: !entry.active } : e));
    }
  }

  function openCreate() { setEditEntry(undefined); setFormOpen(true); }
  function openEdit(entry: Entry) { setEditEntry(entry); setFormOpen(true); }

  function handleSaved(saved: Entry) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setFormOpen(false);
  }

  const formLabels = {
    formCreate: t.formCreate,
    formEdit: t.formEdit,
    title: t.title_f,
    category: t.category,
    region: t.region,
    regionNational: t.regionNational,
    content: t.content,
    tags: t.tags,
    tagsHint: t.tagsHint,
    validFrom: t.validFrom,
    validUntil: t.validUntil,
    sourceUrl: t.sourceUrl,
    sourceLabel: t.sourceLabel,
    active: t.active,
    save: t.save,
    saving: t.saving,
    cancel: t.cancel,
    errorSave: t.errorSave,
    categories: t.categories,
  };

  if (forbidden) {
    return (
      <div className="min-h-screen app-shell flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold text-premium">{t.forbidden}</h1>
          <p className="mt-3 text-muted">{t.forbiddenCopy}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin/metrics" className="text-xs text-[#00DC82] hover:underline">← {t.back}</Link>
            <h1 className="mt-2 font-heading text-3xl font-bold text-premium flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-[#00DC82]" />
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#00DC82] px-5 py-2.5 font-heading text-sm font-bold text-[#07140f]"
          >
            <Plus className="h-4 w-4" />
            {t.newEntry}
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-premium"
          >
            <option value="">{t.filterAll}</option>
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t.categories[c]}</option>
            ))}
          </select>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-premium"
          >
            <option value="">{t.filterAllRegions}</option>
            <option value="national">{t.filterNational}</option>
            {SPAIN_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{getRegionLabel(r.code, lang, t.national)}</option>
            ))}
          </select>

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-premium"
          >
            <option value="true">{t.filterActive}</option>
            <option value="false">{t.filterInactive}</option>
            <option value="all">{t.filterBoth}</option>
          </select>

          <span className="flex items-center text-xs text-muted">
            {loading ? t.loading : `${entries.length}`}
          </span>
        </div>

        {/* Error */}
        {loadError && <p className="mt-4 text-sm text-[#EF4444]">{loadError}</p>}

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs text-muted">
                <th className="px-4 py-3 text-left">{t.colCategory}</th>
                <th className="px-4 py-3 text-left">{t.colRegion}</th>
                <th className="px-4 py-3 text-left">{t.colTitle}</th>
                <th className="px-4 py-3 text-left">{t.colUpdated}</th>
                <th className="px-4 py-3 text-left">{t.colStatus}</th>
                <th className="px-4 py-3 text-left">{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">{t.noEntries}</td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryColors[entry.category] ?? 'bg-white/10 text-muted'}`}>
                      {(t.categories as Record<string, string>)[entry.category] ?? entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {getRegionLabel(entry.region, lang, t.national)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-premium line-clamp-1">{entry.title}</p>
                    {entry.tags && (
                      <p className="mt-0.5 text-xs text-muted line-clamp-1">{entry.tags}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString(locale) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${entry.active ? 'bg-[#00DC82]/20 text-[#00DC82]' : 'bg-white/10 text-muted'}`}>
                      {entry.active ? t.activeLabel : t.inactiveLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(entry)}
                        title={t.editBtn}
                        className="rounded-lg border border-white/10 p-1.5 text-muted hover:text-premium"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(entry)}
                        title={entry.active ? t.deactivateBtn : t.reactivateBtn}
                        className="rounded-lg border border-white/10 p-1.5 text-muted hover:text-premium"
                      >
                        {entry.active ? <EyeOff className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {formOpen && (
        <KnowledgeEntryForm
          entry={editEntry}
          labels={formLabels}
          onSaved={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
