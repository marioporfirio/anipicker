// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ModalController from '@/components/ModalController';

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
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-text-main`}>
        <Header />
        <main>
          {/* A 'children' aqui será o conteúdo do seu page.tsx */}
          {children} 
        </main>
        <ModalController />
      </body>
    </html>
  );
}