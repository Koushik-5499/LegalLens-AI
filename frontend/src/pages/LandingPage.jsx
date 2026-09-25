import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, ArrowRight, Zap, Scale, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto" role="navigation" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg" aria-label="LegalLens AI Home">
          <Shield className="w-8 h-8 text-blue-600" aria-hidden="true" />
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-900">LegalLens AI</span>
        </Link>
        <Link
          to="/dashboard"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Go to Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-8">
          <Zap className="w-4 h-4" aria-hidden="true" />
          AI-Powered Legal Document Analysis
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6 sm:mb-8">
          Understand legal documents{' '}
          <span className="text-blue-600">before you sign.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Upload a legal document and use AI to understand important clauses, obligations, deadlines, payments, and potential areas that deserve closer attention.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard/upload"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Analyze a Document <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-slate-400 max-w-lg mx-auto">
          AI-generated analysis is for informational purposes only and does not constitute legal advice.
          Always consult a qualified legal professional.
        </p>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-32 text-left" role="list" aria-label="Key features">
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Analyze & Understand"
            description="Turn complex legal language into simple explanations. Identify important clauses, obligations, deadlines, and payments automatically."
          />
          <FeatureCard
            icon={<Scale className="w-6 h-6 text-blue-600" />}
            title="Compare Versions"
            description="Upload two versions of a document and let AI highlight exactly what changed, what was removed, and what was added."
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
            title="Ask & Prepare"
            description="Chat directly with your document and generate a list of important questions to ask a qualified legal professional."
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>Your documents are never stored permanently</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" aria-hidden="true" />
            <span>Powered by Google Gemini AI</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300" role="listitem">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{description}</p>
    </div>
  );
}
