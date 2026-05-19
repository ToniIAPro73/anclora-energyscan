import { getVisionAnalysisConfig, VisionAnalysisConfig } from './vision-config';

export type VisionEntitlementLevel = 'none' | 'free_test' | 'premium' | 'pro' | 'b2b';

export interface VisionEntitlementResult {
  allowed: boolean;
  level: VisionEntitlementLevel;
  maxImages: number;
  reason: string;
}

interface AssessmentInput {
  paidAt?: Date | string | null;
  isPremium?: boolean | null;
  isDemo?: boolean | null;
}

interface UserInput {
  // Future Pro/B2B: add plan/role here when available in User model
  role?: string | null;
  plan?: string | null;
}

export function resolveVisionEntitlement(input: {
  assessment: AssessmentInput;
  user?: UserInput;
  config?: VisionAnalysisConfig;
}): VisionEntitlementResult {
  const config = input.config ?? getVisionAnalysisConfig();

  if (!config.enabled) {
    return { allowed: false, level: 'none', maxImages: 0, reason: 'vision_disabled' };
  }

  // Free test flag — only for internal testing, never exposed as a user-facing plan
  if (config.freeEnabled) {
    return { allowed: true, level: 'free_test', maxImages: 1, reason: 'free_test_enabled' };
  }

  // Pro / B2B check — prepared for when User model gains plan/role fields
  const userRole = input.user?.role?.toLowerCase() ?? '';
  const userPlan = input.user?.plan?.toLowerCase() ?? '';
  const isProOrB2b =
    userRole === 'pro' || userRole === 'b2b' || userRole === 'provider' ||
    userPlan === 'pro' || userPlan === 'b2b' || userPlan === 'professional';

  if (isProOrB2b) {
    return { allowed: true, level: 'pro', maxImages: config.maxImagesPro, reason: 'pro_user' };
  }

  // Premium assessment: paidAt is the canonical signal
  const isPaid = Boolean(input.assessment.paidAt);
  if (isPaid && config.includedInPremium) {
    return { allowed: true, level: 'premium', maxImages: config.maxImagesPremium, reason: 'premium_assessment' };
  }

  return { allowed: false, level: 'none', maxImages: 0, reason: 'not_premium' };
}
