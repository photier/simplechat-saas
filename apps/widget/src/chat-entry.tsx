import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWindow } from './components/chat/ChatWindow';
import './index.css';

// Parse URL parameters
const params = new URLSearchParams(window.location.search);
const chatId = params.get('chatId') || 'default';
const userId = params.get('userId') || 'Guest-' + Math.random().toString(36).substring(7);
const host = params.get('host') || window.location.host;

// Render ChatWindow
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ChatWindow chatId={chatId} userId={userId} host={host} />
    </React.StrictMode>
  );
}
