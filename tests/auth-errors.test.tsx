import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthErrorAlert } from '@/app/auth/AuthErrorAlert';
import { getAuthErrorMessageKey } from '@/lib/auth-errors';
import { dictionaries } from '@/lib/i18n';

describe('Auth error messages', () => {
  it.each([
    ['OAuthAccountNotLinked', 'authErrorAccountNotLinked'],
    ['AccessDenied', 'authErrorAccessDenied'],
    ['Configuration', 'authErrorConfiguration'],
    ['Verification', 'authErrorVerification'],
    ['CredentialsSignin', 'authErrorCredentialsSignin'],
    ['OAuthCallback', 'authErrorOAuthCallback'],
    ['OAuthSignin', 'authErrorOAuthSignin'],
  ])('maps %s to its translated message key', (code, key) => {
    expect(getAuthErrorMessageKey(code)).toBe(key);
    expect(dictionaries.es[key as keyof typeof dictionaries.es]).toBeTruthy();
    expect(dictionaries.en[key as keyof typeof dictionaries.en]).toBeTruthy();
  });

  it('uses a generic message for unknown error codes', () => {
    expect(getAuthErrorMessageKey('Foo')).toBe('authErrorGeneric');
    expect(getAuthErrorMessageKey('toString')).toBe('authErrorGeneric');
    expect(getAuthErrorMessageKey('constructor')).toBe('authErrorGeneric');
    expect(getAuthErrorMessageKey('')).toBe('authErrorGeneric');
    expect(dictionaries.es.authErrorGeneric).toBeTruthy();
    expect(dictionaries.en.authErrorGeneric).toBeTruthy();
  });

  it('uses the clear Spanish message for accounts created with another method', () => {
    expect(dictionaries.es.authErrorAccountNotLinked).toBe(
      'Ya existe una cuenta con este correo creada con otro método. Entra con el método que usaste al registrarte (por ejemplo GitHub o correo y contraseña).',
    );
  });

  it('renders the access error as a visible accessible alert', () => {
    const message = dictionaries.es.authErrorAccountNotLinked;
    const markup = renderToStaticMarkup(createElement(AuthErrorAlert, { message }));

    expect(markup).toContain('role="alert"');
    expect(markup).toContain(message);
  });
});
