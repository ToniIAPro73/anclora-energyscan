const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Higher score = higher priority for vision analysis
const CATEGORY_PRIORITY: Record<string, number> = {
  windows: 10,
  facade: 10,
  exterior: 10,
  EXTERIOR: 10,
  roof: 9,
  heating: 9,
  solar: 8,
  humidity: 8,
  interior: 5,
  INTERIOR: 5,
  room: 5,
  general: 3,
  decorative: 1,
  unknown: 1,
  other: 1,
};

function categoryPriority(category: string | null | undefined): number {
  if (!category) return 2;
  return CATEGORY_PRIORITY[category] ?? 2;
}

export interface AttachmentLike {
  id: string;
  type: string;
  category?: string | null;
  analysis?: { status: string } | null;
}

export function selectImagesForVisionAnalysis(input: {
  attachments: AttachmentLike[];
  maxImages: number;
  force?: boolean;
}): AttachmentLike[] {
  const { attachments, maxImages, force = false } = input;

  if (maxImages <= 0) return [];

  const candidates = attachments.filter((a) => {
    if (!IMAGE_MIME_TYPES.has(a.type)) return false;
    if (!force && a.analysis?.status === 'DONE') return false;
    return true;
  });

  // Sort by category priority descending
  const sorted = [...candidates].sort(
    (a, b) => categoryPriority(b.category) - categoryPriority(a.category),
  );

  return sorted.slice(0, maxImages);
}
