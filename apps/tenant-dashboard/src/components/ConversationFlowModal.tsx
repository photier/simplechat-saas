import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, Plus, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationStep {
  id: string;
  type: 'message' | 'redirect';
  order: number;
  content: string;
  emoji?: string;
}

interface ConversationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: number;
  initialFlow?: ConversationStep[];
  onSave: (steps: ConversationStep[]) => Promise<void>;
}

const DEFAULT_STEPS: ConversationStep[] = [
  {
    id: '1',
    type: 'message',
    order: 1,
    content: 'Merhaba! Size nasıl yardımcı olabilirim? ✨',
    emoji: '👋',
  },
  {
    id: '2',
    type: 'message',
    order: 2,
    content: 'İsminizi öğrenebilir miyim?',
    emoji: '🙂',
  },
  {
    id: '3',
    type: 'redirect',
    order: 3,
    content: 'Teşekkürler! Sizi müşteri temsilcimize bağlıyorum...',
    emoji: '👤',
  },
];

const POPULAR_EMOJIS = ['👋', '💬', '🙂', '📧', '👤', '✨', '🎯', '💡', '🚀', '✅', '❓', '📝'];

export function ConversationFlowModal({ isOpen, onClose, botId, initialFlow, onSave }: ConversationFlowModalProps) {
  const [steps, setSteps] = useState<ConversationStep[]>(initialFlow || DEFAULT_STEPS);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddStep = () => {
    if (steps.length >= 5) return;

    const newStep: ConversationStep = {
      id: Date.now().toString(),
      type: 'message',
      order: steps.length + 1,
      content: '',
      emoji: '💬',
    };

    setSteps([...steps, newStep]);
    setEditingId(newStep.id);
  };

  const handleDeleteStep = (id: string) => {
    if (steps.length <= 1) return; // At least 1 step required

    const filtered = steps.filter(s => s.id !== id);
    // Reorder
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reordered);
  };

  const handleUpdateStep = (id: string, field: keyof ConversationStep, value: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    // Validation
    const hasEmptyContent = steps.some(s => !s.content.trim());
    if (hasEmptyContent) {
      alert('Lütfen tüm mesaj alanlarını doldurun.');
      return;
    }

    setSaving(true);
    try {
      await onSave(steps);
      onClose();
    } catch (error) {
      console.error('Failed to save conversation flow:', error);
      alert('Kaydetme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900">
            ✨ Conversation Flow Builder
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Kullanıcılarınızla otomatik konuşma akışını tasarlayın (Max 5 mesaj)
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Editor Panel - Left */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-all">
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{step.emoji || '💬'}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              {step.order}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {step.type === 'redirect' ? 'Redirect to Support' : 'Message'}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        {steps.length > 1 && (
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete step"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      {/* Content Textarea */}
                      <textarea
                        value={step.content}
                        onChange={(e) => handleUpdateStep(step.id, 'content', e.target.value)}
                        onFocus={() => setEditingId(step.id)}
                        onBlur={() => setEditingId(null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Mesaj içeriğini yazın..."
                        rows={2}
                        maxLength={300}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {step.content.length}/300
                        </span>

                        {/* Emoji Picker */}
                        <div className="flex items-center gap-1">
                          {POPULAR_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleUpdateStep(step.id, 'emoji', emoji)}
                              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
                                step.emoji === emoji ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                              }`}
                              title={`Use ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wait Indicator (except after last step) */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center justify-center py-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                        <Clock className="size-3 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">User replies...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Step Button */}
            {steps.length < 5 && (
              <motion.button
                onClick={handleAddStep}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="size-5" />
                Add Message ({steps.length}/5)
              </motion.button>
            )}
          </div>

          {/* Preview Panel - Right */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="size-4" />
              Live Preview
            </h3>

            {/* Widget Preview */}
            <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg">
              {/* Widget Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    🤖
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Assistant</p>
                    <p className="text-xs opacity-90">Online</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    {/* Bot Message */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0">
                        {step.emoji || '🤖'}
                      </div>
                      <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm max-w-[85%]">
                        <p className="text-xs text-gray-800">
                          {step.content || '(Empty message)'}
                        </p>
                      </div>
                    </div>

                    {/* User Reply Preview (except after last step) */}
                    {index < steps.length - 1 && (
                      <div className="flex items-start gap-2 justify-end mt-2">
                        <div className="bg-blue-500 text-white rounded-lg rounded-tr-none px-3 py-2 shadow-sm max-w-[85%]">
                          <p className="text-xs">
                            {index === 0 ? 'Merhaba!' : index === 1 ? 'Tolga' : 'tolga@example.com'}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs shrink-0">
                          👤
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Widget Input */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-xs text-gray-500 outline-none"
                    disabled
                  />
                  <Send className="size-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save & Activate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
