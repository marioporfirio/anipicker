// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { useFilterStore } from '@/store/filterStore';

export default function Header() {
  const { language, setLanguage } = useFilterStore();

  const toggleLanguage = () => {
    const newLang = language === 'pt' ? 'en' : 'pt';
    setLanguage(newLang);
  };

  return (
    <header className="bg-surface sticky top-0 z-40 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary font-bold text-2xl">
              AniPicker
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleLanguage}
              className="bg-background text-text-secondary font-semibold py-1 px-3 rounded-md text-sm hover:text-primary transition-colors"
              title={`Mudar para ${language === 'pt' ? 'Inglês' : 'Português'}`}
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}