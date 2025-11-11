import { StatsData } from '../hooks/useStats';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface AnalyticsWidgetsProps {
  data: StatsData | null;
  loading: boolean;
}

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const AnalyticsWidgets = ({ data, loading }: AnalyticsWidgetsProps) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const maxHeatmapValue = data?.weeklyHeatmap
    ? Math.max(...data.weeklyHeatmap.flat())
    : 1;
  const totalSessions =
    (data?.aiHandledSessions || 0) + (data?.humanHandledSessions || 0) || 1;

  // Calculate heatmap color
  const getHeatmapColor = (value: number): string => {
    if (value === 0) return '#E8F4FD';
    const intensity = value / maxHeatmapValue;
    const colors = ['#E8F4FD', '#B3D9F2', '#7DB8E8', '#4897DD', '#2C7AB5', '#1A5C8C', '#0D3E63'];
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  };

  // Calculate AI success circle progress
  const successRate = data?.aiSuccessRate || 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (successRate / 100) * circumference;

  return (
    <>
      {/* Session Duration Row - 3 Gradient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '25px' }}>
        {/* Average Session Duration - Purple Gradient */}
        <div
          className="rounded-xl p-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.08)',
            animationDelay: '0.7s',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs opacity-85 font-medium mb-1">⏱️ {t('analytics.averageDuration')}</div>
              <h3 className="text-base font-semibold">{t('analytics.sessionDuration')}</h3>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <div className="text-4xl font-extrabold leading-none">
              {loading ? '...' : data?.avgSessionDuration || '0.0'}
            </div>
            <div className="text-base opacity-80 font-semibold">{t('analytics.minutes')}</div>
          </div>
          <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] opacity-70 mb-1">{t('analytics.shortest')}</div>
              <div className="text-base font-semibold">{loading ? '...' : data?.minSessionDuration || '0.0'} dk</div>
            </div>
            <div>
              <div className="text-[11px] opacity-70 mb-1">{t('analytics.longest')}</div>
              <div className="text-base font-semibold">{loading ? '...' : data?.maxSessionDuration || '0.0'} dk</div>
            </div>
          </div>
        </div>

        {/* Average Messages - Pink Gradient */}
        <div
          className="rounded-xl p-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.08)',
            animationDelay: '0.8s',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs opacity-85 font-medium mb-1">💬 {t('analytics.avgMessages')}</div>
              <h3 className="text-base font-semibold">{t('analytics.messagesPerSession')}</h3>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <div className="text-4xl font-extrabold leading-none">
              {loading ? '...' : data?.avgMessagesPerSession || '0.0'}
            </div>
            <div className="text-base opacity-80 font-semibold">{t('analytics.messages')}</div>
          </div>
          <div className="pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-80">{t('stats.totalSessions')}</div>
              <div className="text-lg font-bold">
                {loading ? '...' : data?.totalSessions ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Channel Distribution - Blue Gradient */}
        <div
          className="rounded-xl p-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.08)',
            animationDelay: '0.9s',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs opacity-85 font-medium mb-1">🌍 {t('analytics.channelDistribution')}</div>
              <h3 className="text-base font-semibold">{t('analytics.aiHuman')}</h3>
            </div>
            <div className="text-2xl">📡</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
            >
              <div className="text-[11px] opacity-85 mb-1.5">🤖 {t('analytics.aiService')}</div>
              <div className="text-2xl font-extrabold leading-none">
                {loading ? '...' : data?.aiHandledSessions ?? 0}
              </div>
              <div className="text-[11px] opacity-80 mt-1">
                {loading
                  ? '...'
                  : `${Math.round(((data?.aiHandledSessions || 0) / totalSessions) * 100)}%`}
              </div>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
            >
              <div className="text-[11px] opacity-85 mb-1.5">👤 {t('analytics.supportTeam')}</div>
              <div className="text-2xl font-extrabold leading-none">
                {loading ? '...' : data?.humanHandledSessions ?? 0}
              </div>
              <div className="text-[11px] opacity-80 mt-1">
                {loading
                  ? '...'
                  : `${Math.round(((data?.humanHandledSessions || 0) / totalSessions) * 100)}%`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Busiest Hours Heatmap - Full Width - 7 Days x 24 Hours */}
      <div>
        <div
          className="bg-white rounded-xl p-8 border border-gray-100"
          style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '1s' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm opacity-60 font-medium mb-1.5">📊 {t('heatmap.title')}</div>
              <h2 className="text-3xl font-bold text-gray-900">{t('heatmap.subtitle')}</h2>
              <p className="text-sm opacity-70 mt-2">
                {t('heatmap.description')}
              </p>
            </div>
            <div className="text-5xl">🔥</div>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: '900px' }}>
              {/* Hour Labels */}
              <div className="grid gap-1" style={{ gridTemplateColumns: '130px repeat(24, 1fr)' }}>
                <div></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-[10px] font-semibold text-gray-500 text-center">
                    {String(i).padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Heatmap Rows */}
              {data?.weeklyHeatmap.map((dayData, dayIndex) => (
                <div key={dayIndex} className="grid gap-1 mt-1" style={{ gridTemplateColumns: '130px repeat(24, 1fr)' }}>
                  <div className="text-[13px] font-semibold text-gray-700 flex items-center justify-start">
                    {t(`heatmap.days.${dayKeys[dayIndex]}`)}
                  </div>
                  {dayData.map((value, hourIndex) => {
                    const bgColor = getHeatmapColor(value);
                    const intensity = value / maxHeatmapValue;
                    // Koyu kutularda açık mavi (#B3D9F2), açık kutularda koyu mavi (#1A5C8C)
                    const textColor = intensity > 0.5 ? '#B3D9F2' : '#1A5C8C';

                    return (
                    <div
                      key={hourIndex}
                      className="rounded transition-all duration-200 hover:scale-110 cursor-pointer group relative flex items-center justify-center"
                      style={{ backgroundColor: bgColor, height: '28px' }}
                      title={`${t(`heatmap.days.${dayKeys[dayIndex]}`)} ${hourIndex}:00 - ${value} ${t('common:common.activity')}`}
                    >
                      {value > 0 && <span className="text-[10px] font-bold" style={{ color: textColor }}>{value}</span>}
                      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                        {t(`heatmap.days.${dayKeys[dayIndex]}`)} {hourIndex}:00 - {value}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 mt-5 pt-5 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500">{t('heatmap.low')}</span>
                <div className="flex gap-1">
                  {['#E8F4FD', '#B3D9F2', '#7DB8E8', '#4897DD', '#2C7AB5', '#1A5C8C', '#0D3E63'].map(
                    (color, i) => (
                      <div key={i} className="w-5 h-5 rounded" style={{ background: color }}></div>
                    )
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-500">{t('heatmap.high')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Success Rate - Full Width Purple Gradient */}
      <div>
        <div
          className="rounded-xl p-8 text-white"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.08)',
            animationDelay: '1.1s',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm opacity-90 font-medium mb-1.5">🎯 {t('aiPerformance.title')}</div>
              <h2 className="text-4xl font-bold mb-3">{t('aiPerformance.subtitle')}</h2>
              <p className="text-sm opacity-85 max-w-lg leading-relaxed">
                {t('aiPerformance.description')}
              </p>
            </div>

            <div className="flex items-center gap-10">
              {/* Circle Progress */}
              <div className="text-center">
                <div className="relative w-40 h-40">
                  <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#50CD89"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-5xl font-extrabold leading-none">
                      {loading ? '...' : `${data?.aiSuccessRate || 0}%`}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1 font-semibold">{t('aiPerformance.success')}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded" style={{ background: '#50CD89' }}></div>
                  <div>
                    <div className="text-xs opacity-80">{t('aiPerformance.aiSuccess')}</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : data?.aiSuccessCount || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded" style={{ background: '#FFC700' }}></div>
                  <div>
                    <div className="text-xs opacity-80">{t('aiPerformance.humanSupport')}</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : data?.humanEscalationCount || 0}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <div className="text-[11px] opacity-70">{t('aiPerformance.totalConversations')}</div>
                  <div className="text-lg font-semibold mt-1">
                    {loading ? '...' : data?.totalConversations || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
