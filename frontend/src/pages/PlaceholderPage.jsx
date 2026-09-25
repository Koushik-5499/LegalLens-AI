import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8" role="status">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
        <Construction className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-6">
        This page is under construction and will be available in a future update.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-3 py-2"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Dashboard
      </Link>
    </div>
  );
}
