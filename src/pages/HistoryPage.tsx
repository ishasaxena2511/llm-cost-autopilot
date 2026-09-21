import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { RequestRecord } from '../types/index.js';
import { formatCurrency, formatLatency } from '../lib/utils.js';

export function HistoryPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');

  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        q: searchQuery,
        complexity: complexityFilter,
        model: modelFilter,
        page,
        limit: 10,
      });
      setRequests(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, complexityFilter, modelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleExportCSV = () => {
    if (requests.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'Prompt',
      'Complexity',
      'Score',
      'Model',
      'Input Tokens',
      'Output Tokens',
      'Cost ($)',
      'Baseline ($)',
      'Saved ($)',
      'Savings %',
      'Latency (s)',
    ];

    const rows = requests.map((r) => [
      r.id,
      r.timestamp,
      `"${r.prompt.replace(/"/g, '""')}"`,
      r.complexity,
      r.complexityScore,
      `"${r.selectedModelName}"`,
      r.inputTokens,
      r.outputTokens,
      r.actualCost,
      r.baselineCost,
      r.costSaved,
      r.savingsPercentage,
      r.latency,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autopilot-requests-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              <History className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Request History & Audit Log</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Searchable log of all inference requests, complexity scores, and cost savings telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by prompt text, response, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={complexityFilter}
            onChange={(e) => {
              setComplexityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2"
          >
            <option value="">All Complexities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setComplexityFilter('');
              setModelFilter('');
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Prompt</th>
                <th className="py-3 px-4">Complexity</th>
                <th className="py-3 px-4">Selected Model</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Savings</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const complexityBadge =
                    r.complexity === 'LOW'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : r.complexity === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(r.timestamp).toLocaleDateString()}{' '}
                        {new Date(r.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 max-w-sm truncate font-medium text-white">
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
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                        {r.savingsPercentage}%
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                        {formatLatency(r.latency)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`history-view-${r.id}`}
                          onClick={() => navigate(`/history/${r.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-orange-400" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{requests.length}</span> of{' '}
            <span className="text-white font-mono">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
