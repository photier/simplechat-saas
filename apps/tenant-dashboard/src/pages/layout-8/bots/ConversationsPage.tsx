import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';

export function ConversationsPage() {
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBot();
  }, [botId]);

  const loadBot = async () => {
    if (!botId) return;

    try {
      setLoading(true);
      const data = await chatbotService.getOne(botId);
      setBot(data);
    } catch (error: any) {
      toast.error('Failed to load bot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{bot.name}</h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Type: {bot.type}</span>
              <span>Status: {bot.status}</span>
              <span>Chat ID: {bot.chatId}</span>
            </div>
          </div>

          {/* Conversations Table Placeholder */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Conversations feature coming soon...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                This will show all conversations for this bot, similar to the stats dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
