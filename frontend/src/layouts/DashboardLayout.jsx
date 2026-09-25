import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, MessageSquare, Users, Shield, History, Settings, LogOut, Menu, X, Search } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: FileText, label: 'My Documents', to: '/dashboard/documents' },
  { icon: Upload, label: 'Analyze New', to: '/dashboard/upload' },
  { icon: MessageSquare, label: 'Ask Document', to: '/dashboard/analysis' },
  { icon: Users, label: 'Compare', to: '/dashboard/compare' },
  { icon: History, label: 'History', to: '/dashboard/history' },
];

function SidebarItem({ icon: Icon, label, to, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        active
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-blue-600" : "text-slate-400")} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg" aria-label="LegalLens AI Home">
            <Shield className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <span className="font-bold text-xl tracking-tight text-slate-900">LegalLens AI</span>
          </Link>
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1" aria-label="Dashboard navigation">
          {navItems.map(item => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={location.pathname === item.to}
              onClick={closeSidebar}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <SidebarItem icon={Settings} label="Settings" to="/dashboard/settings" active={location.pathname === '/dashboard/settings'} onClick={closeSidebar} />
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0" role="banner">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 w-72 lg:w-96">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" aria-hidden="true" />
              <label htmlFor="global-search" className="sr-only">Search documents or clauses</label>
              <input
                id="global-search"
                type="search"
                placeholder="Search documents or clauses..."
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm" aria-label="User profile">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
