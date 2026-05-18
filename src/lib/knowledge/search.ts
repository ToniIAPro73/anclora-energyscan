import { prisma } from '@/lib/prisma';
import type { KnowledgeCategory } from './constants';

export interface KnowledgeSearchParams {
  category?: KnowledgeCategory | KnowledgeCategory[];
  region?: string;       // CCAA code; null matches national entries
  keywords?: string[];   // matched against title + content + tags
  includeNational?: boolean; // when region is set, also include region=null entries
  limit?: number;
}

export async function searchKnowledge(params: KnowledgeSearchParams = {}) {
  const { category, region, keywords, includeNational = true, limit = 20 } = params;
  const now = new Date();

  const categories = category
    ? Array.isArray(category) ? category : [category]
    : undefined;

  const entries = await prisma.knowledgeEntry.findMany({
    where: {
      active: true,
      ...(categories ? { category: { in: categories } } : {}),
      ...(region
        ? {
            OR: [
              { region },
              ...(includeNational ? [{ region: null }] : []),
            ],
          }
        : {}),
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    },
    orderBy: [
      { region: 'asc' }, // regional before national when both included
      { updatedAt: 'desc' },
    ],
    take: limit,
    select: {
      id: true,
      category: true,
      region: true,
      title: true,
      content: true,
      tags: true,
      validFrom: true,
      validUntil: true,
      sourceUrl: true,
      sourceLabel: true,
      updatedAt: true,
    },
  });

  if (!keywords?.length) return entries;

  // Client-side keyword filter (simple, no embeddings needed at this volume)
  const lower = keywords.map((k) => k.toLowerCase());
  return entries.filter((e) => {
    const haystack = `${e.title} ${e.content} ${e.tags ?? ''}`.toLowerCase();
    return lower.some((kw) => haystack.includes(kw));
  });
}

export type KnowledgeSearchResult = Awaited<ReturnType<typeof searchKnowledge>>[number];
