import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GiftPix',
  description: 'Gift cards com liquidação via Pix',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 antialiased">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.07),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_25%)]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
