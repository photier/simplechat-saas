import { StatsData } from '../hooks/useStats';
import { useTranslation } from 'react-i18next';

interface HeroStatsCardsProps {
  data: StatsData | null;
  loading: boolean;
}

export const HeroStatsCards = ({ data, loading }: HeroStatsCardsProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-[25px]">
      {/* Online Now - Pink Gradient */}
      <div
        className="rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, #ffd6e7 0%, #ffc4d6 100%)',
          boxShadow: '0 0 30px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">{t('hero.onlineNow')}</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {loading ? '...' : data?.onlineNow || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-600" style={{ whiteSpace: 'pre' }}>
              {loading ? '...' : `Web: ${data?.onlineWeb || 0}   Premium: ${data?.onlinePremium || 0}`}
            </p>
          </div>
          <div className="text-4xl md:text-5xl lg:text-6xl animate-float flex-shrink-0">🟢</div>
        </div>
      </div>

      {/* Total Impressions - Cyan Gradient */}
      <div
        className="rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, #d4f1f4 0%, #b8e6ea 100%)',
          boxShadow: '0 0 30px rgba(0,0,0,0.08)',
          animationDelay: '0.1s',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">{t('hero.totalImpressions')}</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {loading ? '...' : data?.totalOpens?.toLocaleString('tr-TR') || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-600" style={{ whiteSpace: 'pre' }}>
              {loading ? '...' : `Web: ${data?.normalOpens?.toLocaleString('tr-TR') || 0}   Premium: ${data?.premiumOpens?.toLocaleString('tr-TR') || 0}`}
            </p>
          </div>
          <div className="text-4xl md:text-5xl lg:text-6xl animate-float flex-shrink-0" style={{ animationDelay: '0.5s' }}>👁️</div>
        </div>
      </div>

      {/* Conversion Rate - Purple Gradient */}
      <div
        className="rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, #e0d4f7 0%, #d1c4f0 100%)',
          boxShadow: '0 0 30px rgba(0,0,0,0.08)',
          animationDelay: '0.2s',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">{t('hero.conversionRate')}</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {loading ? '...' : `${data?.conversionRate || 0}%`}
            </p>
            <p className="text-[10px] md:text-xs text-gray-600">{t('hero.openersTalkers')}</p>
          </div>
          <div className="text-4xl md:text-5xl lg:text-6xl animate-float flex-shrink-0" style={{ animationDelay: '1s' }}>📈</div>
        </div>
      </div>
    </div>
  );
};
