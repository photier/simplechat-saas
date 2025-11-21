import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { Bot, Sparkles, Users, Gift, Check, ArrowLeft, HelpCircle } from 'lucide-react';
import { HelpModal } from './HelpModal';
import { PaymentModal } from './PaymentModal';
import { motion } from 'framer-motion';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (bot: any) => void;
}

type BotType = 'BASIC' | 'PREMIUM' | 'FREE';
type TelegramMode = 'managed' | 'custom';

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Plan
  const [type, setType] = useState<BotType>('FREE');

  // Step 2: Bot Details
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Telegram
  const [telegramMode, setTelegramMode] = useState<TelegramMode>('managed');
  const [telegramGroupId, setTelegramGroupId] = useState('-1003440801039');
  const [telegramBotToken, setTelegramBotToken] = useState('');

  // Help modal
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<'telegram-bot' | 'group-id' | 'embed' | null>(null);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdBot, setCreatedBot] = useState<any>(null);

  const showHelp = (topic: 'telegram-bot' | 'group-id' | 'embed') => {
    setHelpTopic(topic);
    setHelpModalOpen(true);
  };

  const handlePlanSelect = (selectedType: BotType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t('common:createBot.validation.nameRequired'));
      return;
    }
    if (name.trim().length < 2) {
      toast.error(t('common:createBot.validation.nameMinLength'));
      return;
    }
    if (!websiteUrl.trim()) {
      toast.error(t('common:createBot.validation.websiteRequired'));
      return;
    }
    if (!telegramGroupId.trim()) {
      toast.error(t('common:createBot.validation.telegramGroupRequired'));
      return;
    }
    if (telegramMode === 'custom' && !telegramBotToken.trim()) {
      toast.error(t('common:createBot.validation.botTokenRequired'));
      return;
    }

    try {
      setLoading(true);

      const botType = type === 'FREE' ? 'BASIC' : type;
      const config = {
        websiteUrl,
        aiInstructions: 'You are a helpful customer support assistant. Be friendly, concise, and helpful.',
        telegramMode,
        telegramGroupId,
        ...(telegramMode === 'custom' && { telegramBotToken }),
      };

      const result = await chatbotService.create({
        name: name.trim(),
        type: botType,
        config,
      });

      if (result.warning?.type === 'TELEGRAM_GROUP_CONFLICT') {
        toast.warning(result.warning.message, {
          duration: 8000,
          description: `Deactivated: ${result.warning.deactivatedBot.name} (${result.warning.deactivatedBot.chatId})`,
        });
      }

      if (type === 'FREE') {
        await chatbotService.purchase(result.id);
        toast.success('🎉 ' + t('common:createBot.success.trialActivated', { name: result.name }));
        onOpenChange(false);
        resetForm();
        onSuccess(result);
      } else {
        toast.success(t('common:createBot.success.botCreated', { name: result.name }));
        setCreatedBot(result);
        setPaymentModalOpen(true);
      }
    } catch (error: any) {
      toast.error(t('common:createBot.errors.createFailed') + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setType('FREE');
    setName('');
    setWebsiteUrl('');
    setTelegramMode('managed');
    setTelegramGroupId('');
    setTelegramBotToken('');
    setCreatedBot(null);
  };

  const handlePaymentSuccess = () => {
    toast.success('🎉 ' + t('common:createBot.success.paymentSuccess', { name: createdBot?.name }));
    onOpenChange(false);
    resetForm();
    onSuccess(createdBot);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Bot className="w-6 h-6 text-blue-500" />
              {step === 1 && t('common:createBot.steps.choosePlan')}
              {step === 2 && t('common:createBot.steps.createBot')}
            </DialogTitle>
            <DialogDescription>
              {t('common:createBot.steps.stepOf', { step })}
              {' • '}
              {step === 1 && t('common:createBot.steps.selectPlan')}
              {step === 2 && t('common:createBot.steps.enterDetails')}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: Plan Selection */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FREE TRIAL */}
                <button
                  type="button"
                  onClick={() => handlePlanSelect('FREE')}
                  className="relative p-6 rounded-xl border-2 border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                    {t('common:createBot.plans.premium.popular')}
                  </div>
                  <Gift className="w-8 h-8 text-green-600 mb-3 mt-2" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common:createBot.plans.free.heading')}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-green-600">{t('common:createBot.plans.free.badge')}</span>
                    <span className="text-gray-500 text-sm">{t('common:createBot.plans.free.duration')}</span>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {t('common:createBot.plans.free.features.noCard')}
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {t('common:createBot.plans.free.features.fullFeatures')}
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {t('common:createBot.plans.free.features.cancelAnytime')}
                    </li>
                  </ul>
                </button>

                {/* BASIC */}
                <button
                  type="button"
                  onClick={() => handlePlanSelect('BASIC')}
                  className="relative p-6 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <Sparkles className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common:createBot.plans.basic.title')}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-blue-600">{t('common:createBot.plans.basic.price')}</span>
                    <span className="text-gray-500 text-sm">{t('common:createBot.plans.basic.perMonth')}</span>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {t('common:createBot.plans.basic.features.aiResponses')}
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {t('common:createBot.plans.basic.features.unlimitedConversations')}
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {t('common:createBot.plans.basic.features.analytics')}
                    </li>
                  </ul>
                </button>
              </div>

              {/* PREMIUM - Full Width */}
              <button
                type="button"
                onClick={() => handlePlanSelect('PREMIUM')}
                className="w-full p-6 rounded-xl border-2 border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common:createBot.plans.premium.title')}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-4xl font-bold text-purple-600">{t('common:createBot.plans.premium.price')}</span>
                      <span className="text-gray-500 text-sm">{t('common:createBot.plans.premium.perMonth')}</span>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="font-semibold">{t('common:createBot.plans.premium.features.everythingBasic')}</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        {t('common:createBot.plans.premium.features.dualTab')}
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        {t('common:createBot.plans.premium.features.telegram')}
                      </li>
                    </ul>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Bot Details */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              {/* Bot Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  {t('common:createBot.form.botName')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('common:createBot.form.botNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor="websiteUrl" className="text-sm font-semibold">
                  {t('common:createBot.form.websiteUrl')}
                </Label>
                <Input
                  id="websiteUrl"
                  placeholder={t('common:createBot.form.websiteUrlPlaceholder')}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">{t('common:createBot.form.websiteUrlHelp')}</p>
              </div>

              {/* Telegram Setup */}
              <div className="border-t pt-6">
                <div className={`rounded-lg p-4 mb-4 ${
                  type === 'PREMIUM' ? 'bg-purple-50 border border-purple-200' :
                  type === 'BASIC' ? 'bg-blue-50 border border-blue-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <p className={`text-sm font-semibold mb-1 ${
                    type === 'PREMIUM' ? 'text-purple-900' :
                    type === 'BASIC' ? 'text-blue-900' :
                    'text-green-900'
                  }`}>
                    {type === 'FREE' ? '🎁 ' + t('common:createBot.form.telegram.trialHeading') : '🔔 ' + t('common:createBot.form.telegram.heading')}
                  </p>
                  <p className="text-xs text-gray-700">
                    {type === 'FREE'
                      ? t('common:createBot.form.telegram.trialDescription')
                      : t('common:createBot.form.telegram.description')
                    }
                  </p>
                </div>

                {/* Bot Mode Selection */}
                <div className="space-y-3 mb-6">
                  <Label className="text-sm font-semibold">
                    {t('common:createBot.form.telegram.botMode')}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTelegramMode('managed')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        telegramMode === 'managed'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Check className={`w-5 h-5 ${telegramMode === 'managed' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-semibold">{t('common:createBot.form.telegram.managed.title')}</span>
                      </div>
                      <p className="text-xs text-gray-600">{t('common:createBot.form.telegram.managed.description')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTelegramMode('custom')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        telegramMode === 'custom'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Check className={`w-5 h-5 ${telegramMode === 'custom' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-semibold">{t('common:createBot.form.telegram.custom.title')}</span>
                      </div>
                      <p className="text-xs text-gray-600">{t('common:createBot.form.telegram.custom.description')}</p>
                    </button>
                  </div>
                </div>

                {/* Telegram Group ID */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="telegramGroupId" className="text-sm font-semibold">
                      {t('common:createBot.form.telegram.groupId')}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-blue-600"
                      onClick={() => showHelp('group-id')}
                    >
                      <HelpCircle className="w-4 h-4" />
                      {t('common:createBot.form.telegram.groupIdHowTo')}
                    </Button>
                  </div>
                  <Input
                    id="telegramGroupId"
                    placeholder={t('common:createBot.form.telegram.groupIdPlaceholder')}
                    value={telegramGroupId}
                    onChange={(e) => setTelegramGroupId(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">{t('common:createBot.form.telegram.groupIdHelp')}</p>
                </div>

                {/* Custom Bot Token */}
                {telegramMode === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Label htmlFor="telegramBotToken" className="text-sm font-semibold">
                        {t('common:createBot.form.telegram.botToken')}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-blue-600"
                        onClick={() => showHelp('telegram-bot')}
                      >
                        <HelpCircle className="w-4 h-4" />
                        {t('common:createBot.form.telegram.botTokenHowTo')}
                      </Button>
                    </div>
                    <Input
                      id="telegramBotToken"
                      placeholder={t('common:createBot.form.telegram.botTokenPlaceholder')}
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      disabled={loading}
                      type="password"
                    />
                    <p className="text-xs text-gray-500">{t('common:createBot.form.telegram.botTokenHelp')}</p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('common:createBot.actions.back')}
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('common:createBot.actions.creating')}
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      {type === 'FREE' ? t('common:createBot.actions.startTrial') : t('common:createBot.actions.createBot')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <HelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
        topic={helpTopic}
      />

      {/* Payment Modal */}
      {createdBot && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          bot={createdBot}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
