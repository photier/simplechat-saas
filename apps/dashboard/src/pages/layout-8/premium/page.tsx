import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useUsers } from '../hooks/useUsers';
import { UsersTable } from '../components/UsersTable';
import { PageTransition } from '@/components/PageTransition';

export function Layout8PremiumPage() {
  const { users, loading, error } = useUsers('premium');

  if (error) {
    return (
      <div className="container px-8 lg:px-12 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-5">
          <p className="text-red-800">Error loading users: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <Toolbar>
        <ToolbarHeading />
        <ToolbarActions>
          <SearchDialog
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <Search className="size-4.5!" />
              </Button>
            }
          />
          <ChatSheet
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <MessageCircleMore className="size-4.5!" />
              </Button>
            }
          />
          <div className="ms-2.5">
            <LanguageSwitcher />
          </div>
        </ToolbarActions>
      </Toolbar>

      <div className="container px-8 lg:px-12 pb-12">
        <UsersTable users={users} loading={loading} channelType="premium" />
      </div>
    </PageTransition>
  );
}
