// =================================================================
// ============== ARQUIVO: src/app/layout.tsx ======================
// =================================================================
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ModalController from '@/components/ModalController';
import { Toaster } from 'react-hot-toast';
import BackToTopButton from '@/components/BackToTopButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AniPicker',
  description: 'Encontre e descubra novos animes para assistir.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${inter.className} bg-background text-text-main`}>
        <Header />
        <main className="w-full px-4 sm:px-6 lg:px-8">
          <Suspense>
            {children}
            <ModalController />
          </Suspense>
        </main>
        <Toaster position="bottom-center" />
        <BackToTopButton />
      </body>
    </html>
  );
}