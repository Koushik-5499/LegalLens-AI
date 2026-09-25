import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, ArrowRight, Zap, Scale } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-2xl tracking-tight text-slate-900">LegalLens AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-8">
          <Zap className="w-4 h-4" />
          AI-Powered Legal Assistance
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-8">
          Understand legal documents <span className="text-blue-600">before you sign.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a legal document and use AI to understand important clauses, obligations, deadlines, payments, and potential areas that deserve closer attention.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard/upload" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            Analyze a Document <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Understand & Analyze"
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
            description="Chat directly with your document and automatically generate a list of important questions to ask a qualified legal professional."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
