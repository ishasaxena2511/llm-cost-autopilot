import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Play,
  BarChart3,
  GitFork,
  Cpu,
  History,
  Settings,
  BookOpen,
  Info,
  Menu,
  X,
  Zap,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemSettings } from '../types/index.js';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(() => {});
  }, [location.pathname]);

  const handleToggleMode = async () => {
    if (!settings) return;
    const newMode = settings.mode === 'demo' ? 'live' : 'demo';
    try {
      const updated = await api.updateSettings({ mode: newMode });
      setSettings(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset to demo seed data with 7 curated realistic request logs?')) {
      setIsResetting(true);
      try {
        await api.resetSeedData();
        window.location.reload();
      } catch (e) {
        alert('Failed to reset data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Playground', path: '/playground', icon: Play, highlight: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Routing Engine', path: '/routing', icon: GitFork },
    { name: 'Model Registry', path: '/models', icon: Cpu },
    { name: 'Request History', path: '/history', icon: History },
  ];

  const systemItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Documentation', path: '/docs', icon: BookOpen },
    { name: 'About & Roadmap', path: '/about', icon: Info },
  ];

  // Breadcrumb generation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle =
    pathParts.length === 0
      ? 'Overview'
      : pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-100 flex flex-col antialiased selection:bg-orange-500/30 selection:text-orange-200 font-sans">
      {/* Top Banner if in Demo Mode */}
      <div className="bg-black/90 border-b border-orange-500/20 px-4 py-1.5 text-xs text-neutral-300 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 tracking-wider">
            DEMO SIMULATION
          </span>
          <span className="hidden sm:inline text-neutral-400 text-[11px]">
            Direct multi-model quality routing and real-time execution engine.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="quick-reset-seed-btn"
            onClick={handleResetData}
            disabled={isResetting}
            title="Reload realistic benchmark dataset"
            className="text-neutral-400 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer font-mono text-[11px]"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Data</span>
          </button>
          <button
            id="toggle-mode-top-btn"
            onClick={handleToggleMode}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition-all cursor-pointer"
          >
            Mode: <span className={settings?.mode === 'live' ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'}>{settings?.mode?.toUpperCase() || 'DEMO'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0c] border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-800/80">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-md bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                    ROUTER <span className="text-orange-500 font-black tracking-wider font-mono text-xs px-1 py-0.5 bg-orange-500/10 rounded border border-orange-500/20">AUTOPILOT</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 tracking-widest uppercase font-mono">
                    LLM Cost Engine
                  </div>
                </div>
              </Link>
              <button
                className="lg:hidden p-1 text-neutral-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action CTA inside sidebar */}
            <div className="p-3 border-b border-neutral-800/60">
              <button
                id="sidebar-launch-autopilot-btn"
                onClick={() => {
                  if (location.pathname !== '/playground') {
                    navigate('/playground');
                  }
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-orange-600 hover:bg-orange-500 text-black font-bold text-xs shadow-md shadow-orange-600/25 transition-all cursor-pointer tracking-wide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Playground</span>
              </button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              <div>
                <div className="px-2.5 mb-2 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  Core
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-xs'
                              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {item.highlight && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div>
                <div className="px-2.5 mb-2 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  System
                </div>
                <nav className="space-y-1">
                  {systemItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40'
                              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Sidebar Bottom Status */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/60 space-y-2 text-xs">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="font-medium text-[11px] font-mono">Status</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">OPERATIONAL</span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Routing Tier</span>
                </div>
                <span className="text-[10px] text-orange-400 font-mono font-bold uppercase">
                  {settings?.mode || 'Demo'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#070708]">
          {/* Top Navigation Bar */}
          <header className="h-16 border-b border-neutral-800/80 bg-[#0a0a0c]/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="mobile-sidebar-toggle"
                className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  AUTOPILOT
                </Link>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className="text-neutral-200 font-medium">{currentTitle.toUpperCase()}</span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/routing"
                id="header-strategy-link"
                className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors font-mono"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                <span className="capitalize">Strategy: {settings?.optimizationStrategy || 'Balanced'}</span>
              </Link>
              <Link
                to="/playground"
                id="header-playground-btn"
                onClick={(e) => {
                  if (location.pathname === '/playground') {
                    e.preventDefault();
                  }
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-black font-bold shadow-sm transition-colors tracking-wide"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Playground</span>
              </Link>
            </div>
          </header>

          {/* Page Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
