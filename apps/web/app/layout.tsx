import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GiftPix',
  description: 'Gift cards com liquidação via Pix',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
