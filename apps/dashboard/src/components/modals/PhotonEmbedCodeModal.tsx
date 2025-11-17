import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotonEmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetType: 'normal' | 'premium';
}

export function PhotonEmbedCodeModal({ isOpen, onClose, widgetType }: PhotonEmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPremium = widgetType === 'premium';
  const chatId = '1665241968'; // Photier's chat ID
  const host = isPremium
    ? 'https://p-chat.simplechat.bot'
    : 'https://chat.simplechat.bot';
  const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';
  const widgetName = isPremium ? 'Premium Widget' : 'Normal Widget';

  // CDN Code (Shadow DOM optimized - no CSS link needed)
  const embedCode = `<script>
(function() {
  window.simpleChatConfig = {
    chatId: "${chatId}",
    userId: "${prefix}" + Math.random().toString(36).substr(2, 9),
    host: "${host}",
    titleOpen: "${isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot'}",
    introMessage: "Hello, How can I help you today? ✨",
    mainColor: "${isPremium ? '#9F7AEA' : '#4c86f0'}",
    desktopHeight: 600,
    desktopWidth: 380
  };
  var s = document.createElement('script');
  s.src = '${host}/js/simple-chat${isPremium ? '-premium' : ''}.min.js?v=' + Date.now();
  s.async = true;
  document.body.appendChild(s);
})();
</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{widgetName} - Embed Code</h2>
            <p className="text-sm text-gray-600 mt-1">
              Copy and paste this code into your website
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className={`${
              isPremium ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
            } border rounded-lg p-4`}>
              <h3 className={`font-medium ${isPremium ? 'text-purple-900' : 'text-blue-900'} mb-2`}>
                ✅ Installation Instructions
              </h3>
              <p className={`text-sm ${isPremium ? 'text-purple-800' : 'text-blue-800'}`}>
                Copy the code below and paste it just before the closing <code className={`${isPremium ? 'bg-purple-100' : 'bg-blue-100'} px-1 rounded`}>&lt;/body&gt;</code> tag in your HTML.
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

            {isPremium && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  <strong>Premium Features:</strong> Dual-tab system (AI Bot + Live Support), Telegram integration for manual replies
                </p>
              </div>
            )}
          </div>

          {/* Code Block */}
          <div className="mt-6">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                <code>{embedCode}</code>
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
              <p>Shadow DOM enabled - CSS isolation guaranteed 🔒</p>
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
