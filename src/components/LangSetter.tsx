'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/store/filterStore';

export default function LangSetter() {
  const language = useFilterStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  }, [language]);

  return null;
}
