import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, Plus, Send, GripVertical, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

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
    content: 'Hello! How can I help you today? ✨',
    emoji: '👋',
  },
  {
    id: '2',
    type: 'message',
    order: 2,
    content: 'May I have your name?',
    emoji: '🙂',
  },
  {
    id: '3',
    type: 'redirect',
    order: 3,
    content: 'Thank you! Connecting you to our team...',
    emoji: '👤',
  },
];

const POPULAR_EMOJIS = ['👋', '💬', '🙂', '📧', '👤', '✨', '🎯', '💡', '🚀', '✅', '❓', '📝'];

// Sortable Step Card Component
function SortableStepCard({
  step,
  index,
  totalSteps,
  onUpdate,
  onDelete,
  isEditing,
  setEditing,
}: {
  step: ConversationStep;
  index: number;
  totalSteps: number;
  onUpdate: (id: string, field: keyof ConversationStep, value: any) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  setEditing: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      {/* Step Card */}
      <div className={`bg-white rounded-xl border-2 ${isDragging ? 'border-blue-400 shadow-2xl' : 'border-gray-200'} overflow-hidden hover:border-blue-300 transition-all relative`}>
        {/* Drag Handle */}
        <div className="absolute left-2 top-4 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="size-5 text-gray-400 hover:text-gray-600" />
        </div>

        <div className="p-4 pl-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{step.emoji || '💬'}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shadow-sm">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {step.type === 'redirect' ? 'Redirect to Support' : 'Message'}
                </span>
              </div>
            </div>

            {/* Delete Button */}
            {totalSteps > 1 && (
              <button
                onClick={() => onDelete(step.id)}
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
            onChange={(e) => onUpdate(step.id, 'content', e.target.value)}
            onFocus={() => setEditing(step.id)}
            onBlur={() => setEditing(null)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-medium"
            placeholder="Enter message content..."
            rows={2}
            maxLength={300}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {step.content.length}/300
            </span>

            {/* Emoji Picker */}
            <div className="flex items-center gap-1">
              {POPULAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onUpdate(step.id, 'emoji', emoji)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all ${
                    step.emoji === emoji ? 'bg-blue-50 ring-2 ring-blue-500 scale-110' : ''
                  }`}
                  title={`Use ${emoji}`}
                >
                  <span className="text-base">{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Arrow (bottom of card) */}
        {index < totalSteps - 1 && (
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white rounded-full p-1 shadow-md border-2 border-blue-200">
              <ArrowDown className="size-3 text-blue-500" />
            </div>
          </div>
        )}
      </div>

      {/* User Reply Card (except after last step) */}
      {index < totalSteps - 1 && (
        <div className="flex items-center justify-center py-4 relative">
          {/* Connecting Line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-blue-300 to-gray-300 transform -translate-x-1/2" />

          {/* User Reply Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border-2 border-gray-200 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-sm">
              <MessageCircle className="size-4 text-white" />
            </div>
            <span className="text-sm text-gray-700 font-semibold">User replies...</span>
          </motion.div>

          {/* Bottom Arrow */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white rounded-full p-1 shadow-md border-2 border-gray-200">
              <ArrowDown className="size-3 text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConversationFlowModal({ isOpen, onClose, botId, initialFlow, onSave }: ConversationFlowModalProps) {
  const { t, i18n } = useTranslation('common');
  const [steps, setSteps] = useState<ConversationStep[]>(
    initialFlow || (i18n.language === 'tr' ? [
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
    ] : DEFAULT_STEPS)
  );
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order
        return newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    }
  };

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
    if (steps.length <= 1) return;

    const filtered = steps.filter(s => s.id !== id);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reordered);
  };

  const handleUpdateStep = (id: string, field: keyof ConversationStep, value: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    const hasEmptyContent = steps.some(s => !s.content.trim());
    if (hasEmptyContent) {
      alert(i18n.language === 'tr' ? 'Lütfen tüm mesaj alanlarını doldurun.' : 'Please fill in all message fields.');
      return;
    }

    setSaving(true);
    try {
      await onSave(steps);
      onClose();
    } catch (error) {
      console.error('Failed to save conversation flow:', error);
      alert(i18n.language === 'tr' ? 'Kaydetme başarısız. Lütfen tekrar deneyin.' : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 bg-gray-50">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            {i18n.language === 'tr' ? 'Konuşma Akışı Oluşturucu' : 'Conversation Flow Builder'}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {i18n.language === 'tr'
              ? 'Kullanıcılarınızla otomatik konuşma akışını tasarlayın (Max 5 mesaj)'
              : 'Design automated conversation flow with your users (Max 5 messages)'}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Editor Panel - Left */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <SortableStepCard
                      key={step.id}
                      step={step}
                      index={index}
                      totalSteps={steps.length}
                      onUpdate={handleUpdateStep}
                      onDelete={handleDeleteStep}
                      isEditing={editingId === step.id}
                      setEditing={setEditingId}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>

            {/* Add Step Button */}
            {steps.length < 5 && (
              <motion.button
                onClick={handleAddStep}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="size-5" />
                {i18n.language === 'tr'
                  ? `Mesaj Ekle (${steps.length}/5)`
                  : `Add Message (${steps.length}/5)`}
              </motion.button>
            )}
          </div>

          {/* Preview Panel - Right */}
          <div className="w-96 bg-gradient-to-br from-gray-100 to-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="size-4" />
              {i18n.language === 'tr' ? 'Canlı Önizleme' : 'Live Preview'}
            </h3>

            {/* Widget Preview */}
            <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-2xl">
              {/* Widget Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3.5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">AI Assistant</p>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-3 min-h-[320px] max-h-[420px] overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    {/* Bot Message */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs shrink-0 shadow-md">
                        <span className="text-sm">{step.emoji || '🤖'}</span>
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-md max-w-[85%] border border-gray-100">
                        <p className="text-xs text-gray-800 leading-relaxed">
                          {step.content || <span className="text-gray-400 italic">(Empty message)</span>}
                        </p>
                      </div>
                    </motion.div>

                    {/* User Reply Preview */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.05 }}
                        className="flex items-start gap-2 justify-end mt-2"
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-md max-w-[85%]">
                          <p className="text-xs font-medium">
                            {index === 0 ? (i18n.language === 'tr' ? 'Merhaba!' : 'Hello!') :
                             index === 1 ? 'Tolga' :
                             'tolga@example.com'}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xs shrink-0 shadow-md">
                          <span className="text-sm">👤</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Widget Input */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    placeholder={i18n.language === 'tr' ? 'Mesajınızı yazın...' : 'Type your message...'}
                    className="flex-1 bg-transparent text-xs text-gray-500 outline-none"
                    disabled
                  />
                  <Send className="size-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong className="font-semibold">💡 {i18n.language === 'tr' ? 'İpucu:' : 'Tip:'}</strong> {i18n.language === 'tr'
                  ? 'Mesajları sürükleyip sıralamayı değiştirebilirsiniz.'
                  : 'Drag messages to reorder the conversation flow.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0 bg-white">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            {i18n.language === 'tr' ? 'İptal' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
          >
            {saving ? (i18n.language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (i18n.language === 'tr' ? 'Kaydet ve Aktifleştir' : 'Save & Activate')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
