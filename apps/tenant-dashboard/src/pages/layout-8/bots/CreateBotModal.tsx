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
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  step === 1 ? 'bg-gradient-to-br from-sky-100 to-blue-100' :
                  type === 'PREMIUM' ? 'bg-gradient-to-br from-violet-100 to-purple-100' :
                  type === 'BASIC' ? 'bg-gradient-to-br from-sky-100 to-blue-100' :
                  'bg-gradient-to-br from-emerald-100 to-teal-100'
                }`}>
                  <Bot className={`w-5 h-5 ${
                    step === 1 ? 'text-sky-600' :
                    type === 'PREMIUM' ? 'text-violet-600' :
                    type === 'BASIC' ? 'text-sky-600' :
                    'text-emerald-600'
                  }`} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {step === 1 && t('common:createBot.steps.choosePlan')}
                    {step === 2 && t('common:createBot.steps.createBot')}
                  </DialogTitle>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step >= 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className={`w-8 h-1 rounded ${step === 2 ? 'bg-sky-400' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>

            <DialogDescription className="text-sm text-gray-600">
              {step === 1 && t('common:createBot.steps.selectPlan')}
              {step === 2 && t('common:createBot.steps.enterDetails')}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">

          {/* STEP 1: Plan Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 py-2"
            >
              {/* FREE TRIAL - Highlighted */}
              <motion.button
                type="button"
                onClick={() => handlePlanSelect('FREE')}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-300 hover:shadow-lg transition-all text-left group overflow-hidden"
              >
                {/* Popular Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-bl-2xl text-xs font-bold shadow-md">
                  ✨ {t('common:createBot.plans.premium.popular')}
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <Gift className="w-7 h-7 text-emerald-600" />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1.5">{t('common:createBot.plans.free.heading')}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {t('common:createBot.plans.free.badge')}
                      </span>
                      <span className="text-gray-500 text-sm font-medium">{t('common:createBot.plans.free.duration')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t('common:createBot.plans.free.features.noCard')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t('common:createBot.plans.free.features.fullFeatures')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t('common:createBot.plans.free.features.cancelAnytime')}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* BASIC & PREMIUM - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* BASIC */}
                <motion.button
                  type="button"
                  onClick={() => handlePlanSelect('BASIC')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-4 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      <Sparkles className="w-6 h-6 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{t('common:createBot.plans.basic.title')}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-sky-600">{t('common:createBot.plans.basic.price')}</span>
                        <span className="text-gray-500 text-xs">{t('common:createBot.plans.basic.perMonth')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {t('common:createBot.plans.basic.features.aiResponses')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {t('common:createBot.plans.basic.features.unlimitedConversations')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {t('common:createBot.plans.basic.features.analytics')}
                    </div>
                  </div>
                </motion.button>

                {/* PREMIUM */}
                <motion.button
                  type="button"
                  onClick={() => handlePlanSelect('PREMIUM')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-4 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      <Users className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{t('common:createBot.plans.premium.title')}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-violet-600">{t('common:createBot.plans.premium.price')}</span>
                        <span className="text-gray-500 text-xs">{t('common:createBot.plans.premium.perMonth')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span className="font-semibold">{t('common:createBot.plans.premium.features.everythingBasic')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {t('common:createBot.plans.premium.features.dualTab')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {t('common:createBot.plans.premium.features.telegram')}
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Bot Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5 py-2"
            >
              {/* Bot Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  {t('common:createBot.form.botName')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('common:createBot.form.botNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="h-11 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor="websiteUrl" className="text-sm font-semibold text-gray-700">
                  {t('common:createBot.form.websiteUrl')}
                </Label>
                <Input
                  id="websiteUrl"
                  placeholder={t('common:createBot.form.websiteUrlPlaceholder')}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  {t('common:createBot.form.websiteUrlHelp')}
                </p>
              </div>

              {/* Telegram Setup */}
              <div className="pt-4 space-y-4">
                {/* Info Banner */}
                <div className={`rounded-xl p-4 border-2 ${
                  type === 'PREMIUM' ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200' :
                  type === 'BASIC' ? 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200' :
                  'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                }`}>
                  <p className={`text-sm font-bold mb-1 flex items-center gap-2 ${
                    type === 'PREMIUM' ? 'text-violet-900' :
                    type === 'BASIC' ? 'text-sky-900' :
                    'text-emerald-900'
                  }`}>
                    <span className="text-base">{type === 'FREE' ? '🎁' : '🔔'}</span>
                    {type === 'FREE' ? t('common:createBot.form.telegram.trialHeading') : t('common:createBot.form.telegram.heading')}
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {type === 'FREE'
                      ? t('common:createBot.form.telegram.trialDescription')
                      : t('common:createBot.form.telegram.description')
                    }
                  </p>
                </div>

                {/* Bot Mode Selection */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('common:createBot.form.telegram.botMode')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTelegramMode('managed')}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                        telegramMode === 'managed'
                          ? 'border-emerald-400 bg-emerald-50/80 shadow-sm'
                          : 'border-gray-200 bg-gray-50/50 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          telegramMode === 'managed' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                        }`}>
                          {telegramMode === 'managed' && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{t('common:createBot.form.telegram.managed.title')}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pl-6">{t('common:createBot.form.telegram.managed.description')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTelegramMode('custom')}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                        telegramMode === 'custom'
                          ? 'border-sky-400 bg-sky-50/80 shadow-sm'
                          : 'border-gray-200 bg-gray-50/50 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          telegramMode === 'custom' ? 'border-sky-500 bg-sky-500' : 'border-gray-300'
                        }`}>
                          {telegramMode === 'custom' && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{t('common:createBot.form.telegram.custom.title')}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pl-6">{t('common:createBot.form.telegram.custom.description')}</p>
                    </button>
                  </div>
                </div>

                {/* Telegram Group ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegramGroupId" className="text-sm font-semibold text-gray-700">
                      {t('common:createBot.form.telegram.groupId')}
                    </Label>
                    <button
                      type="button"
                      onClick={() => showHelp('group-id')}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t('common:createBot.form.telegram.groupIdHowTo')}
                    </button>
                  </div>
                  <Input
                    id="telegramGroupId"
                    placeholder={t('common:createBot.form.telegram.groupIdPlaceholder')}
                    value={telegramGroupId}
                    onChange={(e) => setTelegramGroupId(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    {t('common:createBot.form.telegram.groupIdHelp')}
                  </p>
                </div>

                {/* Custom Bot Token */}
                {telegramMode === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="telegramBotToken" className="text-sm font-semibold text-gray-700">
                        {t('common:createBot.form.telegram.botToken')}
                      </Label>
                      <button
                        type="button"
                        onClick={() => showHelp('telegram-bot')}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        {t('common:createBot.form.telegram.botTokenHowTo')}
                      </button>
                    </div>
                    <Input
                      id="telegramBotToken"
                      placeholder={t('common:createBot.form.telegram.botTokenPlaceholder')}
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      disabled={loading}
                      type="password"
                      className="h-11 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-sky-400/20"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      {t('common:createBot.form.telegram.botTokenHelp')}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="gap-2 h-11 rounded-xl border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('common:createBot.actions.back')}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex-1 gap-2 h-11 rounded-xl font-semibold ${
                    type === 'PREMIUM' ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' :
                    type === 'BASIC' ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700' :
                    'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                >
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
            </motion.div>
          )}

          </div>
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
