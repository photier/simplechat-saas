import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { Bot, Sparkles, Users, Gift, Check, ArrowLeft, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';
import { HelpModal } from './HelpModal';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (bot: any) => void;
}

type BotType = 'BASIC' | 'PREMIUM' | 'FREE';
type TelegramMode = 'managed' | 'custom';

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Plan
  const [type, setType] = useState<BotType>('FREE');

  // Step 2: Bot Details
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Telegram (Premium only)
  const [telegramMode, setTelegramMode] = useState<TelegramMode>('managed');
  const [telegramGroupId, setTelegramGroupId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');

  // Step 4: AI Config
  const [aiInstructions, setAiInstructions] = useState('You are a helpful customer support assistant. Be friendly, concise, and helpful.');

  // Help modal
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<'telegram-bot' | 'group-id' | 'embed' | null>(null);

  const showHelp = (topic: 'telegram-bot' | 'group-id' | 'embed') => {
    setHelpTopic(topic);
    setHelpModalOpen(true);
  };

  const handlePlanSelect = (selectedType: BotType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleNext = () => {
    // Validate current step
    if (step === 2) {
      if (!name.trim()) {
        toast.error('Please enter a bot name');
        return;
      }
      if (name.trim().length < 2) {
        toast.error('Bot name must be at least 2 characters');
        return;
      }

      // Skip telegram step for BASIC/FREE
      if (type === 'BASIC' || type === 'FREE') {
        setStep(4); // Jump to AI config
      } else {
        setStep(3); // Telegram setup
      }
    } else if (step === 3) {
      // Validate Telegram setup
      if (!telegramGroupId.trim()) {
        toast.error('Please enter Telegram Group ID');
        return;
      }
      if (telegramMode === 'custom' && !telegramBotToken.trim()) {
        toast.error('Please enter Bot Token for custom bot');
        return;
      }
      setStep(4);
    } else {
      setStep((step + 1) as any);
    }
  };

  const handleBack = () => {
    if (step === 4 && (type === 'BASIC' || type === 'FREE')) {
      setStep(2); // Skip telegram step
    } else {
      setStep((step - 1) as any);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare bot config
      const botType = type === 'FREE' ? 'BASIC' : type;
      const config = {
        websiteUrl,
        description,
        aiInstructions,
        ...(type === 'PREMIUM' && {
          telegramMode,
          telegramGroupId,
          ...(telegramMode === 'custom' && { telegramBotToken }),
        }),
      };

      const result = await chatbotService.create({
        name: name.trim(),
        type: botType,
        config,
      });

      // Auto-activate if FREE
      if (type === 'FREE') {
        await chatbotService.purchase(result.id);
        toast.success(`🎉 Bot "${result.name}" activated with 7-day free trial!`);
      } else {
        toast.success(`Bot "${result.name}" created successfully!`);
      }

      // Reset form
      onOpenChange(false);
      resetForm();
      onSuccess(result);
    } catch (error: any) {
      toast.error('Failed to create bot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setType('FREE');
    setName('');
    setWebsiteUrl('');
    setDescription('');
    setTelegramMode('managed');
    setTelegramGroupId('');
    setTelegramBotToken('');
    setAiInstructions('You are a helpful customer support assistant. Be friendly, concise, and helpful.');
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
              <Bot className="w-6 h-6 text-blue-600" />
              {step === 1 && 'Choose Your Plan'}
              {step === 2 && 'Bot Details'}
              {step === 3 && 'Telegram Setup'}
              {step === 4 && 'Review & Create'}
            </DialogTitle>
            <DialogDescription>
              Step {step} of {type === 'PREMIUM' ? 4 : 3}
              {' • '}
              {step === 1 && 'Select a plan to get started'}
              {step === 2 && 'Basic information about your bot'}
              {step === 3 && 'Connect your Telegram group'}
              {step === 4 && 'Review and finalize your bot'}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: Plan Selection */}
          {step === 1 && (
            <div className="space-y-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BASIC */}
                <button
                  type="button"
                  onClick={() => handlePlanSelect('BASIC')}
                  className="relative p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg hover:border-blue-300 transition-all text-left"
                >
                  <Sparkles className="w-6 h-6 text-blue-600 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">BASIC</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-gray-900">$9.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      AI-powered responses
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Unlimited conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Analytics dashboard
                    </li>
                  </ul>
                </button>

                {/* PREMIUM */}
                <button
                  type="button"
                  onClick={() => handlePlanSelect('PREMIUM')}
                  className="relative p-6 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg hover:border-purple-400 transition-all text-left"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    POPULAR
                  </div>
                  <Users className="w-6 h-6 text-purple-600 mb-3 mt-2" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">PREMIUM</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-gray-900">$19.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Everything in BASIC</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Dual-tab: AI + Live Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Telegram integration
                    </li>
                  </ul>
                </button>
              </div>

              {/* FREE TRIAL */}
              <button
                type="button"
                onClick={() => handlePlanSelect('FREE')}
                className="w-full p-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 hover:shadow-lg hover:border-green-400 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">🎁 FREE 7-Day Trial</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Start with a <span className="font-semibold">BASIC plan</span> for 7 days - completely free!
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        No credit card
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        Full BASIC features
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        Cancel anytime
                      </li>
                    </ul>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <div className="text-3xl font-bold text-green-600">FREE</div>
                    <div className="text-xs text-gray-600 text-center">7 days</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Bot Details */}
          {step === 2 && (
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Bot Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Sales Bot, Support Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-gray-500">Give your bot a descriptive name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl" className="text-sm font-semibold">
                  Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Where will this bot be embedded?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="What is this bot for? (e.g., Customer support for e-commerce site)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={loading} className="flex-1 gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Telegram Setup (Premium only) */}
          {step === 3 && (
            <div className="space-y-6 py-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900">
                  🔔 Connect your Telegram group to receive customer messages and reply in real-time!
                </p>
              </div>

              {/* Bot Mode Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Telegram Bot Mode *</Label>
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
                      <span className="font-semibold">Managed (Recommended)</span>
                    </div>
                    <p className="text-xs text-gray-600">Use our @MySimpleChat_Bot - no setup required!</p>
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
                      <span className="font-semibold">Custom Bot</span>
                    </div>
                    <p className="text-xs text-gray-600">Use your own Telegram bot</p>
                  </button>
                </div>
              </div>

              {/* Telegram Group ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="telegramGroupId" className="text-sm font-semibold">
                    Telegram Group ID *
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-blue-600"
                    onClick={() => showHelp('group-id')}
                  >
                    <HelpCircle className="w-4 h-4" />
                    How to find?
                  </Button>
                </div>
                <Input
                  id="telegramGroupId"
                  placeholder="-1001234567890"
                  value={telegramGroupId}
                  onChange={(e) => setTelegramGroupId(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Starts with -100 (e.g., -1001234567890)</p>
              </div>

              {/* Custom Bot Token */}
              {telegramMode === 'custom' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="telegramBotToken" className="text-sm font-semibold">
                      Bot Token *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-blue-600"
                      onClick={() => showHelp('telegram-bot')}
                    >
                      <HelpCircle className="w-4 h-4" />
                      How to create?
                    </Button>
                  </div>
                  <Input
                    id="telegramBotToken"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    disabled={loading}
                    type="password"
                  />
                  <p className="text-xs text-gray-500">Get from @BotFather on Telegram</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={loading} className="flex-1 gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Create */}
          {step === 4 && (
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="aiInstructions" className="text-sm font-semibold">
                  AI Instructions (optional)
                </Label>
                <Textarea
                  id="aiInstructions"
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="Customize how your AI assistant behaves..."
                />
                <p className="text-xs text-gray-500">
                  Define the personality and behavior of your AI assistant
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Summary</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-600">Plan:</span> <span className="font-semibold">{type}</span></p>
                  <p><span className="text-gray-600">Name:</span> {name}</p>
                  {websiteUrl && <p><span className="text-gray-600">Website:</span> {websiteUrl}</p>}
                  {type === 'PREMIUM' && (
                    <>
                      <p><span className="text-gray-600">Telegram Mode:</span> {telegramMode === 'managed' ? 'Managed (@MySimpleChat_Bot)' : 'Custom Bot'}</p>
                      <p><span className="text-gray-600">Group ID:</span> {telegramGroupId}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      {type === 'FREE' ? 'Start Free Trial' : 'Create Bot'}
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
    </>
  );
}
