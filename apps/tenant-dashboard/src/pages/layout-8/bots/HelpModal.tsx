import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: 'telegram-bot' | 'group-id' | 'embed' | null;
}

export function HelpModal({ open, onOpenChange, topic }: HelpModalProps) {
  if (!topic) return null;

  const content = {
    'telegram-bot': {
      title: 'How to Create a Telegram Bot',
      steps: [
        {
          step: 1,
          title: 'Open Telegram and find @BotFather',
          description: 'Search for "@BotFather" in Telegram (official bot for creating bots)',
        },
        {
          step: 2,
          title: 'Send /newbot command',
          description: 'Start a chat with BotFather and send the /newbot command',
        },
        {
          step: 3,
          title: 'Choose a name for your bot',
          description: 'Example: "My Support Bot" (this is the display name users will see)',
        },
        {
          step: 4,
          title: 'Choose a username',
          description: 'Must end in "bot". Example: "mysupport_bot" or "MySupportBot"',
        },
        {
          step: 5,
          title: 'Copy the Bot Token',
          description: 'BotFather will give you a token like: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"',
          highlight: 'IMPORTANT: Keep this token secret! It\'s like a password for your bot.',
        },
      ],
      links: [
        {
          label: 'Official Telegram Bot Documentation',
          url: 'https://core.telegram.org/bots#3-how-do-i-create-a-bot',
        },
      ],
    },
    'group-id': {
      title: 'How to Find Telegram Group ID',
      steps: [
        {
          step: 1,
          title: 'Add your bot to the Telegram group',
          description: 'Go to your Telegram group → Group Info → Add Members → Search for your bot and add it',
        },
        {
          step: 2,
          title: 'Make the bot an admin (recommended)',
          description: 'Group Info → Administrators → Add Administrator → Select your bot',
        },
        {
          step: 3,
          title: 'Option A: Use a bot to get the ID',
          description: 'Add @getidsbot to your group. It will automatically send the group ID.',
        },
        {
          step: 4,
          title: 'Option B: Use Telegram API',
          description: 'Send a message in the group, then visit: https://api.telegram.org/bot<YourBotToken>/getUpdates',
          code: 'Look for "chat":{"id":-1001234567890} in the response',
        },
        {
          step: 5,
          title: 'Copy the Group ID',
          description: 'The ID will look like: -1001234567890 (starts with -100)',
          highlight: 'Group IDs always start with -100',
        },
      ],
      links: [
        {
          label: 'Telegram Group ID Guide',
          url: 'https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id',
        },
      ],
    },
    'embed': {
      title: 'How to Embed the Widget on Your Website',
      steps: [
        {
          step: 1,
          title: 'Copy the embed code',
          description: 'After creating your bot, you\'ll receive an embed code snippet',
        },
        {
          step: 2,
          title: 'Paste before closing </body> tag',
          description: 'Open your website\'s HTML file and paste the code just before the closing </body> tag',
          code: '<script>...</script>\n</body>',
        },
        {
          step: 3,
          title: 'For WordPress/Wix/Squarespace',
          description: 'Go to Settings → Custom Code/Scripts → Paste in Footer section',
        },
        {
          step: 4,
          title: 'For React/Next.js/Vue',
          description: 'Add the script to your _document.js, _app.js, or index.html file',
        },
        {
          step: 5,
          title: 'Test the widget',
          description: 'Refresh your website and you should see the chat widget in the bottom-right corner',
        },
      ],
      links: [
        {
          label: 'Installation Guide (Documentation)',
          url: '#', // TODO: Link to docs
        },
      ],
    },
  };

  const currentContent = content[topic];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{currentContent.title}</DialogTitle>
          <DialogDescription>
            Follow these step-by-step instructions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentContent.steps.map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.code && (
                  <pre className="bg-gray-100 p-2 rounded text-xs text-gray-800 overflow-x-auto mt-2">
                    {item.code}
                  </pre>
                )}
                {item.highlight && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-900 font-semibold">⚠️ {item.highlight}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {currentContent.links.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Helpful Links</h4>
              <div className="space-y-2">
                {currentContent.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
