import { useLocation } from 'react-router-dom';
import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { Footer } from './footer';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { ReactNode } from 'react';

interface MainProps {
  children: ReactNode;
}

export function Main({ children }: MainProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  console.log(pathname);

  // Using the custom hook to set classes on the body
  useBodyClass(`
    [--header-height:60px]
    [--sidebar-width:113px]
    bg-muted!
  `);

  return (
    <div className="flex grow">
      {isMobile && <Header />}

      <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
        {!isMobile && <Sidebar />}

        <div className="flex flex-col grow rounded-xl bg-background border border-input lg:ms-(--sidebar-width) mt-0 m-6 lg:m-7">
          <div className="flex flex-col grow kt-scrollable-y-auto lg:[scrollbar-width:auto] pt-5">
            <main className="grow" role="content">
              {children}
            </main>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
