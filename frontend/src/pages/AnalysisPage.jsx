import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, FileText, CheckCircle2, ChevronRight, MessageSquare,
  Loader2, Users, Calendar, DollarSign, ShieldAlert, BookOpen,
  AlertTriangle, Send, Lightbulb, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import API_BASE_URL, { parseApiError, getFromStorage } from '../utils/api';

// === ATTENTION LEVEL STYLING ===
function getAttentionStyle(level) {
  if (!level) return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Notice' };
  const l = level.toLowerCase();
  if (l.includes('high') || l.includes('critical') || l.includes('severe') || l.includes('danger'))
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: level };
  if (l.includes('medium') || l.includes('important') || l.includes('moderate'))
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: level };
  if (l.includes('low') || l.includes('minor') || l.includes('informational'))
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: level };
  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: level };
}

// === SUGGESTED QUESTIONS ===
const SUGGESTED_QUESTIONS = [
  "What are the payment terms?",
  "What are the termination conditions?",
  "What are the major risks?",
  "Who are the parties?",
  "Are there important deadlines?",
  "Explain this agreement in simple language."
];

export default function AnalysisPage() {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [asking, setAsking] = useState(false);
  const chatScrollRef = useRef(null);
  const chatInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = getFromStorage('analysis_result');
      const name = getFromStorage('analysis_file_name');
      if (result) setData(result);
      if (name) setFileName(name);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatLog, asking]);

  const askQuestion = useCallback(async (questionText) => {
    if (!questionText?.trim() || asking) return;

    const userQ = questionText.trim();
    setChatLog(prev => [...prev, { role: 'user', content: userQ }]);
    setQuery('');
    setAsking(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/ask`, {
        query: userQ,
        documentText: data?.extractedText || ''
      }, { timeout: 120000 });

      // Handle varied response structures from backend
      const answer = res.data?.answer;
      let content = '';
      let source = '';

      if (typeof answer === 'string') {
        content = answer;
      } else if (answer && typeof answer === 'object') {
        content = answer.answer || answer.content || JSON.stringify(answer);
        source = answer.source || answer.reference || '';
      } else {
        content = 'No answer was returned. Please try rephrasing your question.';
      }

      setChatLog(prev => [...prev, { role: 'ai', content, source }]);
    } catch (err) {
      setChatLog(prev => [...prev, {
        role: 'ai',
        content: parseApiError(err),
        isError: true
      }]);
    } finally {
      setAsking(false);
      chatInputRef.current?.focus();
    }
  }, [asking, data]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    askQuestion(query);
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4" role="status" aria-label="Loading analysis">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" aria-hidden="true" />
        <p className="text-slate-500 font-medium">Loading analysis…</p>
      </div>
    );
  }

  // === EMPTY STATE ===
  if (!data || !data.analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Analysis Found</h2>
        <p className="text-slate-500 max-w-md">Upload and analyze a document to see results here.</p>
        <button
          onClick={() => navigate('/dashboard/upload')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Upload Document
        </button>
      </div>
    );
  }

  const { analysis } = data;

  // Safely access arrays with fallbacks
  const parties = Array.isArray(analysis.parties) ? analysis.parties : [];
  const dates = Array.isArray(analysis.importantDates) ? analysis.importantDates : [];
  const financials = Array.isArray(analysis.financialTerms) ? analysis.financialTerms : [];
  const clauses = Array.isArray(analysis.keyClauses) ? analysis.keyClauses : [];
  const attentionAreas = Array.isArray(analysis.attentionAreas) ? analysis.attentionAreas : [];
  const lawyerQuestions = Array.isArray(analysis.questionsForLawyer) ? analysis.questionsForLawyer : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

      {/* AI Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3" role="alert">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-blue-800">
          <strong>AI-Generated Informational Analysis.</strong> This does not constitute legal advice.
          Consult a qualified legal professional for official guidance.
        </p>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {analysis.documentType || 'Document Analysis'}
          </h1>
          {fileName && <p className="text-sm text-slate-500 mt-1">Source: {fileName}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Analysis Complete
            </span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

        {/* === LEFT COLUMN: Analysis === */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Executive Summary */}
          <section className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="summary-title">
            <h2 id="summary-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" /> Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
              {analysis.summary || 'No summary available.'}
            </p>
          </section>

          {/* Key Details */}
          <section aria-labelledby="details-title">
            <h2 id="details-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Key Document Details</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <DetailCard icon={<Users className="w-5 h-5" />} label="Parties" items={parties} />
              <DetailCard icon={<Calendar className="w-5 h-5" />} label="Important Dates" items={dates} />
              <DetailCard icon={<DollarSign className="w-5 h-5" />} label="Financial Terms" items={financials} />
            </div>
          </section>

          {/* Risks & Attention Areas */}
          {attentionAreas.length > 0 && (
            <section aria-labelledby="risks-title">
              <h2 id="risks-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" /> Risks & Attention Areas
              </h2>
              <div className="space-y-4">
                {attentionAreas.map((area, idx) => (
                  <article key={idx} className="bg-red-50 border border-red-100 p-5 sm:p-6 rounded-2xl">
                    <h3 className="font-bold text-red-900 text-lg mb-2">{area.title || `Attention Area ${idx + 1}`}</h3>
                    <p className="text-red-800 mb-4">{area.reason}</p>
                    {area.excerpt && (
                      <blockquote className="bg-white p-4 rounded-xl border border-red-100 text-sm text-slate-700 italic mb-3">
                        "{area.excerpt}"
                      </blockquote>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {area.location && (
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" aria-hidden="true" /> {area.location}
                        </span>
                      )}
                      {area.suggestedQuestion && (
                        <button
                          onClick={() => askQuestion(area.suggestedQuestion)}
                          className="text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          Ask AI about this →
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Extracted Clauses */}
          <section aria-labelledby="clauses-title">
            <h2 id="clauses-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-slate-700" aria-hidden="true" /> Extracted Clauses
              {clauses.length > 0 && (
                <span className="text-sm font-normal text-slate-500">({clauses.length} found)</span>
              )}
            </h2>
            {clauses.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500 italic">
                No specific clauses were extracted from this document.
              </div>
            ) : (
              <div className="space-y-4">
                {clauses.map((clause, idx) => {
                  const style = getAttentionStyle(clause.attentionLevel);
                  return (
                    <article key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                        <h3 className="font-bold text-slate-900 text-lg">{clause.title || `Clause ${idx + 1}`}</h3>
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0",
                          style.bg, style.text, style.border
                        )}>
                          {style.label}
                        </span>
                      </div>
                      {clause.explanation && (
                        <p className="text-slate-700 mb-4 leading-relaxed">{clause.explanation}</p>
                      )}
                      {clause.excerpt && (
                        <blockquote className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic mb-3">
                          "{clause.excerpt}"
                        </blockquote>
                      )}
                      {clause.location && (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" aria-hidden="true" /> {clause.location}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* === RIGHT COLUMN: Chat & Lawyer === */}
        <div className="space-y-6 sm:space-y-8">

          {/* Ask Document */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-auto lg:h-[580px] overflow-hidden lg:sticky lg:top-4" aria-labelledby="ask-title">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
              <h2 id="ask-title" className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" aria-hidden="true" /> Ask Your Document
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ask questions grounded in the uploaded document.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-[200px] lg:min-h-0" ref={chatScrollRef}>
              {chatLog.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 text-center mb-3">Try asking:</p>
                  {SUGGESTED_QUESTIONS.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => askQuestion(sq)}
                      disabled={asking}
                      className="w-full text-left p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                    >
                      <Lightbulb className="w-4 h-4 inline mr-2 text-amber-500" aria-hidden="true" />
                      {sq}
                    </button>
                  ))}
                </div>
              ) : (
                chatLog.map((msg, i) => (
                  <div key={i} className={clsx(
                    "max-w-[90%] rounded-2xl p-4 text-sm",
                    msg.role === 'user'
                      ? "bg-blue-600 text-white ml-auto rounded-br-sm"
                      : msg.isError
                        ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.source && (
                      <div className={clsx(
                        "mt-3 pt-3 text-xs font-medium border-t",
                        msg.role === 'user' ? "border-blue-500/40 text-blue-200" : "border-slate-200 text-slate-500"
                      )}>
                        <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Source:</span>
                        <span className="italic">{msg.source}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {asking && (
                <div className="bg-slate-50 border border-slate-200 max-w-[80%] rounded-2xl rounded-bl-sm p-4 text-sm flex items-center gap-3" role="status">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" aria-hidden="true" />
                  <span className="text-slate-600 font-medium">Analyzing…</span>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="ask-input" className="sr-only">Type your question about the document</label>
                <input
                  id="ask-input"
                  ref={chatInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-slate-50 focus:bg-white"
                  disabled={asking}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={asking || !query.trim()}
                  className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label="Send question"
                >
                  <Send className="w-5 h-5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </section>

          {/* Questions for Lawyer */}
          {lawyerQuestions.length > 0 && (
            <section className="bg-slate-900 rounded-2xl p-5 sm:p-8 text-white shadow-xl" aria-labelledby="lawyer-title">
              <h2 id="lawyer-title" className="font-bold text-lg sm:text-xl mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-400" aria-hidden="true" /> Questions for Your Lawyer
              </h2>
              <p className="text-slate-300 text-sm mb-5">Consider asking a qualified professional these questions:</p>
              <ol className="space-y-3 list-none">
                {lawyerQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-blue-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                    <span className="text-slate-200 leading-relaxed">{q}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// === Detail Card Component ===
function DetailCard({ icon, label, items }) {
  const hasData = items.length > 0 && !items.every(i => i === 'Not found in the document.');

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-500" aria-hidden="true">{icon}</div>
        <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</h3>
      </div>
      {hasData ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm font-semibold text-slate-800">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 italic">Not specified</p>
      )}
    </div>
  );
}
