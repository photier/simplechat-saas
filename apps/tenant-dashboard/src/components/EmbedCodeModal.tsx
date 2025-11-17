import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  botType: 'BASIC' | 'PREMIUM';
}

type TabType = 'cdn' | 'npm' | 'wordpress';

export function EmbedCodeModal({ isOpen, onClose, chatId, botType }: EmbedCodeModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cdn');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPremium = botType === 'PREMIUM';
  const host = isPremium
    ? `https://${chatId}.p.simplechat.bot`
    : `https://${chatId}.w.simplechat.bot`;
  const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';

  // CDN Code (Ultra minimal - single script tag)
  // CSS is automatically loaded via Shadow DOM (no manual <link> needed)
  const cdnCode = `<script>
(function() {
  window.simpleChatConfig = {
    chatId: "${chatId}",
    userId: "${prefix}" + Math.random().toString(36).substr(2, 9),
    host: "${host}"
  };
  var s = document.createElement('script');
  s.src = '${host}/js/simple-chat${isPremium ? '-premium' : ''}.min.js?v=' + Date.now();
  s.async = true;
  document.body.appendChild(s);
})();
</script>`;

  // NPM Code
  const npmCode = `# Install the package
npm install @simplechat/widget

# Import and initialize
import { SimpleChat } from '@simplechat/widget';
import '@simplechat/widget/dist/style.css';

SimpleChat.init({
  chatId: '${chatId}',
  host: '${host}'
});`;

  // WordPress Code
  const wordpressCode = `Coming Soon! 🚀

We're working on a WordPress plugin to make integration even easier.

For now, you can use the CDN method:
1. Go to Appearance → Theme Editor
2. Edit footer.php
3. Paste the CDN code before </body> tag`;

  const getCode = () => {
    switch (activeTab) {
      case 'cdn':
        return cdnCode;
      case 'npm':
        return npmCode;
      case 'wordpress':
        return wordpressCode;
      default:
        return cdnCode;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const tabs: { id: TabType; label: string; badge?: string }[] = [
    { id: 'cdn', label: 'CDN (Recommended)' },
    { id: 'npm', label: 'NPM', badge: 'Coming Soon' },
    { id: 'wordpress', label: 'WordPress', badge: 'Coming Soon' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Widget Embed Code</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose your integration method
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium transition-colors relative
                  ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* CDN Tab */}
          {activeTab === 'cdn' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">✅ Recommended Method</h3>
                <p className="text-sm text-blue-800">
                  This is the simplest way to add the widget to your website. Just copy and paste this code before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag in your HTML.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation Steps:
                </label>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Copy the code below</li>
                  <li>Open your website's HTML file</li>
                  <li>Paste the code just before the <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag</li>
                  <li>Save and refresh your website</li>
                </ol>
              </div>
            </div>
          )}

          {/* NPM Tab */}
          {activeTab === 'npm' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2">🚀 Coming Soon</h3>
                <p className="text-sm text-amber-800">
                  NPM package is currently in development. For now, please use the CDN method.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">The NPM package will support:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>React components</li>
                  <li>Vue components</li>
                  <li>TypeScript support</li>
                  <li>Framework-agnostic vanilla JS</li>
                </ul>
              </div>
            </div>
          )}

          {/* WordPress Tab */}
          {activeTab === 'wordpress' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">🔌 Coming Soon</h3>
                <p className="text-sm text-purple-800">
                  WordPress plugin is under development. In the meantime, you can use the CDN method with your theme editor.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2 font-medium">Temporary installation (using CDN):</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to <strong>Appearance → Theme Editor</strong></li>
                  <li>Select <strong>footer.php</strong></li>
                  <li>Paste the CDN code before <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code></li>
                  <li>Click <strong>Update File</strong></li>
                </ol>
              </div>
            </div>
          )}

          {/* Code Block */}
          <div className="mt-6">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                <code>{getCode()}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="size-4 text-green-400" />
                ) : (
                  <Copy className="size-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Need help? <a href="https://docs.simplechat.bot" className="text-blue-600 hover:underline">View Documentation</a></p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
