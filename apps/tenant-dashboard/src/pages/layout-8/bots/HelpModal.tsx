import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

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
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-white" hideCloseButton>
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <HelpCircle className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {t(`helpModal.${topicKey}.title`)}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">Follow these simple steps to get started</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Steps */}
          {[1, 2, 3, 4, 5].map((step) => {
            const stepKey = `step${step}`;
            const hasContent = t(`helpModal.${topicKey}.${stepKey}`, { defaultValue: '' });

            if (!hasContent) return null;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step * 0.1 }}
                className="flex gap-3 group"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 flex items-center justify-center text-sm font-bold shadow-sm">
                  {step}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {t(`helpModal.${topicKey}.${stepKey}`)}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Code example if exists */}
          {t(`helpModal.${topicKey}.code`, { defaultValue: '' }) && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-gray-700">Example Code</span>
              </div>
              <code className="text-xs text-gray-800 font-mono block overflow-x-auto">
                {t(`helpModal.${topicKey}.code`)}
              </code>
            </div>
          )}

          {/* Note if exists */}
          {t(`helpModal.${topicKey}.note`, { defaultValue: '' }) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-lg">
                  <span className="text-base">⚠️</span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed flex-1">
                  {t(`helpModal.${topicKey}.note`)}
                </p>
              </div>
            </div>
          )}

          {/* Link */}
          {t(`helpModal.${topicKey}.link`, { defaultValue: '' }) && (
            <div className="pt-2">
              <a
                href={t(`helpModal.${topicKey}.linkUrl`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                {t(`helpModal.${topicKey}.link`)}
              </a>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-900 font-medium">
                You're all set! Close this guide when you're ready to continue.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-2.5 px-4 bg-white border-2 border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-700 font-semibold rounded-xl transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
