import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppPreferencesProvider } from "@/components/AppPreferencesProvider";
import CookieConsent from "@/components/CookieConsent";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { lightAuth } from "@/auth.config";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
// Fuente contractual Premium (ANCLORA_BRANDING_TYPOGRAPHY): DM Sans body + display.
const dmSans = localFont({
  src: "./fonts/DMSansVF.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
});

export const metadata: Metadata = {
  title: "Anclora EnergyScan",
  description: "Prediagnóstico energético orientativo para viviendas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await lightAuth().catch(() => null);
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem('enerscan-theme') || 'dark';
                  var params = new URLSearchParams(window.location.search);
                  var rawLanguage = params.get('lang') || params.get('locale') || localStorage.getItem('enerscan-language') || ((navigator.languages && navigator.languages[0]) || navigator.language || 'es');
                  var language = String(rawLanguage).toLowerCase().split(/[-_]/)[0];
                  var currency = localStorage.getItem('enerscan-currency');
                  var units = localStorage.getItem('enerscan-measurement-system');
                  if (language !== 'en' && language !== 'de') language = 'es';
                  if (!currency) currency = language === 'en' ? 'GBP' : 'EUR';
                  if (!units) units = language === 'en' ? 'imperial' : 'metric';
                  var resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : theme;
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.lang = language;
                  document.cookie = 'enerscan-language=' + language + '; path=/; max-age=31536000; SameSite=Lax';
                  document.cookie = 'enerscan-currency=' + currency + '; path=/; max-age=31536000; SameSite=Lax';
                  document.cookie = 'enerscan-measurement-system=' + units + '; path=/; max-age=31536000; SameSite=Lax';
                  document.documentElement.classList.toggle('light', resolved === 'light');
                  document.documentElement.classList.toggle('dark', resolved !== 'light');
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased`}
      >
        <SessionProviderWrapper session={session}>
          <AppPreferencesProvider>
            {children}
            <CookieConsent />
          </AppPreferencesProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
