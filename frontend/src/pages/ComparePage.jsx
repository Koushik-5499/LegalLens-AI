import React, { useState, useCallback } from 'react';
import { Upload, File, FileText, Loader2, Scale, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import API_BASE_URL, { validateFile, formatFileSize, getFileType, parseApiError } from '../utils/api';

export default function ComparePage() {
  const [files, setFiles] = useState([null, null]);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = useCallback((index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  }, [files]);

  const removeFile = useCallback((index) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
  }, [files]);

  const handleCompare = async () => {
    if (!files[0] || !files[1] || comparing) return;

    setComparing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('documents', files[0]);
    formData.append('documents', files[1]);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      setResult(res.data.comparison);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setComparing(false);
    }
  };

  const bothSelected = files[0] && files[1];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Compare Documents</h1>
        <p className="text-slate-500">Upload two versions of a document to identify what changed.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <UploadBox
          label="Document A (Original)"
          file={files[0]}
          onChange={(e) => handleFileChange(0, e)}
          onRemove={() => removeFile(0)}
          disabled={comparing}
        />
        <UploadBox
          label="Document B (Revised)"
          file={files[1]}
          onChange={(e) => handleFileChange(1, e)}
          onRemove={() => removeFile(1)}
          disabled={comparing}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!bothSelected || comparing}
          className={clsx(
            "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            bothSelected && !comparing
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
          aria-label={comparing ? 'Comparing documents' : 'Compare the two uploaded documents'}
        >
          {comparing ? (
            <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Comparing…</>
          ) : (
            <><Scale className="w-5 h-5" aria-hidden="true" /> Compare Documents</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 sm:space-y-8" aria-label="Comparison results">

          {/* Summary */}
          <section className="bg-blue-50 border border-blue-100 p-5 sm:p-6 rounded-xl">
            <h2 className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5" aria-hidden="true" /> Summary of Changes
            </h2>
            <p className="text-blue-800 leading-relaxed">{result.summary || 'No summary available.'}</p>
          </section>

          {/* Added / Removed */}
          <div className="grid sm:grid-cols-2 gap-6">
            <ChangeList
              title="Added Clauses"
              items={result.addedClauses}
              emptyText="No additions found."
              colorScheme="emerald"
            />
            <ChangeList
              title="Removed Clauses"
              items={result.removedClauses}
              emptyText="No removals found."
              colorScheme="red"
              strikethrough
            />
          </div>

          {/* Modified */}
          <section>
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-4 bg-amber-50 py-2 px-4 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" /> Modified Clauses
            </h3>
            {(!result.modifiedClauses || result.modifiedClauses.length === 0) ? (
              <p className="text-sm text-slate-400 italic px-4">No modifications found.</p>
            ) : (
              <div className="space-y-4">
                {result.modifiedClauses.map((mod, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-700">{mod.explanation || `Change ${i + 1}`}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                      <div className="p-4 bg-red-50/40">
                        <p className="text-xs font-bold text-red-700 uppercase mb-2 tracking-wider">Original (A)</p>
                        <p className="text-sm text-red-900 bg-red-50 p-3 rounded-lg border border-red-100">{mod.original}</p>
                      </div>
                      <div className="p-4 bg-emerald-50/40">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-2 tracking-wider">Revised (B)</p>
                        <p className="text-sm text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{mod.new}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center">
        AI-generated comparison is for informational purposes only and does not constitute legal advice.
      </p>
    </div>
  );
}

function UploadBox({ label, file, onChange, onRemove, disabled }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">{label}</h3>
      <div className={clsx(
        "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all relative",
        "focus-within:ring-2 focus-within:ring-blue-500",
        disabled ? "opacity-50 pointer-events-none" : "hover:border-blue-400 hover:bg-blue-50"
      )}>
        {!file ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-600">Click to upload</p>
            <p className="text-xs text-slate-400">PDF, DOCX, or TXT</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate max-w-full" title={file.name}>{file.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(file.size)} • {getFileType(file.name)}</p>
            <button
              onClick={(e) => { e.preventDefault(); onRemove(); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1"
              aria-label={`Remove ${file.name}`}
            >
              Remove
            </button>
          </div>
        )}
        {!file && (
          <>
            <label htmlFor={`compare-upload-${label}`} className="sr-only">Upload {label}</label>
            <input
              id={`compare-upload-${label}`}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onChange}
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={disabled}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ChangeList({ title, items, emptyText, colorScheme, strikethrough }) {
  const colors = {
    emerald: { heading: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    red: { heading: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' },
  };
  const c = colors[colorScheme] || colors.emerald;

  return (
    <div>
      <h3 className={clsx("font-bold flex items-center gap-2 mb-4 py-2 px-4 rounded-lg", c.bg, c.heading)}>
        <span className={clsx("w-2.5 h-2.5 rounded-full", c.dot)} aria-hidden="true" /> {title}
      </h3>
      {(!items || items.length === 0) ? (
        <p className="text-sm text-slate-400 italic px-4">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className={clsx(
              "text-sm bg-white border p-3 rounded-lg shadow-sm text-slate-700",
              c.border,
              strikethrough && "line-through decoration-red-300"
            )}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
