import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, Search, Users, Shield, History, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
      active 
        ? "bg-accent/10 text-accent" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={clsx("w-5 h-5", active ? "text-accent" : "text-slate-400")} />
    {label}
  </Link>
);

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent" />
            <span className="font-bold text-xl tracking-tight text-navy-900">LegalLens AI</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarItem icon={FileText} label="My Documents" to="/dashboard/documents" active={location.pathname === '/dashboard/documents'} />
          <SidebarItem icon={Upload} label="Analyze New" to="/dashboard/upload" active={location.pathname === '/dashboard/upload'} />
          <SidebarItem icon={Search} label="Ask Document" to="/dashboard/analysis" active={location.pathname === '/dashboard/analysis'} />
          <SidebarItem icon={Users} label="Compare Documents" to="/dashboard/compare" active={location.pathname === '/dashboard/compare'} />
          <SidebarItem icon={History} label="History" to="/dashboard/history" active={location.pathname === '/dashboard/history'} />
        </div>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <SidebarItem icon={Settings} label="Settings" to="/dashboard/settings" />
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm text-slate-600 hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-5 h-5 text-slate-400" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search documents or clauses..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
