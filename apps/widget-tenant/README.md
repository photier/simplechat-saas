# SimpleChat React Widget

Modern, production-ready chat widget built with **React 19**, **TypeScript 5**, **Vite 7**, and **Zustand**.

## ✨ Features

- ⚡ **Modern Stack**: React 19, TypeScript 5, Vite 7, Zustand
- 🎨 **Beautiful UI**: Apple Messages-inspired design with smooth animations
- 📱 **Responsive**: Optimized for mobile and desktop
- 💾 **Persistent**: Messages saved to localStorage
- 🔄 **Real-time**: Socket.io integration
- 📝 **Rich Text**: Markdown support (bold, italic, links, lists)
- 🎯 **Type-safe**: Full TypeScript coverage
- 📦 **Production Ready**: Minified bundle (191 KB gzipped)

## 🚀 Quick Start

### Build

```bash
npm install
npm run build
```

Generates:
- `dist/simple-chat.min.js` (620 KB / 191 KB gzipped)
- `dist/simple-chat.css` (3 KB / 1.12 KB gzipped)

### Embed

```html
<script>
  window.simpleChatConfig = {
    chatId: 'your-chat-id',
    userId: 'guest-' + Math.random().toString(36).substr(2, 9),
    host: 'https://your-server.com'
  };
</script>
<script src="https://your-cdn.com/simple-chat.min.js"></script>
```

## 📝 Configuration

### Required

```typescript
{
  chatId: string;   // Unique chat ID
  userId: string;   // User ID (e.g., "guest-abc123")
  host: string;     // Chat server URL
}
```

### Optional

```typescript
{
  mainColor?: string;              // Theme color (default: '#9F7AEA')
  titleOpen?: string;              // Header title (default: "Let's chat!")
  titleClosed?: string;            // Button title (default: 'Click to chat!')
  introMessage?: string;           // Welcome message
  placeholderText?: string;        // Input placeholder
  desktopHeight?: number;          // Widget height (default: 600)
  desktopWidth?: number;           // Widget width (default: 370)
  displayMessageTime?: boolean;    // Show timestamps (default: true)
  CustomData?: Record<string, unknown>; // Custom metadata
}
```

## 🛠 Development

```bash
npm run dev  # Start dev server at http://localhost:5173
npm run build # Build for production
npm run preview # Preview production build
```

## 📂 Project Structure

```
src/
├── components/
│   ├── chat/          # Chat UI components
│   └── widget/        # Widget wrapper components
├── hooks/             # Custom hooks (useSocket)
├── store/             # Zustand store
├── lib/               # Utilities
├── types.ts           # TypeScript definitions
├── embed.ts           # Entry point (embedding script)
└── index.css          # Global styles
```

## 📊 Bundle Size

- **JS**: 620 KB (191 KB gzipped)
- **CSS**: 3 KB (1.12 KB gzipped)
- **Total**: 623 KB (192 KB gzipped)

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🔧 Technical Details

- **State Management**: Zustand
- **Real-time**: Socket.io Client 4.8+
- **Styling**: Vanilla CSS (no framework)
- **Build Tool**: Vite 7 (library mode)
- **Minification**: Terser

## 📄 License

MIT

---

Built with ❤️ using React, Vite, and modern web technologies.
