import React, { useState } from 'react';
import { Upload, File, ArrowRight, Loader2, Scale } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function ComparePage() {
  const [files, setFiles] = useState([null, null]);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newFiles = [...files];
      newFiles[index] = file;
      setFiles(newFiles);
    }
  };

  const handleCompare = async () => {
    if (!files[0] || !files[1]) return;

    setComparing(true);
    setError('');
    const formData = new FormData();
    formData.append('documents', files[0]);
    formData.append('documents', files[1]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${API_URL}/api/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.comparison);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('AI comparison is temporarily unavailable. Please try again.');
      }
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Compare Documents</h1>
        <p className="text-slate-500">Upload two versions of a document to see exactly what changed.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl">
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <UploadBox 
          label="Original Document (A)" 
          file={files[0]} 
          onChange={(e) => handleFileChange(0, e)} 
        />
        <UploadBox 
          label="New Document (B)" 
          file={files[1]} 
          onChange={(e) => handleFileChange(1, e)} 
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleCompare}
          disabled={comparing || (!files[0] || !files[1])}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
        >
          {comparing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Comparing...</>
          ) : (
            <><Scale className="w-5 h-5" /> Compare Documents</>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
            <h2 className="font-bold text-blue-900 text-lg mb-2">Summary of Changes</h2>
            <p className="text-blue-800">{result.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4 bg-emerald-50 py-2 px-4 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Added
              </h3>
              <ul className="space-y-3">
                {result.addedClauses?.map((item, i) => (
                  <li key={i} className="text-sm bg-white border border-emerald-100 p-3 rounded-lg shadow-sm text-slate-700">
                    {item}
                  </li>
                ))}
                {(!result.addedClauses || result.addedClauses.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No additions found.</p>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4 bg-red-50 py-2 px-4 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Removed
              </h3>
              <ul className="space-y-3">
                {result.removedClauses?.map((item, i) => (
                  <li key={i} className="text-sm bg-white border border-red-100 p-3 rounded-lg shadow-sm text-slate-700 line-through decoration-red-300">
                    {item}
                  </li>
                ))}
                {(!result.removedClauses || result.removedClauses.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No removals found.</p>
                )}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-4 bg-amber-50 py-2 px-4 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Modified
            </h3>
            <div className="space-y-4">
              {(!result.modifiedClauses || result.modifiedClauses.length === 0) ? (
                <p className="text-sm text-slate-400 italic">No modifications found.</p>
              ) : result.modifiedClauses.map((mod, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{mod.explanation}</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="p-4 bg-red-50/30">
                      <p className="text-xs font-bold text-red-800 uppercase mb-2 tracking-wider">Original</p>
                      <p className="text-sm text-red-900 bg-red-100/50 p-2 rounded">{mod.original}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/30">
                      <p className="text-xs font-bold text-emerald-800 uppercase mb-2 tracking-wider">New</p>
                      <p className="text-sm text-emerald-900 bg-emerald-100/50 p-2 rounded">{mod.new}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function UploadBox({ label, file, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">{label}</h3>
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors relative">
        {!file ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">Click to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <File className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-900 max-w-[200px] truncate">{file.name}</p>
          </div>
        )}
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onChange}
          accept=".pdf,.docx,.txt"
        />
      </div>
    </div>
  );
}
