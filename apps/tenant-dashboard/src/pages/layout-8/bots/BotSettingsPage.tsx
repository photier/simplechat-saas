import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { Button } from '@/components/ui/button';
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { Code, Settings as SettingsIcon } from 'lucide-react';
import { EmbedCodeModal } from '@/components/EmbedCodeModal';

export function BotSettingsPage() {
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

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

  const handleGetEmbedCode = () => {
    setShowEmbedModal(true);
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

  const config = bot.config || {};

  return (
    <PageTransition>
      <Toolbar>
        <ToolbarHeading>{bot.name} - Settings</ToolbarHeading>
      </Toolbar>

      <div className="container px-8 lg:px-12 pb-12">
        <div className="max-w-4xl space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="size-5" />
              General Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Bot Name</label>
                <p className="text-gray-900 mt-1">{bot.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-gray-900 mt-1">
                  {bot.type === 'PREMIUM' ? '💎 Premium' : '⚡ Basic'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900 mt-1">{bot.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Chat ID</label>
                <p className="text-gray-900 mt-1 font-mono text-sm">{bot.chatId}</p>
              </div>
              {config.websiteUrl && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Website URL</label>
                  <p className="text-gray-900 mt-1">{config.websiteUrl}</p>
                </div>
              )}
              {config.description && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 mt-1">{config.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Telegram Configuration (Premium only) */}
          {bot.type === 'PREMIUM' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Telegram Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode</label>
                  <p className="text-gray-900 mt-1 capitalize">
                    {config.telegramMode || 'Not configured'}
                  </p>
                </div>
                {config.telegramGroupId && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Group ID</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm">
                      {config.telegramGroupId}
                    </p>
                  </div>
                )}
                {config.telegramMode === 'custom' && config.telegramBotToken && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Bot Token</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm">
                      {config.telegramBotToken.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Configuration */}
          {config.aiInstructions && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Configuration
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-700">AI Instructions</label>
                <p className="text-gray-900 mt-2 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {config.aiInstructions}
                </p>
              </div>
            </div>
          )}

          {/* Widget Embed Code */}
          {bot.status === 'ACTIVE' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="size-5" />
                Widget Embed Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get the embed code to add this widget to your website. Choose from CDN, NPM, or WordPress integration methods.
              </p>
              <Button onClick={handleGetEmbedCode} className="gap-2">
                <Code className="size-4" />
                Get Embed Code
              </Button>
              {bot.webhookUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                  <p className="text-gray-900 mt-1 font-mono text-xs break-all bg-gray-50 p-2 rounded">
                    {bot.webhookUrl}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embed Code Modal */}
      <EmbedCodeModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        chatId={bot.chatId}
        botType={bot.type}
      />
    </PageTransition>
  );
}
