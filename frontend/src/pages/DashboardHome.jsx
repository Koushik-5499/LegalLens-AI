import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, AlertCircle, CheckCircle2, Clock, Search, Filter, Trash2, Eye, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { getFromStorage, saveToStorage, formatFileSize } from '../utils/api';

export default function DashboardHome() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const history = getFromStorage('document_history') || [];
    setDocuments(history);
    setLoading(false);
  }, []);

  const handleDelete = (id) => {
    const updated = documents.filter(doc => doc.id !== id);
    setDocuments(updated);
    saveToStorage('document_history', updated);
    setDeleteConfirm(null);
  };

  const handleViewAnalysis = (doc) => {
    if (doc.result) {
      saveToStorage('analysis_result', doc.result);
      saveToStorage('analysis_file_name', doc.fileName);
      navigate('/dashboard/analysis');
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || doc.fileType === filterType;
      const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => ({
    total: documents.length,
    analyzed: documents.filter(d => d.status === 'Analyzed').length,
    failed: documents.filter(d => d.status === 'Failed').length,
  }), [documents]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Documents</h1>
          <p className="text-slate-500 mt-1">View and manage your analyzed legal documents.</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Analyze New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Documents" value={stats.total} icon={<FileText className="w-6 h-6 text-blue-600" />} />
        <StatCard label="Analyzed" value={stats.analyzed} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} />
        <StatCard label="Failed" value={stats.failed} icon={<XCircle className="w-6 h-6 text-red-500" />} />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <label htmlFor="doc-search" className="sr-only">Search documents</label>
            <input
              id="doc-search"
              type="search"
              placeholder="Search by file name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="filter-type" className="sr-only">Filter by file type</label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="TXT">TXT</option>
            </select>
            <label htmlFor="filter-status" className="sr-only">Filter by status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Analyzed">Analyzed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Document list */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300 animate-pulse" aria-hidden="true" />
            <p className="font-medium">Loading documents…</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
            <p className="font-semibold text-slate-900 mb-1">
              {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
            </p>
            <p className="text-sm text-slate-500 mb-4">
              {documents.length === 0
                ? 'Upload and analyze your first legal document to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
            {documents.length === 0 && (
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Analyze Document
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 sm:py-4 hover:bg-slate-50 transition-colors gap-3">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.fileType} • {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    doc.status === 'Analyzed'
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {doc.status === 'Analyzed' ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                    {doc.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {doc.status === 'Analyzed' && (
                      <button
                        onClick={() => handleViewAnalysis(doc)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center gap-1.5"
                        aria-label={`View analysis for ${doc.fileName}`}
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" /> View
                      </button>
                    )}
                    {deleteConfirm === doc.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          aria-label="Confirm delete"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs font-medium text-slate-500 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                          aria-label="Cancel delete"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(doc.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        aria-label={`Delete ${doc.fileName}`}
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about local storage */}
      <p className="text-xs text-slate-400 text-center">
        Document history is stored locally in your browser. Clearing browser data will remove this history.
      </p>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-semibold">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl shrink-0" aria-hidden="true">{icon}</div>
    </div>
  );
}
