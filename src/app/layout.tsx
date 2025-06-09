// src/app/layout.tsx

import { Suspense } from 'react'; // <-- PASSO 1: Importe o Suspense
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ModalController from '@/components/ModalController';
import { Toaster } from 'react-hot-toast'; // Adicionado para consistência, se você o usa

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
    // Adicionado 'dark' para corresponder ao seu CSS e um lang mais genérico
    <html lang="en" className="dark"> 
      <body className={`${inter.className} bg-background text-text-main`}>
        <Header />
        <main>
          {children} 
        </main>
        <Toaster position="bottom-center" />
        
        {/* --- A CORREÇÃO MÁGICA --- */}
        {/* PASSO 2: Envolva o ModalController com Suspense */}
        <Suspense>
          <ModalController />
        </Suspense>

      </body>
    </html>
  );
}