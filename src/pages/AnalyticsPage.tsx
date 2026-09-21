import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../services/api.js';
import { AnalyticsSummary } from '../types/index.js';
import { formatCurrency, formatLatency, formatNumber } from '../lib/utils.js';

const PALETTE = ['#f97316', '#10b981', '#8b5cf6', '#3b82f6', '#ec4899'];

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoursFilter, setHoursFilter] = useState<number | undefined>(undefined);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics(hoursFilter);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [hoursFilter]);

  const filterOptions = [
    { label: 'All Time', value: undefined },
    { label: 'Last 24 Hours', value: 24 },
    { label: 'Last 7 Days', value: 168 },
    { label: 'Last 30 Days', value: 720 },
  ];

  return (
    <div className="space-y-8">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cost & Performance Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep dive into token consumption, cost savings trajectories, and model tier latency.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {filterOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setHoursFilter(opt.value)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all ${
                hoursFilter === opt.value
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Total Requests</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatNumber(analytics?.totalRequests || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Total Tokens</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatNumber(analytics?.totalTokens || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Total Spend</div>
          <div className="text-lg font-bold font-mono text-orange-400 mt-1">
            {formatCurrency(analytics?.totalSpend || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Avg Cost/Req</div>
          <div className="text-lg font-bold font-mono text-slate-300 mt-1">
            {formatCurrency(analytics?.averageCostPerRequest || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Avg Latency</div>
          <div className="text-lg font-bold font-mono text-purple-400 mt-1">
            {formatLatency(analytics?.averageLatency || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Cost Saved</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(analytics?.costSaved || 0)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Savings %</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {analytics?.savingsPercentage || 0}%
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Spend Over Time & Requests Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Over Time */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Spend Trajectory Over Time</h3>
              <p className="text-xs text-slate-400">Actual spend with Autopilot vs single-tier baseline</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.costOverTime || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(5)}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
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
                  name="Actual (Autopilot)"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests Over Time */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Request Ingestion Volume</h3>
            <p className="text-xs text-slate-400">Total prompts routed per timeline block</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.costOverTime || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="requests" name="Requests Routed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Cost by Model, Routing Distribution, Latency by Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost by Model */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Spend by Model</h3>
            <p className="text-xs text-slate-400">Total expenditure allocated to each model</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.modelDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis
                  type="category"
                  dataKey="modelName"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => v.split('/')[0]}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(5)}`, 'Spend']}
                />
                <Bar dataKey="spend" fill="#f97316" radius={[0, 4, 4, 0]}>
                  {(analytics?.modelDistribution || []).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Routing Distribution */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Complexity Classification Split</h3>
            <p className="text-xs text-slate-400">Share of low, medium, and high complexity prompts</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Low Complexity', value: analytics?.routingDistribution.LOW || 0, color: '#10b981' },
                    { name: 'Medium Complexity', value: analytics?.routingDistribution.MEDIUM || 0, color: '#f59e0b' },
                    { name: 'High Complexity', value: analytics?.routingDistribution.HIGH || 0, color: '#8b5cf6' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency by Model */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Average Latency by Model</h3>
            <p className="text-xs text-slate-400">Seconds to complete full inference generation</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.latencyByModel || []}>
                <XAxis
                  dataKey="modelName"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => v.split('/')[0]}
                />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(2)}s`, 'Avg Latency']}
                />
                <Bar dataKey="averageLatency" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
