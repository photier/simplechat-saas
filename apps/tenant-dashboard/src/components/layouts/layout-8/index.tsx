import { LayoutProvider } from '@/context/LayoutContext';
import { Main } from './components/main';
import { ReactNode } from 'react';

interface Layout8Props {
  children: ReactNode;
}

export function Layout8({ children }: Layout8Props) {
  return (
    <LayoutProvider>
      <Main>{children}</Main>
    </LayoutProvider>
  );
}
