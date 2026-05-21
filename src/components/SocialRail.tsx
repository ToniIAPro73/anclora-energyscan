'use client';

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || 'https://instagram.com',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || 'https://linkedin.com',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || 'https://youtube.com',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || 'https://facebook.com',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

export function SocialRail() {
  return (
    <aside
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[5900] hidden lg:flex flex-col items-center"
      aria-label="Redes sociales"
    >
      <div className="social-rail-panel flex flex-col items-center gap-0 rounded-l-2xl border border-r-0 backdrop-blur-md py-4 px-2">
        <span
          className="social-rail-label text-[9px] font-heading font-bold uppercase tracking-[0.2em] mb-3 select-none"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Síguenos
        </span>
        <div className="social-rail-divider w-px h-5 mb-3" />
        <div className="flex flex-col items-center gap-2">
          {SOCIAL_LINKS.map(({ label, href, svg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="social-rail-icon-btn flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
            >
              {svg}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function SocialRailMobile() {
  return (
    <div className="flex lg:hidden items-center justify-center gap-3 py-4 border-t border-[var(--border)]">
      <span className="text-[9px] font-heading font-bold uppercase tracking-widest social-rail-label mr-1">
        Síguenos
      </span>
      {SOCIAL_LINKS.map(({ label, href, svg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="social-rail-mobile-btn flex h-9 w-9 items-center justify-center rounded-full border"
        >
          {svg}
        </a>
      ))}
    </div>
  );
}
