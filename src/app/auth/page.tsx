import Image from 'next/image';
import { AuthForm } from './AuthForm';
import { getOAuthEnv } from '@/lib/auth-env';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const oauth = getOAuthEnv();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(0,220,130,0.12),_transparent_40%),linear-gradient(135deg,_rgba(2,6,23,1)_0%,_rgba(10,20,15,0.98)_50%,_rgba(5,15,10,0.96)_100%)] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[8%] h-32 w-32 rounded-full bg-[#00DC82]/8 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute left-[50%] top-[50%] h-24 w-24 rounded-full bg-[#00DC82]/5 blur-2xl" />
      </div>
      <div className="relative w-full max-w-[460px]">
        <div className="rounded-3xl border border-[#00DC82]/10 bg-[#0A0A0A]/85 shadow-[0_32px_80px_-40px_rgba(0,220,130,0.30)] backdrop-blur-xl hover:shadow-[0_48px_100px_-35px_rgba(0,220,130,0.50)] hover:scale-[1.018] transition-[transform,box-shadow] duration-300 ease-out" style={{minHeight: "560px"}}>
          {/* Header: Logo + divisor + nombre */}
          <div className="flex flex-col items-center pt-8 pb-5 px-8">
            <div style={{width: "50px", height: "50px"}} className="mb-2 drop-shadow-[0_12px_24px_rgba(0,0,0,0.30)]">
              <Image
                src="/brand/logo-anclora-energy-scan.png"
                alt="Anclora EnergyScan"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <div className="h-px w-[50px] bg-gradient-to-r from-transparent via-[#00DC82]/70 to-transparent mb-2" />
            <span className="font-heading text-sm font-bold text-white">Anclora EnergyScan</span>
          </div>
          {/* Auth form content */}
          <div className="px-2 pb-2">
            <AuthForm
              googleEnabled={oauth.google.enabled}
              githubEnabled={oauth.github.enabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
