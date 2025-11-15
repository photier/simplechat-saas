# @simplechat/widget

Official React component for SimpleChat widget integration.

## Installation

```bash
npm install @simplechat/widget
# or
yarn add @simplechat/widget
# or
pnpm add @simplechat/widget
```

## Usage

### Basic Example

```tsx
import { SimpleChatWidget } from '@simplechat/widget';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <SimpleChatWidget
        chatId="bot_abc123"
        type="basic"
      />
    </div>
  );
}
```

### Premium Widget

```tsx
<SimpleChatWidget
  chatId="bot_xyz789"
  type="premium"
  locale="tr"
/>
```

### With Custom Configuration

```tsx
<SimpleChatWidget
  chatId="bot_abc123"
  type="basic"
  locale="en"
  mainColor="#FF5733"
  titleOpen="🤖 AI Assistant"
  titleClosed="Chat with us"
  introMessage="Hello! How can I help you today?"
  placeholder="Type your message..."
  desktopHeight={700}
  desktopWidth={400}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chatId` | `string` | **required** | Your bot's chat ID (e.g., 'bot_abc123') |
| `type` | `'basic' \| 'premium'` | `'basic'` | Widget type |
| `locale` | `string` | `'auto'` | Language code ('auto', 'en', 'tr', etc.) |
| `mainColor` | `string` | `undefined` | Custom main color (hex code) |
| `titleOpen` | `string` | `undefined` | Title when widget is open |
| `titleClosed` | `string` | `undefined` | Title when widget is closed |
| `introMessage` | `string` | `undefined` | Welcome message |
| `placeholder` | `string` | `undefined` | Input placeholder text |
| `desktopHeight` | `number` | `600` | Widget height on desktop (px) |
| `desktopWidth` | `number` | `380` | Widget width on desktop (px) |
| `apiKey` | `string` | `undefined` | Custom API key (optional) |

## Framework Examples

### Next.js (App Router)

```tsx
'use client';

import { SimpleChatWidget } from '@simplechat/widget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SimpleChatWidget chatId="bot_abc123" type="basic" />
      </body>
    </html>
  );
}
```

### Next.js (Pages Router)

```tsx
// pages/_app.tsx
import { SimpleChatWidget } from '@simplechat/widget';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SimpleChatWidget chatId="bot_abc123" type="basic" />
    </>
  );
}
```

### Gatsby

```tsx
// gatsby-browser.js
import React from 'react';
import { SimpleChatWidget } from '@simplechat/widget';

export const wrapPageElement = ({ element }) => (
  <>
    {element}
    <SimpleChatWidget chatId="bot_abc123" type="basic" />
  </>
);
```

### Vue 3

```vue
<template>
  <div id="app">
    <SimpleChatWidget chatId="bot_abc123" type="basic" />
  </div>
</template>

<script setup>
import { SimpleChatWidget } from '@simplechat/widget/vue';
</script>
```

## TypeScript Support

This package includes TypeScript definitions. No additional `@types` package needed.

```tsx
import { SimpleChatWidget, SimpleChatWidgetProps } from '@simplechat/widget';

const config: SimpleChatWidgetProps = {
  chatId: 'bot_abc123',
  type: 'premium',
  locale: 'tr',
};

<SimpleChatWidget {...config} />
```

## License

MIT

## Support

- Documentation: https://docs.simplechat.bot
- Email: support@simplechat.bot
- GitHub: https://github.com/photier/simplechat-saas
