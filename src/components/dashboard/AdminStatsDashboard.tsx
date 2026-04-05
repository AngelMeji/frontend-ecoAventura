import React, { useEffect, useState, useCallback } from 'react';
import { placesService } from '../../services/placesService';
import AdminReviewsTable from './AdminReviewsTable';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
    labels: string[];
    users_per_month: number[];
    reviews_per_month: number[];
    places_per_month: number[];
    category_distribution: { name: string; total: number }[];
}

type Period = 3 | 6 | 12;
type ActiveTab = 'overview' | 'trends' | 'reviews';

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
interface BarChartProps {
    labels: string[];
    datasets: { label: string; data: number[]; color: string; bgColor: string }[];
}

const BarChart: React.FC<BarChartProps> = ({ labels, datasets }) => {
    const allValues = datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allValues, 1);
    const chartH = 180;
    const barWidth = Math.max(8, Math.min(24, Math.floor(480 / (labels.length * datasets.length + labels.length))));
    const gap = 4;
    const groupWidth = datasets.length * barWidth + (datasets.length - 1) * gap;
    const groupGap = Math.max(16, Math.floor(500 / labels.length) - groupWidth);
    const totalWidth = labels.length * (groupWidth + groupGap) + groupGap;

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${Math.max(totalWidth, 500)} ${chartH + 48}`} className="w-full min-w-[300px]" style={{ height: chartH + 56 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                    <g key={i}>
                        <line
                            x1={0} y1={chartH - frac * chartH}
                            x2={Math.max(totalWidth, 500)} y2={chartH - frac * chartH}
                            stroke="#f0f0f0" strokeWidth="1"
                        />
                        <text x={2} y={chartH - frac * chartH - 3} fontSize="9" fill="#aaa">
                            {Math.round(maxVal * frac)}
                        </text>
                    </g>
                ))}

                {/* Bars */}
                {labels.map((label, gi) => {
                    const gx = groupGap + gi * (groupWidth + groupGap);
                    return (
                        <g key={gi}>
                            {datasets.map((ds, di) => {
                                const val = ds.data[gi] ?? 0;
                                const barH = Math.max((val / maxVal) * chartH, val > 0 ? 2 : 0);
                                const bx = gx + di * (barWidth + gap);
                                const by = chartH - barH;
                                return (
                                    <g key={di}>
                                        <rect
                                            x={bx} y={by}
                                            width={barWidth} height={barH}
                                            fill={ds.bgColor}
                                            rx={3}
                                        >
                                            <title>{`${ds.label}: ${val}`}</title>
                                        </rect>
                                        {val > 0 && barH > 14 && (
                                            <text x={bx + barWidth / 2} y={by + 12} textAnchor="middle" fontSize="8" fill={ds.color} fontWeight="bold">
                                                {val}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                            {/* X-axis label */}
                            <text
                                x={gx + groupWidth / 2}
                                y={chartH + 14}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#888"
                                transform={labels.length > 6 ? `rotate(-35, ${gx + groupWidth / 2}, ${chartH + 14})` : ''}
                            >
                                {label.split(' ')[0]}
                            </text>
                        </g>
                    );
                })}

                {/* Baseline */}
                <line x1={0} y1={chartH} x2={Math.max(totalWidth, 500)} y2={chartH} stroke="#ddd" strokeWidth="1.5" />
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
                {datasets.map((ds, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: ds.bgColor }}></span>
                        {ds.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface DonutChartProps {
    data: { name: string; total: number }[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
    const safeData = Array.isArray(data) ? data : (data ? Object.values(data) as { name: string; total: number }[] : []);
    const total = safeData.reduce((s, d) => s + Number(d.total || 0), 0);
    if (total === 0) return <p className="text-center text-gray-400 italic text-sm py-8">No data available</p>;

    const cx = 90, cy = 90, r = 65, innerR = 42;
    let cumAngle = -Math.PI / 2;

    const slices = safeData.slice(0, 8).map((d, i) => {
        const itemTotal = Number(d.total || 0);
        const angle = total > 0 ? (itemTotal / total) * 2 * Math.PI : 0;
        const startAngle = cumAngle;
        cumAngle += angle;
        const endAngle = cumAngle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const ix1 = cx + innerR * Math.cos(endAngle);
        const iy1 = cy + innerR * Math.sin(endAngle);
        const ix2 = cx + innerR * Math.cos(startAngle);
        const iy2 = cy + innerR * Math.sin(startAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const path = `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc},0 ${ix2},${iy2} Z`;
        return { path, color: DONUT_COLORS[i % DONUT_COLORS.length], name: d.name, total: itemTotal, pct: Math.round((itemTotal / total) * 100) };
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0">
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} opacity={0.9}>
                        <title>{`${s.name}: ${s.total} (${s.pct}%)`}</title>
                    </path>
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#555" fontWeight="bold">{total}</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888">places</text>
            </svg>
            <div className="flex flex-col gap-2 flex-1 w-full">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }}></span>
                        <span className="text-sm text-gray-700 flex-1 truncate">{s.name}</span>
                        <span className="text-xs font-bold text-gray-500">{s.pct}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: s.color }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: number;
    trend?: number; // percentage change
    icon: string;
    color: string;
    bgColor: string;
}

const StatMiniCard: React.FC<StatCardProps> = ({ label, value, trend, icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-black/5`}>
        <div className="flex items-center justify-between">
            <span className="text-2xl">{icon}</span>
            {trend !== undefined && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div>
            <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
interface AdminStatsDashboardProps {
    initialStats: any;
}

const AdminStatsDashboard: React.FC<AdminStatsDashboardProps> = ({ initialStats }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [period, setPeriod] = useState<Period>(12);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [reviewAlert, setReviewAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

    const loadAnalytics = useCallback(async (months: Period) => {
        setLoadingAnalytics(true);
        try {
            const res = await placesService.getAdminAnalytics(months);
            setAnalytics(res?.analytics || null);
        } catch (e) {
            console.error('Failed to load analytics:', e);
        } finally {
            setLoadingAnalytics(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab !== 'reviews') {
            loadAnalytics(period);
        }
    }, [period, activeTab, loadAnalytics]);

    const tabs: { key: ActiveTab; label: string; icon: string }[] = [
        { key: 'overview', label: 'Overview', icon: '📊' },
        { key: 'trends', label: 'Trends', icon: '📈' },
        { key: 'reviews', label: 'Review Monitoring', icon: '💬' },
    ];

    // Compute trend for stat cards (last month vs previous month)
    const computeTrend = (arr: number[]): number => {
        if (!arr || arr.length < 2) return 0;
        const last = arr[arr.length - 1] ?? 0;
        const prev = arr[arr.length - 2] ?? 0;
        if (prev === 0) return last > 0 ? 100 : 0;
        return Math.round(((last - prev) / prev) * 100);
    };

    return (
        <div id="statistics" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Platform Statistics
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Analytics dashboard — HU012</p>
                </div>
                {/* Period Filter */}
                {activeTab !== 'reviews' && (
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        {([3, 6, 12] as Period[]).map(m => (
                            <button
                                key={m}
                                id={`period-filter-${m}`}
                                onClick={() => setPeriod(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === m
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {m}M
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        id={`stats-tab-${tab.key}`}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-all border-b-2 flex items-center justify-center sm:justify-start gap-2 ${activeTab === tab.key
                            ? 'border-violet-500 text-violet-700 bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-6">
                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stat mini cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatMiniCard
                                label="Total Users"
                                value={initialStats?.total_users ?? 0}
                                trend={analytics ? computeTrend(analytics.users_per_month) : undefined}
                                icon="👥"
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                            />
                            <StatMiniCard
                                label="Total Places"
                                value={initialStats?.total_places ?? 0}
                                trend={analytics ? computeTrend(analytics.places_per_month) : undefined}
                                icon="🗺️"
                                color="text-emerald-600"
                                bgColor="bg-emerald-50"
                            />
                            <StatMiniCard
                                label="Pending Review"
                                value={initialStats?.pending_places ?? 0}
                                icon="⏳"
                                color="text-amber-600"
                                bgColor="bg-amber-50"
                            />
                            <StatMiniCard
                                label="Total Reviews"
                                value={initialStats?.reviews_count ?? 0}
                                trend={analytics ? computeTrend(analytics.reviews_per_month) : undefined}
                                icon="⭐"
                                color="text-purple-600"
                                bgColor="bg-purple-50"
                            />
                        </div>

                        {/* Top insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Top Rated */}
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🏆</span>
                                    <h3 className="font-bold text-gray-700 text-sm">Top Rated Place</h3>
                                </div>
                                {initialStats?.top_rated ? (
                                    <>
                                        <p className="font-bold text-amber-700 text-lg leading-tight truncate">{initialStats.top_rated.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {Number(initialStats.top_rated.rating).toFixed(1)} ★ · {initialStats.top_rated.count} reviews
                                        </p>
                                    </>
                                ) : <p className="text-gray-400 italic text-sm">No data yet</p>}
                            </div>

                            {/* Most Popular */}
                            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">❤️</span>
                                    <h3 className="font-bold text-gray-700 text-sm">Most Favorited</h3>
                                </div>
                                {initialStats?.most_popular ? (
                                    <>
                                        <p className="font-bold text-red-700 text-lg leading-tight truncate">{initialStats.most_popular.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{initialStats.most_popular.favorites} saves</p>
                                    </>
                                ) : <p className="text-gray-400 italic text-sm">No data yet</p>}
                            </div>

                            {/* Top Category */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📂</span>
                                    <h3 className="font-bold text-gray-700 text-sm">Top Category</h3>
                                </div>
                                {initialStats?.top_category ? (
                                    <>
                                        <p className="font-bold text-blue-700 text-lg leading-tight truncate">{initialStats.top_category.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{initialStats.top_category.count} places</p>
                                    </>
                                ) : <p className="text-gray-400 italic text-sm">No data yet</p>}
                            </div>
                        </div>

                        {/* Category Donut */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                                Category Distribution (Approved Places)
                            </h3>
                            {loadingAnalytics ? (
                                <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
                                    <div className="animate-spin w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full"></div>
                                    Loading…
                                </div>
                            ) : analytics?.category_distribution ? (
                                <DonutChart data={analytics.category_distribution} />
                            ) : (
                                <p className="text-center text-gray-400 italic text-sm py-4">No category data available</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TRENDS TAB ── */}
                {activeTab === 'trends' && (
                    <div className="space-y-6">
                        {loadingAnalytics ? (
                            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                                <div className="animate-spin w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full"></div>
                                Loading analytics…
                            </div>
                        ) : analytics ? (
                            <>
                                {/* Monthly activity chart */}
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        Monthly Activity — Last {period} months
                                    </h3>
                                    <BarChart
                                        labels={analytics.labels}
                                        datasets={[
                                            { label: 'New Users', data: analytics.users_per_month, color: '#2563eb', bgColor: '#bfdbfe' },
                                            { label: 'New Reviews', data: analytics.reviews_per_month, color: '#7c3aed', bgColor: '#ddd6fe' },
                                            { label: 'Approved Places', data: analytics.places_per_month, color: '#059669', bgColor: '#a7f3d0' },
                                        ]}
                                    />
                                </div>

                                {/* Summary stats for the period */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'New Users', total: analytics.users_per_month.reduce((a, b) => a + b, 0), color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
                                        { label: 'New Reviews', total: analytics.reviews_per_month.reduce((a, b) => a + b, 0), color: 'text-purple-600', bg: 'bg-purple-50', icon: '⭐' },
                                        { label: 'Places Approved', total: analytics.places_per_month.reduce((a, b) => a + b, 0), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
                                    ].map((item, i) => (
                                        <div key={i} className={`${item.bg} rounded-xl p-4 text-center border border-black/5`}>
                                            <p className="text-2xl mb-1">{item.icon}</p>
                                            <p className={`text-2xl font-bold ${item.color}`}>{item.total}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.label} (last {period}M)</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-400 italic py-12">Could not load trend data.</p>
                        )}
                    </div>
                )}

                {/* ── REVIEWS MONITORING TAB ── */}
                {activeTab === 'reviews' && (
                    <div>
                        {reviewAlert && (
                            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-3 ${
                                reviewAlert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                                reviewAlert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                                'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}>
                                <span>{reviewAlert.message}</span>
                                <button onClick={() => setReviewAlert(null)} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
                            </div>
                        )}
                        <AdminReviewsTable onNotify={setReviewAlert} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStatsDashboard;
