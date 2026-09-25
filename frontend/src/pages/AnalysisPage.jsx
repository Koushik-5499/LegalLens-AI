import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle2, ChevronRight, MessageSquare, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function AnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    // Load data from localStorage (actual analysis result)
    const loadData = () => {
      const resultStr = localStorage.getItem('analysis_result');
      if (resultStr) {
        try {
          setData(JSON.parse(resultStr));
        } catch(e) {
          console.error("Failed to parse analysis");
        }
      }
      setLoading(false);
    };
    
    // Slight delay to simulate natural transition
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setChatLog([...chatLog, { role: 'user', content: userQ }]);
    setQuery('');
    setAsking(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${API_URL}/api/ask`, {
        query: userQ,
        documentText: data.extractedText
      });
      setChatLog(prev => [...prev, { role: 'ai', content: res.data.answer.answer, source: res.data.answer.source }]);
      setAsking(false);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { role: 'ai', content: "AI analysis is temporarily unavailable. Please try again." }]);
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No analysis found. Please upload a document first.</p>
      </div>
    );
  }

  const { analysis } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{analysis.documentType || 'Document Analysis'}</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Analysis Complete
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Analysis Content */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Executive Summary */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {analysis.summary}
            </p>
          </section>

          {/* Important Information Cards */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Key Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Parties Involved" value={analysis.parties?.join(' & ')} />
              <InfoCard label="Important Dates" value={analysis.importantDates?.join(', ')} />
              <InfoCard label="Financial Terms" value={analysis.financialTerms?.join(', ')} />
            </div>
          </section>

          {/* Attention Areas */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Requires Attention
            </h2>
            <div className="space-y-4">
              {(!analysis.attentionAreas || analysis.attentionAreas.length === 0) ? (
                <p className="text-slate-500 text-sm italic">No specific attention areas identified.</p>
              ) : analysis.attentionAreas.map((area, idx) => (
                <div key={idx} className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                  <h3 className="font-bold text-red-900 mb-2">{area.title}</h3>
                  <p className="text-red-800 text-sm mb-4">{area.reason}</p>
                  <div className="bg-white p-3 rounded-lg border border-red-100 text-sm text-slate-600 font-mono mb-3">
                    "{area.excerpt}"
                  </div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Ref: {area.location}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Clauses */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Important Clauses Explained</h2>
            <div className="space-y-4">
              {(!analysis.keyClauses || analysis.keyClauses.length === 0) ? (
                <p className="text-slate-500 text-sm italic">No key clauses identified.</p>
              ) : analysis.keyClauses.map((clause, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-900">{clause.title}</h3>
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      clause.attentionLevel === 'Important' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {clause.attentionLevel}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mb-3">{clause.explanation}</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-500 font-mono mb-2">
                    "{clause.excerpt}"
                  </div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Ref: {clause.location}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Q&A & Lawyer Prep */}
        <div className="space-y-8">
          
          {/* Ask Document */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Ask Your Document
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatLog.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">
                  Ask a question about the document.<br/>e.g., "What is the notice period?"
                </div>
              ) : (
                chatLog.map((msg, i) => (
                  <div key={i} className={clsx("max-w-[90%] rounded-2xl p-3 text-sm", msg.role === 'user' ? "bg-blue-600 text-white self-end ml-auto" : "bg-white border border-slate-200 text-slate-800")}>
                    <p>{msg.content}</p>
                    {msg.source && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                        Source: {msg.source}
                      </div>
                    )}
                  </div>
                ))
              )}
              {asking && (
                <div className="bg-white border border-slate-200 text-slate-800 max-w-[90%] rounded-2xl p-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing document...
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
              <form onSubmit={handleAsk} className="flex gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={asking}
                />
                <button 
                  type="submit"
                  disabled={asking || !query.trim()}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </section>

          {/* Questions for Lawyer */}
          <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Prepare for Lawyer
            </h2>
            <p className="text-slate-400 text-sm mb-4">Consider asking a qualified legal professional the following questions based on this analysis:</p>
            <ul className="space-y-3">
              {(!analysis.questionsForLawyer || analysis.questionsForLawyer.length === 0) ? (
                <p className="text-slate-500 text-sm italic">No specific questions generated.</p>
              ) : analysis.questionsForLawyer.map((q, idx) => (
                <li key={idx} className="flex gap-3 text-sm bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-blue-400 font-bold">{idx + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  if (!value) return null;
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}
