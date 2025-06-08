// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import AnimeDetailsModal from '@/components/AnimeDetailsModal';
import PersonDetailsModal from '@/components/PersonDetailsModal'; // Importar o novo modal
import Sidebar from '@/components/Sidebar';
import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AniPicker',
  description: 'Sua lente para o universo dos animes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="dark">
      <body className={`${inter.className} bg-background text-text-main`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
            <ClientLayoutWrapper
              sidebar={
                <Sidebar>
                  <GenreFilter />
                  <TagFilter />
                </Sidebar>
              }
            >
              {children}
            </ClientLayoutWrapper>
          </div>
        </div>
        <AnimeDetailsModal />
        <PersonDetailsModal /> {/* Adicionar o novo modal aqui */}
      </body>
    </html>
  );
}