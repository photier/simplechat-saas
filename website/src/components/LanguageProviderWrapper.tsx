import { LanguageProvider } from '../contexts/LanguageContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function LanguageProviderWrapper({ children }: Props) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
