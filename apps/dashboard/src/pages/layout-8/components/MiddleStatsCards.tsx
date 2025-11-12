import { StatsData } from '../hooks/useStats';
import { useTranslation } from 'react-i18next';

interface MiddleStatsCardsProps {
  data: StatsData | null;
  loading: boolean;
}

export const MiddleStatsCards = ({ data, loading }: MiddleStatsCardsProps) => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-[25px]">
      {/* Total Sessions */}
      <div
        className="bg-white rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '0.3s' }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
            style={{ background: '#F1FAFF' }}
          >
            <span style={{ color: '#009EF7' }}>👥</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600">{t('stats.totalSessions')}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {loading ? '...' : data?.totalSessions?.toLocaleString('tr-TR') || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{data?.onlineNow || 0} {t('common:common.online')}</p>
          </div>
        </div>
      </div>

      {/* Total Users */}
      <div
        className="bg-white rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '0.4s' }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
            style={{ background: '#E8FFF3' }}
          >
            <span style={{ color: '#50CD89' }}>👥</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600">{t('stats.totalUsers')}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {loading ? '...' : data?.totalUsers?.toLocaleString('tr-TR') || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{t('stats.uniqueVisitors')}</p>
          </div>
        </div>
      </div>

      {/* Today Active */}
      <div
        className="bg-white rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '0.5s' }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
            style={{ background: '#FFF8DD' }}
          >
            <span style={{ color: '#FFC700' }}>⚡</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600">{t('stats.activeToday')}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {loading ? '...' : data?.todayActive?.toLocaleString('tr-TR') || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{t('stats.todayUsers')}</p>
          </div>
        </div>
      </div>

      {/* Total Messages */}
      <div
        className="bg-white rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '0.6s' }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
            style={{ background: '#FFF5F8' }}
          >
            <span style={{ color: '#F1416C' }}>💬</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600">{t('stats.totalMessages')}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {loading ? '...' : data?.totalMessages?.toLocaleString('tr-TR') || 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{t('stats.allConversations')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
