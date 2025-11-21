import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: 'telegram-bot' | 'group-id' | 'embed' | null;
}

export function HelpModal({ open, onOpenChange, topic }: HelpModalProps) {
  const { t } = useTranslation('common');

  if (!topic) return null;

  const topicKey = topic === 'telegram-bot' ? 'createBot' : topic === 'group-id' ? 'groupId' : 'embed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {t(`helpModal.${topicKey}.title`)}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Steps */}
          {[1, 2, 3, 4, 5].map((step) => {
            const stepKey = `step${step}`;
            const hasContent = t(`helpModal.${topicKey}.${stepKey}`, { defaultValue: '' });

            if (!hasContent) return null;

            return (
              <div key={step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                  {step}
                </div>
                <p className="text-sm text-gray-700 pt-0.5 leading-relaxed">
                  {t(`helpModal.${topicKey}.${stepKey}`)}
                </p>
              </div>
            );
          })}

          {/* Code example if exists */}
          {t(`helpModal.${topicKey}.code`, { defaultValue: '' }) && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <code className="text-xs text-gray-800 font-mono">
                {t(`helpModal.${topicKey}.code`)}
              </code>
            </div>
          )}

          {/* Note if exists */}
          {t(`helpModal.${topicKey}.note`, { defaultValue: '' }) && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-900 font-medium">
                ⚠️ {t(`helpModal.${topicKey}.note`)}
              </p>
            </div>
          )}

          {/* Link */}
          {t(`helpModal.${topicKey}.link`, { defaultValue: '' }) && (
            <a
              href={t(`helpModal.${topicKey}.linkUrl`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t(`helpModal.${topicKey}.link`)}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
