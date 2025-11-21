import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
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
          url: '#',
        },
      ],
    },
  };

  const currentContent = content[topic];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            {currentContent.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {t('common:helpModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          {currentContent.steps.map((item, index) => (
            <div
              key={item.step}
              className="flex gap-4 group relative"
            >
              {/* Step Number with connecting line */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 flex items-center justify-center font-bold text-sm text-blue-700 shadow-sm">
                  {item.step}
                </div>
                {/* Connecting line to next step */}
                {index < currentContent.steps.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-8 bg-gradient-to-b from-blue-200 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                  <h4 className="font-semibold text-base text-gray-900 mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Code Block */}
                  {item.code && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs text-gray-800 font-mono">
                        {item.code}
                      </pre>
                    </div>
                  )}

                  {/* Warning/Highlight */}
                  {item.highlight && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-900 font-medium leading-relaxed">
                          {item.highlight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Helpful Links Section */}
          {currentContent.links.length > 0 && (
            <div className="pt-4 mt-2 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                {t('common:helpModal.helpfulLinks')}
              </h4>
              <div className="space-y-2">
                {currentContent.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-700 hover:text-blue-800 transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="font-medium">{link.label}</span>
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
