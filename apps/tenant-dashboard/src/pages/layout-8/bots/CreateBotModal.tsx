import { useState, useEffect } from 'react';
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
import { Bot, Sparkles, Users, Gift, Check, ArrowLeft, HelpCircle, CreditCard, Bitcoin } from 'lucide-react';
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
type PaymentMethod = 'card' | 'crypto';

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Plan
  const [type, setType] = useState<BotType>('FREE');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

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
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
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

    // If FREE trial, create bot directly and activate trial
    if (type === 'FREE') {
      try {
        setLoading(true);

        const config = {
          websiteUrl,
          aiInstructions: 'You are a helpful customer support assistant. Be friendly, concise, and helpful.',
          telegramMode,
          telegramGroupId,
          ...(telegramMode === 'custom' && { telegramBotToken }),
        };

        const result = await chatbotService.create({
          name: name.trim(),
          type: 'BASIC',
          config,
        });

        if (result.warning?.type === 'TELEGRAM_GROUP_CONFLICT') {
          toast.warning(result.warning.message, {
            duration: 8000,
            description: `Deactivated: ${result.warning.deactivatedBot.name} (${result.warning.deactivatedBot.chatId})`,
          });
        }

        await chatbotService.purchase(result.id);
        toast.success('🎉 ' + t('common:createBot.success.trialActivated', { name: result.name }));
        onOpenChange(false);
        resetForm();
        onSuccess(result);
      } catch (error: any) {
        toast.error(t('common:createBot.errors.createFailed') + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    } else {
      // BASIC/PREMIUM: Save to session and go to payment step
      const draftBot = {
        name: name.trim(),
        type,
        websiteUrl,
        telegramMode,
        telegramGroupId,
        ...(telegramMode === 'custom' && { telegramBotToken }),
      };
      sessionStorage.setItem('draftBot', JSON.stringify(draftBot));
      setStep(3);
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
                    {step === 3 && 'Select Payment Method'}
                  </DialogTitle>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1 ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4" strokeWidth={3} /> : '1'}
                </div>
                <div className={`w-6 h-1 rounded transition-all ${step >= 2 ? 'bg-sky-500' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2 ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > 2 ? <Check className="w-4 h-4" strokeWidth={3} /> : '2'}
                </div>
                <div className={`w-6 h-1 rounded transition-all ${step >= 3 ? 'bg-sky-500' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 3 ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  3
                </div>
              </div>
            </div>

            <DialogDescription className="text-sm text-gray-600">
              {step === 1 && t('common:createBot.steps.selectPlan')}
              {step === 2 && t('common:createBot.steps.enterDetails')}
              {step === 3 && 'Choose how you want to pay for your subscription'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">

          {/* STEP 1: Plan Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-2"
            >
              {/* BASIC & PREMIUM - Large cards on top */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BASIC */}
                <motion.button
                  type="button"
                  onClick={() => handlePlanSelect('BASIC')}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-6 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-300 hover:shadow-xl transition-all text-left group overflow-hidden"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <Sparkles className="w-8 h-8 text-sky-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-sky-600">{t('common:createBot.plans.basic.price')}</div>
                        <div className="text-xs text-gray-500 font-medium">{t('common:createBot.plans.basic.perMonth')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('common:createBot.plans.basic.title')}</h3>
                      <p className="text-sm text-gray-600 mb-4">Perfect for small businesses</p>

                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-sky-600" strokeWidth={3} />
                          </div>
                          {t('common:createBot.plans.basic.features.aiResponses')}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-sky-600" strokeWidth={3} />
                          </div>
                          {t('common:createBot.plans.basic.features.unlimitedConversations')}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-sky-600" strokeWidth={3} />
                          </div>
                          {t('common:createBot.plans.basic.features.analytics')}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* PREMIUM */}
                <motion.button
                  type="button"
                  onClick={() => handlePlanSelect('PREMIUM')}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-6 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-300 hover:shadow-xl transition-all text-left group overflow-hidden"
                >
                  {/* Recommended Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-1.5 rounded-bl-2xl text-xs font-bold shadow-md">
                    ⭐ Recommended
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <Users className="w-8 h-8 text-violet-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-violet-600">{t('common:createBot.plans.premium.price')}</div>
                        <div className="text-xs text-gray-500 font-medium">{t('common:createBot.plans.premium.perMonth')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('common:createBot.plans.premium.title')}</h3>
                      <p className="text-sm text-gray-600 mb-4">Full-featured support solution</p>

                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-violet-600" strokeWidth={3} />
                          </div>
                          <span className="font-semibold">{t('common:createBot.plans.premium.features.everythingBasic')}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-violet-600" strokeWidth={3} />
                          </div>
                          {t('common:createBot.plans.premium.features.dualTab')}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-violet-600" strokeWidth={3} />
                          </div>
                          {t('common:createBot.plans.premium.features.telegram')}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-500 font-medium">or try for free</span>
                </div>
              </div>

              {/* FREE TRIAL - Compact card at bottom */}
              <motion.button
                type="button"
                onClick={() => handlePlanSelect('FREE')}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:border-emerald-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <Gift className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{t('common:createBot.plans.free.heading')}</h3>
                      <p className="text-xs text-gray-600">{t('common:createBot.plans.free.features.noCard')} • {t('common:createBot.plans.free.duration')}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t('common:createBot.plans.free.badge')}
                  </div>
                </div>
              </motion.button>
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

          {/* STEP 3: Payment Selection */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5 py-2"
            >
              {/* Selected Plan Summary */}
              <div className={`p-4 rounded-xl border-2 ${
                type === 'PREMIUM' ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200' :
                'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {type === 'PREMIUM' ? (
                        <Users className="w-5 h-5 text-violet-600" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{name}</h4>
                      <p className="text-sm text-gray-600">
                        {type === 'PREMIUM' ? t('common:createBot.plans.premium.title') : t('common:createBot.plans.basic.title')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${type === 'PREMIUM' ? 'text-violet-600' : 'text-sky-600'}`}>
                    {type === 'PREMIUM' ? t('common:createBot.plans.premium.price') : t('common:createBot.plans.basic.price')}
                    <span className="text-sm text-gray-500 font-normal">/mo</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Choose Payment Method</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Card Payment (Paddle) */}
                  <motion.button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-sky-400 bg-sky-50/80 shadow-lg'
                        : 'border-gray-200 bg-gray-50/50 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === 'card' ? 'border-sky-500 bg-sky-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-5 h-5 text-sky-600" />
                          <h4 className="font-bold text-gray-900">Credit / Debit Card</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          Pay securely with Visa, Mastercard, American Express, or Discover
                        </p>
                      </div>
                    </div>

                    {/* Supported Cards */}
                    <div className="flex items-center gap-2 pl-8">
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">VISA</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">MC</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">AMEX</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">DISC</div>
                    </div>
                  </motion.button>

                  {/* Crypto Payment (NOWPayments) */}
                  <motion.button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-orange-400 bg-orange-50/80 shadow-lg'
                        : 'border-gray-200 bg-gray-50/50 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === 'crypto' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'crypto' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Bitcoin className="w-5 h-5 text-orange-600" />
                          <h4 className="font-bold text-gray-900">Cryptocurrency</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          Pay with Bitcoin, Ethereum, USDT, and 100+ cryptocurrencies
                        </p>
                      </div>
                    </div>

                    {/* Supported Cryptos */}
                    <div className="flex items-center gap-2 pl-8">
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-orange-600">BTC</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-blue-600">ETH</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-green-600">USDT</div>
                      <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">+100</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
                  </div>
                  <span>
                    🔒 Secure checkout powered by {paymentMethod === 'card' ? 'Paddle' : 'NOWPayments'} •
                    SSL encrypted • Cancel anytime
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="gap-2 h-11 rounded-xl border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    // Create bot and proceed to payment
                    try {
                      setLoading(true);
                      const draftData = JSON.parse(sessionStorage.getItem('draftBot') || '{}');

                      const config = {
                        websiteUrl: draftData.websiteUrl,
                        aiInstructions: 'You are a helpful customer support assistant. Be friendly, concise, and helpful.',
                        telegramMode: draftData.telegramMode,
                        telegramGroupId: draftData.telegramGroupId,
                        ...(draftData.telegramMode === 'custom' && { telegramBotToken: draftData.telegramBotToken }),
                      };

                      const result = await chatbotService.create({
                        name: draftData.name,
                        type: draftData.type,
                        config,
                      });

                      if (result.warning?.type === 'TELEGRAM_GROUP_CONFLICT') {
                        toast.warning(result.warning.message, {
                          duration: 8000,
                          description: `Deactivated: ${result.warning.deactivatedBot.name}`,
                        });
                      }

                      toast.success(t('common:createBot.success.botCreated', { name: result.name }));
                      setCreatedBot(result);

                      // Clear draft
                      sessionStorage.removeItem('draftBot');

                      // Open payment modal
                      setPaymentModalOpen(true);
                    } catch (error: any) {
                      toast.error(t('common:createBot.errors.createFailed') + (error.response?.data?.message || error.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className={`flex-1 gap-2 h-11 rounded-xl font-semibold ${
                    paymentMethod === 'crypto'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                      : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? <CreditCard className="w-4 h-4" /> : <Bitcoin className="w-4 h-4" />}
                      Continue to Payment
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
