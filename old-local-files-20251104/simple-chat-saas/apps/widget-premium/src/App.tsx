import { Widget } from './components/widget/Widget';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Premium Widget Demo
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
          This is a demo page showing the Premium React chat widget with dual-tab system in action.
        </p>

        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Features</h2>
          <ul style={{ paddingLeft: '24px' }}>
            <li>Dual-Tab System (AI Bot + Live Support)</li>
            <li>Separate conversation histories per tab</li>
            <li>Real-time messaging with Socket.io</li>
            <li>Markdown support in messages</li>
            <li>LocalStorage persistence (per tab)</li>
            <li>Mobile responsive</li>
            <li>Type-safe with TypeScript</li>
            <li>Smooth animations</li>
          </ul>
        </div>
      </div>

      {/* Chat Widget */}
      <Widget
        chatId="premium-demo-001"
        userId={'P-guest-' + Math.random().toString(36).substring(2, 9)}
        host="http://localhost:3001"
        CustomData={{
          page: 'premium-demo',
          version: 'premium',
          timestamp: new Date().toISOString()
        }}
      />
    </div>
  );
}

export default App;
