import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarFooter } from './sidebar-footer';
import { SidebarMenu } from './sidebar-menu';

export function Header() {
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close sheet when route changes
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="flex items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-muted h-(--header-height)">
      <div className="container flex items-center justify-between flex-wrap gap-3">
        <Link to="/">
          <img
            src={toAbsoluteUrl('/logo.png')}
            className="h-[40px]"
            alt="Simple Chat Logo"
          />
        </Link>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="dim" mode="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="p-0 gap-0 w-(--sidebar-width)"
            side="left"
            close={false}
          >
            <SheetHeader className="p-0 space-y-0 flex items-center justify-center pt-8 pb-3.5">
              <Link to="/">
                <img
                  src={toAbsoluteUrl('/logo.png')}
                  className="h-[60px]"
                  alt="Simple Chat Logo"
                />
              </Link>
            </SheetHeader>
            <SheetBody className="px-0 pt-5 flex flex-col grow">
              <SidebarMenu />
              <SidebarFooter />
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
