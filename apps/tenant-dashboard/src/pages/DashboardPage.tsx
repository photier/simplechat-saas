import { AddBotCard } from '@/components/AddBotCard';
import { PageTransition } from '@/components/PageTransition';

export default function DashboardPage() {

  return (
    <PageTransition>
      <div className="w-full mx-auto px-3 md:px-6 lg:px-12 pb-6 md:pb-12 overflow-x-hidden max-w-full">
        <div className="grid gap-4 md:gap-6 lg:gap-[25px]">
          {/* Welcome Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
                <p className="text-sm text-gray-500">Get started by creating your first chatbot</p>
              </div>
            </div>
          </div>

          {/* Add Bot Card */}
          <AddBotCard />

          {/* Coming Soon Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track conversations, response times, and user satisfaction</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Training</h3>
              <p className="text-sm text-gray-600">Customize your bot's knowledge base and responses</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Integrations</h3>
              <p className="text-sm text-gray-600">Connect with your favorite tools and platforms</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
