'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, GitBranch, Mail } from 'lucide-react';
import { requestPasswordReset, signInWithEmail, signInWithProvider, signUpWithEmail } from './actions';
import { usePreferences } from '@/components/AppPreferencesProvider';

type AuthFormProps = {
  googleEnabled: boolean;
  githubEnabled: boolean;
};

export function AuthForm({ googleEnabled, githubEnabled }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [providerStatus, setProviderStatus] = useState({ googleEnabled, githubEnabled });
  const { dictionary: t } = usePreferences();
  const [signInState, signInAction] = useFormState(signInWithEmail, {});
  const [signUpState, signUpAction] = useFormState(signUpWithEmail, {});
  const [resetState, resetAction] = useFormState(requestPasswordReset, {});
  const state = mode === 'signin' ? signInState : mode === 'signup' ? signUpState : resetState;

  useEffect(() => {
    let active = true;
    fetch('/api/auth/providers-status', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((status) => {
        if (!active || !status) return;
        setProviderStatus({
          googleEnabled: Boolean(status.google?.enabled),
          githubEnabled: Boolean(status.github?.enabled),
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="px-6 pb-6 sm:px-8 sm:pb-8">
      <form action={mode === 'forgot' ? resetAction : mode === 'signin' ? signInAction : signUpAction} className="space-y-2.5">
        {mode === 'forgot' && (
          <p className="text-xs text-muted text-center mb-3">
            {t.recoverCopy}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-muted">
            {t.authFieldEmail}
          </label>
          <input id="email" name="email" type="email" required placeholder="correo@ejemplo.es" className="h-10 w-full rounded-2xl border border-[#262626] bg-[#131313] p-3 text-sm outline-none focus:border-[#00DC82]" />
        </div>

        {mode !== 'forgot' && (
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-muted">
              {t.authFieldPassword}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••"
                className="h-10 w-full rounded-2xl border border-[#262626] bg-[#131313] p-3 pr-10 text-sm outline-none focus:border-[#00DC82]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#00DC82] transition-colors"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold text-muted">
              {t.authFieldName}
            </label>
            <input id="name" name="name" type="text" required placeholder="Tu nombre" className="h-10 w-full rounded-2xl border border-[#262626] bg-[#131313] p-3 text-sm outline-none focus:border-[#00DC82]" />
          </div>
        )}

        {state.error && (
          <div className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]" role="alert">
            {state.error}
          </div>
        )}

        <SubmitButton label={mode === 'forgot' ? t.sendLink : mode === 'signin' ? t.signIn : t.signUp} pendingLabel={mode === 'forgot' ? t.sending : t.processing} />
      </form>

      {mode !== 'forgot' && (
        <div className="mt-1.5 text-center">
          <button
            type="button"
            onClick={() => setMode('forgot')}
            className="text-xs text-muted hover:text-[#00DC82] transition"
          >
            {t.forgotPassword}
          </button>
        </div>
      )}

      {mode === 'signin' && (
        <div className="mt-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center">
          <p className="text-xs text-muted">
            {t.noAccountMsg}{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="font-semibold text-[#00DC82] hover:text-[#00DC82]/80 transition"
            >
              {t.signUp}
            </button>
          </p>
        </div>
      )}

      {mode === 'signup' && (
        <div className="mt-1.5 text-center">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="text-xs text-muted hover:text-[#00DC82] transition"
          >
            {t.backToAccess}
          </button>
        </div>
      )}

      {mode !== 'forgot' && (providerStatus.googleEnabled || providerStatus.githubEnabled) ? (
        <>
          <div className="my-2.5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-muted">{t.socialAccess}</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {providerStatus.googleEnabled ? (
              <SocialButton provider="google" label="Google/Gmail" icon={<Mail className="h-4 w-4" />} enabled />
            ) : null}
            {providerStatus.githubEnabled ? (
              <SocialButton provider="github" label="GitHub" icon={<GitBranch className="h-4 w-4" />} enabled />
            ) : null}
          </div>
        </>
      ) : (
        !mode.includes('forgot') && (
          <div>
            <div className="my-2.5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-muted">{t.socialAccess}</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button disabled className="h-9 rounded-2xl border border-white/10 text-xs text-muted opacity-50 cursor-not-allowed">{t.loginGoogle}</button>
              <button disabled className="h-9 rounded-2xl border border-white/10 text-xs text-muted opacity-50 cursor-not-allowed">{t.loginGithub}</button>
            </div>
          </div>
        )
      )}

      <p className="mt-2 text-center text-[10px] leading-relaxed text-muted">
        {t.acceptTermsPrefix}{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-[#00DC82]">
          {t.terms}
        </Link>{' '}
        {t.andPrivacy}{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-[#00DC82]">
          {t.privacy}
        </Link>
        .
      </p>
    </div>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="h-10 w-full rounded-2xl bg-[#00DC82] font-heading font-bold text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50 transition-all">
      {pending ? pendingLabel : label}
    </button>
  );
}

function SocialButton({ provider, label, icon, enabled }: { provider: string; label: string; icon: ReactNode; enabled: boolean }) {
  return (
    <form action={signInWithProvider}>
      <input type="hidden" name="provider" value={provider} />
      <button disabled={!enabled} className="flex h-9 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-xs font-bold text-white hover:border-[#00DC82]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all">
        {icon}
        {label}
      </button>
    </form>
  );
}
