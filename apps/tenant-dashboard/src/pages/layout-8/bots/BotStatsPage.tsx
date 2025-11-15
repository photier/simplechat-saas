import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, ArrowLeft } from 'lucide-react';
import { useBotStats } from './useBotStats';
import { HeroStatsCards } from '../components/HeroStatsCards';
import { MiddleStatsCards } from '../components/MiddleStatsCards';
import { AnalyticsWidgets } from '../components/AnalyticsWidgets';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import '../styles/animations.css';
import { PageTransition } from '@/components/PageTransition';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Sector, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { getCountryFlag, normalizeCountryCode } from '@/utils/countryFlags';

// Active shape for pie chart hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function BotStatsPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useBotStats(botId!);
  const { t } = useTranslation('dashboard');
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  if (error) {
    return (
      <div className="container px-8 lg:px-12 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-5">
          <p className="text-red-800">Error loading stats: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <Toolbar>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bots')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Bots
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <ToolbarHeading>Bot Stats - {botId}</ToolbarHeading>
        </div>
        <ToolbarActions>
          <SearchDialog
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <Search className="size-4.5!" />
              </Button>
            }
          />
          <ChatSheet
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <MessageCircleMore className="size-4.5!" />
              </Button>
            }
          />
          <div className="ms-2.5">
            <LanguageSwitcher />
          </div>
        </ToolbarActions>
      </Toolbar>

      <div className="w-full mx-auto px-3 md:px-6 lg:px-12 pb-6 md:pb-12 overflow-x-hidden max-w-full">
        <div className="grid gap-4 md:gap-6 lg:gap-[25px]">
          {/* Hero Stats Cards */}
          <HeroStatsCards data={data} loading={loading} />

          {/* Middle Stats Cards */}
          <MiddleStatsCards data={data} loading={loading} />

          {/* Analytics Widgets */}
          <AnalyticsWidgets data={data} loading={loading} />

          {/* Charts Row - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-[25px]">
            {/* Monthly Message Count Chart */}
            <div
              className="bg-white rounded-xl border border-gray-100"
              style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '1.2s' }}
            >
              <div className="p-2 md:p-5 border-b border-gray-100">
                <h3 className="text-sm md:text-base font-bold text-gray-900">{t('charts.dailyUserCount')}</h3>
              </div>
              <div className="p-2 md:p-6">
                {loading ? (
                  <div className="h-48 md:h-80 flex items-center justify-center">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                ) : (
                  <div className="h-48 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data?.monthlyMessages?.labels?.map((label, index) => ({
                          date: label,
                          count: data.monthlyMessages.values[index],
                        })) || []}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          interval={2}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#colorCount)"
                          dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 2 }}
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* AI vs Human Support Chart */}
            <div
              className="bg-white rounded-xl border border-gray-100"
              style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '1.3s' }}
            >
              <div className="p-2 md:p-5 border-b border-gray-100">
                <h3 className="text-sm md:text-base font-bold text-gray-900">{t('charts.aiVsHumanSupport')}</h3>
              </div>
              <div className="p-2 md:p-6">
                {loading ? (
                  <div className="h-48 md:h-80 flex items-center justify-center">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                ) : (
                  <div className="h-48 md:h-80">
                    <div className="w-full relative h-[180px] md:h-[280px]">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'AI Asistan', value: data?.aiHandledSessions || 0 },
                              { name: 'İnsan Desteği', value: data?.humanHandledSessions || 0 },
                            ]}
                            cx="50%"
                            cy="45%"
                            innerRadius={window.innerWidth < 768 ? 50 : 80}
                            outerRadius={window.innerWidth < 768 ? 75 : 115}
                            paddingAngle={2}
                            dataKey="value"
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            animationBegin={0}
                            animationDuration={800}
                          >
                            <Cell fill="#50cd89" />
                            <Cell fill="#ffc700" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                        <div className="text-2xl md:text-4xl font-bold text-gray-900">
                          {(data?.aiHandledSessions || 0) + (data?.humanHandledSessions || 0)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">Toplam Session</div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-center gap-3 md:gap-6 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#50cd89] flex-shrink-0"></div>
                        <span className="text-[10px] md:text-sm text-gray-700 whitespace-nowrap">
                          AI: {data?.aiHandledSessions || 0} ({Math.round(((data?.aiHandledSessions || 0) / Math.max((data?.aiHandledSessions || 0) + (data?.humanHandledSessions || 0), 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffc700] flex-shrink-0"></div>
                        <span className="text-[10px] md:text-sm text-gray-700 whitespace-nowrap">
                          İnsan: {data?.humanHandledSessions || 0} ({Math.round(((data?.humanHandledSessions || 0) / Math.max((data?.aiHandledSessions || 0) + (data?.humanHandledSessions || 0), 1)) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages & Countries Row - 8+4 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-[25px]">
            {/* Message Distribution Chart (8 columns) */}
            <div
              className="lg:col-span-8 bg-white rounded-xl border border-gray-100"
              style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '1.4s' }}
            >
              <div className="p-2 md:p-5 border-b border-gray-100">
                <h3 className="text-sm md:text-base font-bold text-gray-900">{t('charts.messageDistribution')}</h3>
              </div>
              <div className="p-2 md:p-6">
                {loading ? (
                  <div className="h-48 md:h-80 flex items-center justify-center">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                ) : (
                  <div className="h-48 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.monthlyMessages?.labels?.map((label, index) => ({
                          date: label,
                          count: data.monthlyMessages.values[index],
                        })) || []}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#f472b6" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          interval={2}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }}
                        />
                        <Bar
                          dataKey="count"
                          fill="url(#colorBar)"
                          radius={[6, 6, 0, 0]}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Country Distribution (4 columns) */}
            <div
              className="lg:col-span-4 bg-white rounded-xl border border-gray-100"
              style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)', animationDelay: '1.5s' }}
            >
              <div className="p-2 md:p-5 border-b border-gray-100">
                <h3 className="text-sm md:text-base font-bold text-gray-900">{t('charts.countryDistribution')}</h3>
              </div>
              <div className="p-2 md:p-6">
                <div className="space-y-2.5">
                  {data?.countryDistribution.slice(0, 5).map((item) => {
                    // Normalize country to code format (TR, US, etc.)
                    const countryCode = normalizeCountryCode(item.country);
                    const flag = getCountryFlag(countryCode);

                    return (
                    <div
                      key={item.country}
                      className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {flag}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">{countryCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{t('common:common.users')}</span>
                        <span className="font-bold text-gray-900 text-xl">{item.count}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
