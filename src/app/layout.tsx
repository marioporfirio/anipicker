// src/app/layout.tsx

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-background text-text-main`}>
        <Header />
        <main>
          {/* CORREÇÃO: Envolvemos todo o conteúdo dinâmico (a página e os modais)
              em um único Suspense boundary. Isso resolve o erro de build, pois
              agora o Next.js sabe como lidar com os componentes que usam
              useSearchParams (como SearchInput e ModalController). */}
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
