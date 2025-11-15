import { useEffect } from 'react';
import { Widget } from './components/widget/Widget';
import { useChatStore } from './store/chatStore';

function App() {
  const { setConfig, setActiveSkin } = useChatStore();

  useEffect(() => {
    // Configure widget for layout1 testing
    setConfig({
      titleOpen: "🤖 Layout1 Test",
      introMessage: "Testing layout1 smooth animations! Click X or backdrop to close.",
      mainColor: "#9F7AEA",
      desktopHeight: 600,
      desktopWidth: 450,
      skin: "layout1"
    });
    setActiveSkin("layout1");
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Layout1 Animation Test
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
          Testing smooth slide animations for Layout1 skin.
        </p>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Test Instructions</h2>
          <ol style={{ paddingLeft: '24px', lineHeight: '1.8' }}>
            <li>Click the floating button (bottom right) to open widget</li>
            <li><strong>Watch opening animation:</strong> Panel should smoothly slide in from right (0.35s)</li>
            <li>Click X button or click backdrop to close</li>
            <li><strong>Watch closing animation:</strong> Panel should smoothly slide out to right (0.3s)</li>
          </ol>
        </div>

        <div style={{ background: '#ecfdf5', padding: '24px', borderRadius: '12px', border: '1px solid #10b981' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#065f46' }}>Expected Results</h3>
          <ul style={{ paddingLeft: '24px', lineHeight: '1.8', color: '#047857' }}>
            <li>✅ Panel slides in from right with smooth easing</li>
            <li>✅ Backdrop fades in simultaneously</li>
            <li>✅ Panel slides out to right on close</li>
            <li>✅ Backdrop fades out simultaneously</li>
            <li>✅ No flickering or jumping</li>
            <li>✅ GPU-accelerated (smooth 60fps)</li>
          </ul>
        </div>
      </div>

      {/* Chat Widget */}
      <Widget
        chatId="demo-chat"
        userId="W-Guest-test-123"
        host="http://localhost:3000"
      />
    </div>
  );
}

export default App;
