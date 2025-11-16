import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { UsersTable } from '@/components/UsersTable';

export function ConversationsPage() {
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBot();
  }, [botId]);

  const loadBot = async () => {
    if (!botId) return;

    try {
      setLoading(true);
      const data = await chatbotService.getOne(botId);
      console.log('[ConversationsPage] Bot loaded:', { id: data.id, chatId: data.chatId, type: data.type });
      setBot(data);
    } catch (error: any) {
      toast.error('Failed to load bot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for this bot - must be called unconditionally (React Hook Rules)
  // Pass empty string when bot not loaded yet, hook will handle it
  const { users, loading: usersLoading, error: usersError } = useUsers(
    bot?.chatId || '',
    bot?.type || 'BASIC'
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="container px-8 lg:px-12 pb-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!bot) {
    return (
      <PageTransition>
        <div className="container px-8 lg:px-12 pb-12">
          <div className="text-center py-12">
            <p className="text-gray-600">Bot not found</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Toolbar>
        <ToolbarHeading>{bot.name} - Conversations</ToolbarHeading>
      </Toolbar>

      <div className="container px-8 lg:px-12 pb-12">
        {usersError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
            <p className="text-red-800">Error loading conversations: {usersError}</p>
          </div>
        )}

        <UsersTable
          users={users}
          loading={usersLoading}
          channelType={bot.type === 'PREMIUM' ? 'premium' : 'web'}
          botName={bot.name}
          chatbotId={bot.chatId}
        />
      </div>
    </PageTransition>
  );
}
