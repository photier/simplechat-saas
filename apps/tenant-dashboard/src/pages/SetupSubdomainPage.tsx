import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { toast, Toaster } from 'sonner';
import { Building2, Globe, CheckCircle, Loader2 } from 'lucide-react';

export default function SetupSubdomainPage() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();

  // Redirect if user already has subdomain (ignore temp_ subdomains)
  useEffect(() => {
    if (user?.subdomain && !user.subdomain.startsWith('temp_')) {
      console.log('SetupSubdomainPage: User already has subdomain, redirecting to:', `https://${user.subdomain}.simplechat.bot`); // DEBUG

      // Get token from localStorage to pass to tenant subdomain
      const token = localStorage.getItem('auth_token');
      const redirectUrl = token
        ? `https://${user.subdomain}.simplechat.bot?token=${encodeURIComponent(token)}`
        : `https://${user.subdomain}.simplechat.bot`;

      window.location.href = redirectUrl;
    }
  }, [user, navigate]);

  // Auto-generate subdomain preview from company name
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    setLoading(true);
    setCreating(true);

    try {
      await authService.setSubdomain({ companyName: companyName.trim() });

      // Fetch updated user data with subdomain
      await refetchUser();

      toast.success('Dashboard created successfully!');

      // Show creating animation for 2 seconds
      setTimeout(() => {
        setCreating(false);

        // Redirect to tenant's subdomain
        setTimeout(async () => {
          // Get updated user data to get the real subdomain
          const userData = await authService.getMe();
          const tenantSubdomain = userData.subdomain;

          // Redirect to tenant's subdomain with token
          if (tenantSubdomain && !tenantSubdomain.startsWith('temp_')) {
            const token = localStorage.getItem('auth_token');
            const redirectUrl = token
              ? `https://${tenantSubdomain}.simplechat.bot?token=${encodeURIComponent(token)}`
              : `https://${tenantSubdomain}.simplechat.bot`;

            window.location.href = redirectUrl;
          } else {
            navigate('/');
          }
        }, 1000);
      }, 2000);
    } catch (error: any) {
      setLoading(false);
      setCreating(false);
      toast.error(error.response?.data?.message || 'Failed to create dashboard');
    }
  };

  if (creating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <Toaster position="top-right" />

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Creating Card */}
        <div className="relative w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Creating Your Dashboard</h1>
              <p className="text-blue-100 text-sm">Please wait while we set everything up...</p>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Creating workspace</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Setting up dashboard</span>
                </div>
                <div className="flex items-center space-x-3 opacity-50">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-400">Preparing chatbot system</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  Your dashboard will be ready in a moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Toaster position="top-right" />

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Setup Card */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Setup Your Dashboard</h1>
            <p className="text-blue-100 text-sm">
              Choose your company name and dashboard URL
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Choose a company name that represents your brand</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Your dashboard URL will be auto-generated</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>You can change this later in settings</span>
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating Dashboard...
                  </span>
                ) : (
                  'Create My Dashboard'
                )}
              </button>
            </form>
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
