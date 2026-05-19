'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Pencil, Upload, X, Zap } from 'lucide-react';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Props = {
  currentName: string | null;
  currentImage: string | null;
  initials: string;
  email: string | null;
};

export function ProfileEditButton({ currentName, currentImage, initials, email }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 font-heading font-bold text-[#07140f]"
      >
        <Pencil className="h-4 w-4" />
        Editar perfil
      </button>
      {open && (
        <ProfileEditModal
          currentName={currentName}
          currentImage={currentImage}
          initials={initials}
          email={email}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ProfileEditModal({ currentName, currentImage, initials, email, onClose }: Props & { onClose: () => void }) {
  const { dictionary: t } = usePreferences();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [name, setName] = useState(currentName || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Formato de imagen no admitido. Usa JPG, PNG, WebP o GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera el límite de 5 MB.');
      return;
    }
    setError(null);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      try {
        if (avatarFile) {
          const avatarRes = await fetch('/api/user/avatar', {
            method: 'POST',
            headers: { 'content-type': avatarFile.type },
            body: avatarFile,
          });
          if (!avatarRes.ok) {
            const data = await avatarRes.json().catch(() => ({})) as { error?: string };
            setError(data.error || 'Error al subir el avatar.');
            return;
          }
        }

        const profileRes = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        });
        if (!profileRes.ok) {
          const data = await profileRes.json().catch(() => ({})) as { error?: string };
          setError(data.error || 'Error al guardar el perfil.');
          return;
        }

        await updateSession();
        router.refresh();
        onClose();
      } catch {
        setError('No se pudo guardar. Inténtalo de nuevo.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="surface relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <Pencil className="h-5 w-5 text-[#00DC82]" />
          <h2 className="font-heading text-xl font-bold text-premium">Editar perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-muted transition hover:bg-white/5 hover:text-premium"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
                {previewUrl ? (
                  <Image src={previewUrl} alt="" fill sizes="80px" className="rounded-full object-cover" />
                ) : (
                  <span className="font-heading text-2xl font-black text-[#00DC82]">{initials}</span>
                )}
              </div>
              <span className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#00DC82] text-[#07140f]">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-premium">Foto de perfil</p>
              <p className="mt-0.5 text-xs text-muted">JPG, PNG, WebP o GIF · máx. 5 MB</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-heading font-bold text-premium transition hover:border-[#00DC82]/40"
              >
                <Upload className="h-3 w-3" />
                Cambiar foto
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Tu nombre"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-heading font-semibold text-premium placeholder:text-muted/50 focus:border-[#00DC82]/40 focus:outline-none"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-heading font-bold uppercase tracking-wider text-muted">
              Email
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm font-heading font-semibold text-muted">
              {email}
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-5 py-2 text-sm font-heading font-bold text-premium transition hover:border-[#00DC82]/40"
          >
            {t.settingsBack === 'Volver' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 text-sm font-heading font-bold text-[#07140f] disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
