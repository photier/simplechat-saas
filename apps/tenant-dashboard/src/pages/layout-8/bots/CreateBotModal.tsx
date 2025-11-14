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
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { Bot, Sparkles, Users, Gift, Check, ArrowLeft } from 'lucide-react';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (bot: any) => void;
}

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<'BASIC' | 'PREMIUM' | 'FREE'>('FREE');
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (selectedType: 'BASIC' | 'PREMIUM' | 'FREE') => {
    setType(selectedType);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a bot name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Bot name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);

      const botType = type === 'FREE' ? 'BASIC' : type;
      const result = await chatbotService.create({
        name: name.trim(),
        type: botType,
      });

      if (type === 'FREE') {
        await chatbotService.purchase(result.id);
        toast.success(`🎉 Bot "${result.name}" activated with 7-day free trial!`);
      } else {
        toast.success(`Bot "${result.name}" created successfully!`);
      }

      onOpenChange(false);
      setName('');
      setType('FREE');
      setStep(1);
      onSuccess(result);
    } catch (error: any) {
      toast.error('Failed to create bot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setName('');
    setType('FREE');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="w-6 h-6 text-blue-600" />
            {step === 1 ? 'Choose Your Plan' : 'Bot Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Select a plan to get started. You can always upgrade later.'
              : `Creating ${type === 'FREE' ? 'FREE 7-Day Trial' : type} bot`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          // STEP 1: Plan Selection
          <div className="space-y-4 py-6">
            {/* Top Row: BASIC & PREMIUM */}
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

            {/* Bottom Row: FREE TRIAL */}
            <button
              type="button"
              onClick={() => handlePlanSelect('FREE')}
              className="w-full p-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 hover:shadow-lg hover:border-green-400 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/30 to-transparent rounded-full -ml-12 -mb-12"></div>

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    🎁 FREE 7-Day Trial
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Start with a <span className="font-semibold">BASIC plan</span> for 7 days - completely free!
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      No credit card required
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
        ) : (
          // STEP 2: Bot Name
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
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
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                Give your bot a descriptive name (minimum 2 characters)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 gap-2"
              >
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
