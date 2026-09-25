import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardHome() {
  const documents = [
    { id: 1, title: 'Employment Agreement - John Doe.pdf', type: 'PDF', date: '2024-03-15', status: 'Analyzed', pages: 5 },
    { id: 2, title: 'Non-Disclosure Agreement v2.docx', type: 'DOCX', date: '2024-03-12', status: 'Analyzed', pages: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, John</h1>
          <p className="text-slate-500">Here's an overview of your legal documents.</p>
        </div>
        <Link to="/dashboard/upload" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-600/10">
          <Plus className="w-5 h-5" />
          Analyze New Document
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Documents Analyzed" value="12" icon={<FileText className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Clauses Identified" value="48" icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} />
        <StatCard title="Attention Areas" value="7" icon={<AlertCircle className="w-6 h-6 text-amber-600" />} />
        <StatCard title="Questions Generated" value="24" icon={<Clock className="w-6 h-6 text-purple-600" />} />
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Documents</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Document</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Type</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Upload Date</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Pages</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    {doc.title}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{doc.type}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{doc.pages}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/dashboard/analysis" className="text-blue-600 font-medium hover:text-blue-800 text-sm">
                      View Analysis
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}
