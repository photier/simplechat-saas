import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: 'telegram-bot' | 'group-id' | 'embed' | null;
}

export function HelpModal({ open, onOpenChange, topic }: HelpModalProps) {
  const { t } = useTranslation();

  if (!topic) return null;

  const content = {
    'telegram-bot': {
      title: t('common:helpModal.telegramBot.title'),
      steps: [
        {
          step: 1,
          title: t('common:helpModal.telegramBot.step1Title'),
          description: t('common:helpModal.telegramBot.step1Description'),
        },
        {
          step: 2,
          title: t('common:helpModal.telegramBot.step2Title'),
          description: t('common:helpModal.telegramBot.step2Description'),
        },
        {
          step: 3,
          title: t('common:helpModal.telegramBot.step3Title'),
          description: t('common:helpModal.telegramBot.step3Description'),
        },
        {
          step: 4,
          title: t('common:helpModal.telegramBot.step4Title'),
          description: t('common:helpModal.telegramBot.step4Description'),
        },
        {
          step: 5,
          title: t('common:helpModal.telegramBot.step5Title'),
          description: t('common:helpModal.telegramBot.step5Description'),
          highlight: t('common:helpModal.telegramBot.step5Highlight'),
        },
      ],
      links: [
        {
          label: t('common:helpModal.telegramBot.linkLabel'),
          url: 'https://core.telegram.org/bots#3-how-do-i-create-a-bot',
        },
      ],
    },
    'group-id': {
      title: t('common:helpModal.telegramGroup.title'),
      steps: [
        {
          step: 1,
          title: t('common:helpModal.telegramGroup.step1Title'),
          description: t('common:helpModal.telegramGroup.step1Description'),
        },
        {
          step: 2,
          title: t('common:helpModal.telegramGroup.step2Title'),
          description: t('common:helpModal.telegramGroup.step2Description'),
        },
        {
          step: 3,
          title: t('common:helpModal.telegramGroup.step3Title'),
          description: t('common:helpModal.telegramGroup.step3Description'),
        },
        {
          step: 4,
          title: t('common:helpModal.telegramGroup.step4Title'),
          description: t('common:helpModal.telegramGroup.step4Description'),
          code: t('common:helpModal.telegramGroup.step4Code'),
        },
        {
          step: 5,
          title: t('common:helpModal.telegramGroup.step5Title'),
          description: t('common:helpModal.telegramGroup.step5Description'),
          highlight: t('common:helpModal.telegramGroup.step5Highlight'),
        },
      ],
      links: [
        {
          label: t('common:helpModal.telegramGroup.linkLabel'),
          url: 'https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id',
        },
      ],
    },
    'embed': {
      title: t('common:helpModal.embedWidget.title'),
      steps: [
        {
          step: 1,
          title: t('common:helpModal.embedWidget.step1Title'),
          description: t('common:helpModal.embedWidget.step1Description'),
        },
        {
          step: 2,
          title: t('common:helpModal.embedWidget.step2Title'),
          description: t('common:helpModal.embedWidget.step2Description'),
          code: '<script>...</script>\n</body>',
        },
        {
          step: 3,
          title: t('common:helpModal.embedWidget.step3Title'),
          description: t('common:helpModal.embedWidget.step3Description'),
        },
        {
          step: 4,
          title: t('common:helpModal.embedWidget.step4Title'),
          description: t('common:helpModal.embedWidget.step4Description'),
        },
        {
          step: 5,
          title: t('common:helpModal.embedWidget.step5Title'),
          description: t('common:helpModal.embedWidget.step5Description'),
        },
      ],
      links: [
        {
          label: t('common:helpModal.embedWidget.linkLabel'),
          url: '#', // TODO: Link to docs
        },
      ],
    },
  };

  const currentContent = content[topic];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{currentContent.title}</DialogTitle>
          <DialogDescription>
            {t('common:helpModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentContent.steps.map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.code && (
                  <pre className="bg-gray-100 p-2 rounded text-xs text-gray-800 overflow-x-auto mt-2">
                    {item.code}
                  </pre>
                )}
                {item.highlight && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-900 font-semibold">⚠️ {item.highlight}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {currentContent.links.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('common:helpModal.helpfulLinks')}</h4>
              <div className="space-y-2">
                {currentContent.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
