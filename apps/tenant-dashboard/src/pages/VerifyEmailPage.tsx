import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { toast, Toaster } from 'sonner';
import { Mail, CheckCircle, XCircle, Loader2, Building2, Globe } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [showSubdomainForm, setShowSubdomainForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setUser, refetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token') || sessionStorage.getItem('verification_token');

    if (token) {
      handleVerification(token);
    }
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    setVerifying(true);
    try {
      console.log('[VerifyEmail] Starting verification with token...');
      const response = await authService.verifyEmail(token);
      console.log('[VerifyEmail] Backend response:', response);

      if (response.success) {
        setVerified(true);

        // Clean up
        sessionStorage.removeItem('verification_token');

        // Backend has set HttpOnly cookie, set user in context
        if (response.tenant) {
          setUser(response.tenant);
        }

        // Show subdomain form after 2 seconds
        setTimeout(() => {
          setShowSubdomainForm(true);
        }, 2000);
      }
    } catch (error: any) {
      console.error('[VerifyEmail] Verification error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Verification failed');
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const generateSubdomainPreview = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  };

  const subdomainPreview = generateSubdomainPreview(companyName);

  const handleSubdomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    setSubmitting(true);

    try {
      await authService.setSubdomain({ companyName: companyName.trim() });
      await refetchUser();

      toast.success('Dashboard created successfully!');

      // Redirect to tenant subdomain
      setTimeout(async () => {
        const userData = await authService.getMe();
        const tenantSubdomain = userData.subdomain;

        if (tenantSubdomain && !tenantSubdomain.startsWith('temp_')) {
          window.location.href = `https://${tenantSubdomain}.simplechat.bot`;
        }
      }, 1000);
    } catch (error: any) {
      setSubmitting(false);
      toast.error(error.response?.data?.message || 'Failed to create dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Toaster position="top-right" />

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Verification Card */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              {verifying ? (
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              ) : verified && showSubdomainForm ? (
                <Building2 className="h-10 w-10 text-blue-600" />
              ) : verified ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : error ? (
                <XCircle className="h-10 w-10 text-red-600" />
              ) : (
                <Mail className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {verifying
                ? 'Verifying Email...'
                : verified && showSubdomainForm
                ? 'Setup Your Dashboard'
                : verified
                ? 'Email Verified!'
                : error
                ? 'Verification Failed'
                : 'Verify Your Email'}
            </h1>
            <p className="text-blue-100 text-sm">
              {verifying
                ? 'Please wait while we verify your email'
                : verified && showSubdomainForm
                ? 'Choose your company name and dashboard URL'
                : verified
                ? 'Your account has been verified successfully'
                : error
                ? 'There was an issue verifying your email'
                : 'Check your inbox for verification link'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {verifying && (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-2 bg-blue-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-blue-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            )}

            {verified && !showSubdomainForm && (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-green-900 mb-2">
                        Email Verified Successfully!
                      </h3>
                      <p className="text-sm text-green-700">
                        Your account is now active
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Loading dashboard setup...
                </p>
              </div>
            )}

            {showSubdomainForm && (
              <form onSubmit={handleSubdomainSubmit} className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <p className="text-sm text-green-800 text-center">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Email verified! Now setup your dashboard
                  </p>
                </div>

                {/* Company Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={2}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Subdomain Preview */}
                {companyName && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Your Dashboard URL
                    </label>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-gray-900 truncate">
                            {subdomainPreview || 'your-company'}.simplechat.bot
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be your dashboard's unique URL
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !companyName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Creating Dashboard...
                    </span>
                  ) : (
                    'Create My Dashboard'
                  )}
                </button>
              </form>
            )}

            {error && (
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 text-center">
                    <XCircle className="inline h-5 w-5 mr-2" />
                    {error}
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    The verification link may have expired or is invalid.
                  </p>
                  <Link
                    to="/register"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Register Again
                  </Link>
                </div>
              </div>
            )}

            {!verifying && !verified && !error && (
              <div className="space-y-6">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-center space-y-4">
                    <Mail className="h-12 w-12 text-blue-600 mx-auto" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-gray-600">
                        We've sent a verification link to your email address.
                        Click the link in the email to verify your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Check your spam folder if you don't see the email</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>The verification link will expire in 24 hours</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Make sure to click the link from the same browser
                    </span>
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-blue-600 hover:text-purple-600 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2025 SimpleChat. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
