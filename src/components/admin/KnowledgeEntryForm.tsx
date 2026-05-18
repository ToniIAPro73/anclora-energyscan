'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { KNOWLEDGE_CATEGORIES, SPAIN_REGIONS } from '@/lib/knowledge/constants';

export type KnowledgeEntry = {
  id: string;
  category: string;
  region: string | null;
  title: string;
  content: string;
  tags: string | null;
  validFrom: string | null;
  validUntil: string | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  active: boolean;
  updatedAt?: string;
  createdBy?: string | null;
};

type Labels = {
  formCreate: string;
  formEdit: string;
  title: string;
  category: string;
  region: string;
  regionNational: string;
  content: string;
  tags: string;
  tagsHint: string;
  validFrom: string;
  validUntil: string;
  sourceUrl: string;
  sourceLabel: string;
  active: string;
  save: string;
  saving: string;
  cancel: string;
  errorSave: string;
  categories: Record<string, string>;
};

interface Props {
  entry?: KnowledgeEntry;
  labels: Labels;
  onSaved: (entry: KnowledgeEntry) => void;
  onCancel: () => void;
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-premium placeholder:text-muted focus:border-[#00DC82]/50 focus:outline-none';
const labelCls = 'block text-xs font-bold text-muted mb-1';

export function KnowledgeEntryForm({ entry, labels, onSaved, onCancel }: Props) {
  const isNew = !entry;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: entry?.title ?? '',
    category: entry?.category ?? 'regulation',
    region: entry?.region ?? '',
    content: entry?.content ?? '',
    tags: entry?.tags ?? '',
    validFrom: entry?.validFrom ? entry.validFrom.slice(0, 10) : '',
    validUntil: entry?.validUntil ? entry.validUntil.slice(0, 10) : '',
    sourceUrl: entry?.sourceUrl ?? '',
    sourceLabel: entry?.sourceLabel ?? '',
    active: entry?.active ?? true,
  });

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      title: form.title,
      category: form.category,
      region: form.region || null,
      content: form.content,
      tags: form.tags || null,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      sourceUrl: form.sourceUrl || null,
      sourceLabel: form.sourceLabel || null,
      active: form.active,
    };

    try {
      const url = isNew ? '/api/admin/knowledge' : `/api/admin/knowledge/${entry.id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || labels.errorSave);
      onSaved(data.entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.errorSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0A1F14] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-premium">
            {isNew ? labels.formCreate : labels.formEdit}
          </h2>
          <button type="button" onClick={onCancel} className="rounded-full border border-white/10 p-2 text-muted hover:text-premium">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelCls}>{labels.title} *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} className={inputCls} />
          </div>

          {/* Category + Region */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{labels.category} *</label>
              <select required value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {KNOWLEDGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{labels.categories[c] ?? c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{labels.region}</label>
              <select value={form.region} onChange={(e) => set('region', e.target.value)} className={inputCls}>
                <option value="">{labels.regionNational}</option>
                {SPAIN_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>{r.es}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className={labelCls}>{labels.content} *</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              maxLength={8000}
              rows={8}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
            />
            <p className="mt-1 text-right text-xs text-muted">{form.content.length}/8000</p>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>{labels.tags}</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} maxLength={500} placeholder={labels.tagsHint} className={inputCls} />
          </div>

          {/* Validity dates */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{labels.validFrom}</label>
              <input type="date" value={form.validFrom} onChange={(e) => set('validFrom', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{labels.validUntil}</label>
              <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Source */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{labels.sourceUrl}</label>
              <input type="url" value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} maxLength={500} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{labels.sourceLabel}</label>
              <input value={form.sourceLabel} onChange={(e) => set('sourceLabel', e.target.value)} maxLength={200} className={inputCls} />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-[#00DC82]" />
            <span className="text-sm text-premium">{labels.active}</span>
          </label>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[#00DC82] py-2.5 text-sm font-bold text-[#07140f] disabled:opacity-60">
              {saving ? labels.saving : labels.save}
            </button>
            <button type="button" onClick={onCancel} className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-muted">
              {labels.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
