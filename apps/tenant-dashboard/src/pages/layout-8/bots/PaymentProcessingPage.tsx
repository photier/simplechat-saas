import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';

export function PaymentProcessingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const botId = searchParams.get('botId');

  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!botId) {
      navigate('/');
      return;
    }

    let isPolling = true;
    let isNavigating = false; // Prevent multiple navigations
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Poll for payment status every 3 seconds (webhook can take 10-15 seconds)
    const pollStatus = async () => {
      // Double-check: Don't poll if already stopped or navigating
      if (!isPolling || isNavigating) return;

      try {
        const result = await paymentService.checkPaymentStatus(botId);

        // Triple-check: Race condition guard
        if (!isPolling || isNavigating) return;

        // Check if payment succeeded
        if (result.status === 'active') {
          isPolling = false;
          isNavigating = true; // Lock navigation
          // CRITICAL: Stop polling immediately
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);

          setStatus('success');
          setTimeout(() => {
            // Use replace to avoid history pollution
            navigate(`/bots/${botId}/conversations`, { replace: true });
          }, 1500);
          return;
        }

        // Check if payment failed
        if (result.status === 'failed') {
          isPolling = false;
          isNavigating = true; // Lock navigation
          // CRITICAL: Stop polling immediately
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);

          setStatus('failed');
          return;
        }

        // Still processing - retry
        if (isPolling) { // Only update if still polling
          setRetryCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        if (isPolling) { // Only update if still polling
          setRetryCount(prev => prev + 1);
        }
      }
    };

    // Poll immediately and then every 3 seconds
    pollStatus();
    intervalId = setInterval(pollStatus, 3000);

    // Stop polling after 3 minutes (60 attempts × 3 seconds)
    // Webhook should arrive within 10-15 seconds in sandbox
    timeoutId = setTimeout(() => {
      isPolling = false;
      if (intervalId) clearInterval(intervalId);
      if (!isNavigating) {
        setStatus('failed');
      }
    }, 180000);

    return () => {
      isPolling = false;
      isNavigating = true;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [botId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        {status === 'processing' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground">Processing Payment</h2>
            <p className="text-muted-foreground">
              Your payment is being verified. This can take up to 3 minutes in sandbox mode.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span>Checking status ({retryCount}/60)</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your bot has been activated. Redirecting to conversations...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Payment Failed</h2>
            <p className="text-muted-foreground">
              We couldn't verify your payment. Please check your Iyzico account or try again.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Payment verification can take up to 3 minutes in sandbox mode.
            In production, this is usually instant.
          </p>
        </div>
      </div>
    </div>
  );
}
