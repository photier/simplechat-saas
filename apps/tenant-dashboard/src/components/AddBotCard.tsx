import { Plus } from 'lucide-react';

export function AddBotCard() {
  const handleAddBot = () => {
    // TODO: Navigate to bot creation flow (Phase 2)
    alert('Bot creation coming soon! This will be the multi-bot feature.');
  };

  return (
    <div className="col-span-full">
      <button
        onClick={handleAddBot}
        className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:from-blue-100/80 hover:to-purple-100/80 p-12 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Plus className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Create Your First Bot
            </h3>
            <p className="text-gray-600 max-w-md">
              Add a new chatbot to start serving your customers. You can create multiple bots with different configurations.
            </p>
          </div>

          {/* Badge */}
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✨ Basic Plan
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              🚀 Premium Plan
            </span>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </button>
    </div>
  );
}
