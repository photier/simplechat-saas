import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatbotService } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { Bot, Sparkles, Users } from 'lucide-react';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (bot: any) => void;
}

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'BASIC' | 'PREMIUM'>('BASIC');
  const [loading, setLoading] = useState(false);

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
      const result = await chatbotService.create({
        name: name.trim(),
        type,
      });

      toast.success(`Bot "${result.name}" created successfully!`);
      onOpenChange(false);
      setName('');
      setType('BASIC');
      onSuccess(result);
    } catch (error: any) {
      toast.error('Failed to create bot: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="w-6 h-6 text-blue-600" />
            Create New Chatbot
          </DialogTitle>
          <DialogDescription>
            Create a new chatbot for your website. Choose between Basic (AI-only) or Premium (AI + Live Support).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Bot Name */}
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

          {/* Bot Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Bot Type *</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* BASIC */}
              <button
                type="button"
                onClick={() => setType('BASIC')}
                disabled={loading}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${type === 'BASIC'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {type === 'BASIC' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">BASIC</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  AI-powered chat widget with automated responses
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">$9.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </button>

              {/* PREMIUM */}
              <button
                type="button"
                onClick={() => setType('PREMIUM')}
                disabled={loading}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${type === 'PREMIUM'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {type === 'PREMIUM' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900">PREMIUM</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  AI + Live Support with dual-tab interface
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">$19.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Create Bot
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
