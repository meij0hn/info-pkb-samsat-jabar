import type { Metadata } from 'next';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Samsat Jabar - Cek Pajak Kendaraan',
  description: 'Aplikasi Cek Pajak Kendaraan Bermotor Jawa Barat (Unofficial)',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        <div className="background-globes">
          <div className="globe globe-1"></div>
          <div className="globe globe-2"></div>
          <div className="globe globe-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
