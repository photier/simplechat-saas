import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { API_CONFIG } from '@/config';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: {
    id: string;
    name: string;
    type: 'BASIC' | 'PREMIUM';
  };
  onPaymentSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, bot, onPaymentSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const [checkoutFormContent, setCheckoutFormContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && bot) {
      initializePayment();
    }
  }, [open, bot]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          botId: bot.id,
          botName: bot.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();

      // Set the checkout form HTML content
      setCheckoutFormContent(data.checkoutFormContent);

      // Execute the Iyzico scripts manually (React doesn't execute scripts in dangerouslySetInnerHTML)
      setTimeout(() => {
        const container = document.getElementById('iyzipay-checkout-form');
        if (!container) {
          console.error('Container not found');
          setError('Failed to load payment form');
          return;
        }

        // Extract ALL script tags from HTML (Iyzico sends multiple: iyziInit, iyziUcsInit, iyziSubscriptionInit)
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        const scripts = [...data.checkoutFormContent.matchAll(scriptRegex)];

        if (scripts.length === 0) {
          console.error('No scripts found in response');
          setError('Failed to load payment form');
          return;
        }

        try {
          // Inject all script tags in order
          scripts.forEach((match, index) => {
            const scriptContent = match[1];
            if (scriptContent && scriptContent.trim()) {
              const script = document.createElement('script');
              script.type = 'text/javascript';
              script.text = scriptContent;
              container.appendChild(script);
              console.log(`✅ Iyzico script ${index + 1}/${scripts.length} injected successfully`);
            }
          });
        } catch (scriptError) {
          console.error('Script execution error:', scriptError);
          setError('Failed to load payment form');
        }
      }, 100);
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to load payment form');
    } finally {
      setLoading(false);
    }
  };

  // Listen for messages from Iyzico iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Iyzico sends messages when payment is complete
      if (event.origin === 'https://sandbox-api.iyzipay.com' || event.origin === 'https://api.iyzipay.com') {
        console.log('Iyzico message:', event.data);

        // Check if payment was successful
        if (event.data === 'success' || event.data?.status === 'success') {
          onPaymentSuccess();
          onOpenChange(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPaymentSuccess, onOpenChange]);

  const price = bot?.type === 'BASIC' ? '9.99' : '19.99';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment powered by Iyzico
            {bot && (
              <span className="block mt-2 text-sm font-semibold text-gray-700">
                {bot.name} - {bot.type} Plan (${price}/month)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <div className="text-red-600 text-center">
                <p className="font-semibold mb-2">Payment initialization failed</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={initializePayment}>Try Again</Button>
            </div>
          )}

          {!loading && !error && checkoutFormContent && (
            <div
              id="iyzipay-checkout-form"
              className="payment-form-container h-[500px] overflow-auto"
            />
          )}
        </div>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Test Mode Active</p>
              <p className="text-xs text-green-700">
                Using sandbox environment. Use test card: <strong>5890040000000016</strong>
              </p>
              <p className="text-xs text-green-700 mt-1">
                Expiry: 12/30, CVV: 123
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
