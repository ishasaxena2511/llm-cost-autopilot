import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingDown,
  Clock,
  Zap,
  Percent,
  Play,
  ArrowUpRight,
  RefreshCw,
  Eye,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../services/api.js';
import { AnalyticsSummary, RequestRecord } from '../types/index.js';
import { formatCurrency, formatLatency, formatNumber } from '../lib/utils.js';

const PIE_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentRequests, setRecentRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, historyData] = await Promise.all([
        api.getAnalytics(timeFilter),
        api.getHistory({ limit: 8 }),
      ]);
      setAnalytics(analyticsData);
      setRecentRequests(historyData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-xl" />
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-950/20 border border-red-900/50 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Unable to connect to Autopilot Engine</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          id="dashboard-retry-btn"
          onClick={loadData}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Requests',
      value: formatNumber(analytics?.totalRequests || 0),
      subtitle: 'Executed inference queries',
      icon: Zap,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Total Spend',
      value: formatCurrency(analytics?.totalSpend || 0),
      subtitle: 'Actual multi-model cost',
      icon: DollarSign,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
    },
    {
      title: 'Baseline (No Routing)',
      value: formatCurrency(analytics?.estimatedBaselineCost || 0),
      subtitle: 'If all used Premium model',
      icon: Layers,
      color: 'text-slate-400',
      bg: 'bg-slate-800 border-slate-700',
    },
    {
      title: 'Cost Saved',
      value: formatCurrency(analytics?.costSaved || 0),
      subtitle: 'Net budget preserved',
      icon: TrendingDown,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Savings %',
      value: `${analytics?.savingsPercentage || 0}%`,
      subtitle: 'Relative to single frontier tier',
      icon: Percent,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Average Latency',
      value: formatLatency(analytics?.averageLatency || 0),
      subtitle: 'Weighted response time',
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  // Routing distribution data for display
  const routingData = [
    {
      name: 'Low Complexity',
      count: analytics?.routingDistribution.LOW || 0,
      tier: 'Fast / Cheap Model',
      color: '#10b981',
    },
    {
      name: 'Medium Complexity',
      count: analytics?.routingDistribution.MEDIUM || 0,
      tier: 'Balanced Tier',
      color: '#f59e0b',
    },
    {
      name: 'High Complexity',
      count: analytics?.routingDistribution.HIGH || 0,
      tier: 'Premium Frontier',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cost & Routing Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inference telemetry, model cost attribution, and budget savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTimeFilter(undefined)}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                timeFilter === undefined ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter(24)}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                timeFilter === 24 ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeFilter(168)}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                timeFilter === 168 ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7d
            </button>
          </div>

          <button
            id="dashboard-refresh-btn"
            onClick={loadData}
            title="Refresh metrics from backend"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/playground"
            id="dashboard-new-prompt-cta"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test a Prompt</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 truncate">{kpi.title}</span>
                <div className={`p-1.5 rounded-md ${kpi.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-white tracking-tight">{kpi.value}</div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">{kpi.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Over Time */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cost Over Time: Actual vs Baseline</h3>
              <p className="text-xs text-slate-400">Comparing Autopilot actual spend to single-tier baseline</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {analytics?.savingsPercentage}% Net Savings
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.costOverTime || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(5)}`, '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineCost"
                  name="Baseline (Premium)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="actualCost"
                  name="Autopilot Actual"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="costSaved"
                  name="Cost Saved"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Model */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Requests by Model Tier</h3>
              <p className="text-xs text-slate-400">Distribution of routed inference queries across engines</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.modelDistribution || []}>
                <XAxis
                  dataKey="modelName"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => val.split('/')[0].trim()}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="requestCount" name="Requests" fill="#f97316" radius={[4, 4, 0, 0]}>
                  {(analytics?.modelDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Routing Distribution & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routing Distribution breakdown */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Routing Distribution by Complexity</h3>
              <p className="text-xs text-slate-400">How prompts map to specialized execution tiers</p>
            </div>
            <Link
              to="/routing"
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
            >
              <span>Inspect Rules</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {routingData.map((item, idx) => {
              const total = analytics?.totalRequests || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{item.tier}</span>
                    <span className="font-mono text-slate-200">{item.count} reqs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost distribution pie */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-2">Cost Share by Model</h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.modelDistribution || []}
                  dataKey="spend"
                  nameKey="modelName"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {(analytics?.modelDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(5)}`, 'Spend']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs pt-2 border-t border-slate-800">
            {(analytics?.modelDistribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="truncate text-[11px]">{item.modelName.split('/')[0]}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  ${item.spend.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Routed Requests</h3>
            <p className="text-xs text-slate-400">Live requests processed through the routing pipeline</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Prompt</th>
                <th className="py-3 px-4">Complexity</th>
                <th className="py-3 px-4">Routed Model</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Saved</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No requests recorded yet. Click "Test a Prompt" to run your first request!
                  </td>
                </tr>
              ) : (
                recentRequests.map((r) => {
                  const complexityBadge =
                    r.complexity === 'LOW'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : r.complexity === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(r.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-white">
                        {r.prompt}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${complexityBadge}`}
                        >
                          {r.complexity} ({r.complexityScore})
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {r.selectedModelName.split('/')[0]}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                        {r.totalTokens}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-white">
                        ${r.actualCost.toFixed(5)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-400">
                        {r.savingsPercentage}%
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                        {r.latency.toFixed(2)}s
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/history/${r.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-orange-400" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
