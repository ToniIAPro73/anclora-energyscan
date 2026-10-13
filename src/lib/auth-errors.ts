export const AUTH_ERROR_MESSAGE_KEYS = {
  OAuthAccountNotLinked: 'authErrorAccountNotLinked',
  AccessDenied: 'authErrorAccessDenied',
  Configuration: 'authErrorConfiguration',
  Verification: 'authErrorVerification',
  CredentialsSignin: 'authErrorCredentialsSignin',
  OAuthCallback: 'authErrorOAuthCallback',
  OAuthSignin: 'authErrorOAuthSignin',
} as const;

export type AuthErrorMessageKey = typeof AUTH_ERROR_MESSAGE_KEYS[keyof typeof AUTH_ERROR_MESSAGE_KEYS] | 'authErrorGeneric';

export function getAuthErrorMessageKey(errorCode: string | null | undefined): AuthErrorMessageKey {
  if (!errorCode) return 'authErrorGeneric';
  return AUTH_ERROR_MESSAGE_KEYS[errorCode as keyof typeof AUTH_ERROR_MESSAGE_KEYS] ?? 'authErrorGeneric';
}
