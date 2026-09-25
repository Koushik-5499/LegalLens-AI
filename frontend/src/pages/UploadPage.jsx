import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, XCircle, RefreshCw, File } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import API_BASE_URL, { validateFile, formatFileSize, getFileType, parseApiError, generateId, saveToStorage, getFromStorage } from '../utils/api';

const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

const STATE_LABELS = {
  [UPLOAD_STATES.UPLOADING]: 'Uploading document…',
  [UPLOAD_STATES.PROCESSING]: 'Extracting text…',
  [UPLOAD_STATES.ANALYZING]: 'Running AI analysis — this may take up to 60 seconds on first request…',
  [UPLOAD_STATES.COMPLETED]: 'Analysis complete!',
  [UPLOAD_STATES.FAILED]: 'Analysis failed'
};

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const startTimer = useCallback(() => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const isProcessing = uploadState !== UPLOAD_STATES.IDLE && uploadState !== UPLOAD_STATES.FAILED && uploadState !== UPLOAD_STATES.COMPLETED;

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [isProcessing]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isProcessing) return;
    if (e.dataTransfer.files?.[0]) {
      attemptSetFile(e.dataTransfer.files[0]);
    }
  }, [isProcessing]);

  const handleFileInput = useCallback((e) => {
    if (isProcessing) return;
    if (e.target.files?.[0]) {
      attemptSetFile(e.target.files[0]);
    }
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isProcessing]);

  const attemptSetFile = (selectedFile) => {
    setError('');
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setFile(selectedFile);
    setUploadState(UPLOAD_STATES.IDLE);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setUploadState(UPLOAD_STATES.IDLE);
    stopTimer();
  };

  const handleUpload = async () => {
    if (!file || isProcessing) return;

    setError('');
    setUploadState(UPLOAD_STATES.UPLOADING);
    startTimer();

    const formData = new FormData();
    formData.append('document', file);

    try {
      // Progress: uploading -> processing -> analyzing
      await new Promise(r => setTimeout(r, 600));
      setUploadState(UPLOAD_STATES.PROCESSING);
      await new Promise(r => setTimeout(r, 400));
      setUploadState(UPLOAD_STATES.ANALYZING);

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes for cold starts
      });

      stopTimer();
      setUploadState(UPLOAD_STATES.COMPLETED);

      // Save result with metadata for document history
      const docRecord = {
        id: generateId(),
        fileName: file.name,
        fileType: getFileType(file.name),
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'Analyzed',
        result: response.data
      };

      // Save analysis result for AnalysisPage
      saveToStorage('analysis_result', response.data);
      saveToStorage('analysis_file_name', file.name);

      // Append to document history
      const history = getFromStorage('document_history') || [];
      history.unshift(docRecord);
      saveToStorage('document_history', history.slice(0, 50)); // Keep last 50

      setTimeout(() => navigate('/dashboard/analysis'), 800);
    } catch (err) {
      stopTimer();
      setUploadState(UPLOAD_STATES.FAILED);
      setError(parseApiError(err));
    }
  };

  const getFileIcon = () => {
    if (!file) return <File className="w-8 h-8" aria-hidden="true" />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-500" aria-hidden="true" />;
    if (ext === 'docx') return <FileText className="w-8 h-8 text-blue-600" aria-hidden="true" />;
    return <FileText className="w-8 h-8 text-slate-500" aria-hidden="true" />;
  };

  const progressSteps = [
    { key: UPLOAD_STATES.UPLOADING, label: 'Upload' },
    { key: UPLOAD_STATES.PROCESSING, label: 'Extract Text' },
    { key: UPLOAD_STATES.ANALYZING, label: 'AI Analysis' },
    { key: UPLOAD_STATES.COMPLETED, label: 'Complete' }
  ];

  const currentStepIdx = progressSteps.findIndex(s => s.key === uploadState);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Analyze a Document</h1>
      <p className="text-slate-500 mb-8">Upload a legal contract, agreement, or policy to extract key clauses, attention areas, and plain-language explanations.</p>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          dragActive ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-300 bg-white hover:border-slate-400",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="region"
        aria-label="Document upload area"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            dragActive ? "bg-blue-100 text-blue-700" : "bg-blue-50 text-blue-600"
          )}>
            <Upload className="w-8 h-8" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 mb-1">Drag and drop your document here</p>
            <p className="text-slate-500 text-sm">Supports PDF, DOCX, and TXT • Max 10 MB</p>
          </div>
          <div className="relative mt-2">
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={isProcessing}
              aria-label="Select a document file to upload"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors cursor-pointer select-none"
            >
              Browse Files
            </label>
          </div>
        </div>
      </div>

      {/* Selected file preview */}
      {file && (
        <div className="mt-6 bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm" role="status" aria-label={`Selected file: ${file.name}`}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 bg-slate-50 rounded-lg shrink-0">
              {getFileIcon()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-sm text-slate-500">{formatFileSize(file.size)} • {getFileType(file.name)}</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            disabled={isProcessing}
            aria-label={`Remove file ${file.name}`}
          >
            <XCircle className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Progress tracker */}
      {uploadState !== UPLOAD_STATES.IDLE && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm" role="status" aria-live="polite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Analysis Progress</h3>
            {isProcessing && (
              <span className="text-xs text-slate-500 tabular-nums">{elapsedTime}s elapsed</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden" role="progressbar" aria-valuenow={uploadState === UPLOAD_STATES.FAILED ? 0 : Math.min(((currentStepIdx + 1) / progressSteps.length) * 100, 100)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-700",
                uploadState === UPLOAD_STATES.FAILED ? "bg-red-500" : uploadState === UPLOAD_STATES.COMPLETED ? "bg-emerald-500" : "bg-blue-600"
              )}
              style={{ width: uploadState === UPLOAD_STATES.FAILED ? '100%' : `${((currentStepIdx + 1) / progressSteps.length) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-2">
            {progressSteps.map((step, idx) => {
              const isPast = currentStepIdx > idx || uploadState === UPLOAD_STATES.COMPLETED;
              const isCurrent = uploadState === step.key;
              const isFailed = uploadState === UPLOAD_STATES.FAILED;

              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 text-center">
                  {isFailed && isCurrent ? (
                    <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                  ) : isPast ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-hidden="true" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" aria-hidden="true" />
                  )}
                  <span className={clsx(
                    "text-xs font-medium",
                    isPast ? "text-emerald-700" : isCurrent ? (isFailed ? "text-red-600" : "text-blue-600") : "text-slate-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status message */}
          {STATE_LABELS[uploadState] && (
            <p className={clsx(
              "mt-4 text-sm font-medium text-center",
              uploadState === UPLOAD_STATES.FAILED ? "text-red-600" : uploadState === UPLOAD_STATES.COMPLETED ? "text-emerald-600" : "text-slate-600"
            )}>
              {STATE_LABELS[uploadState]}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
        {uploadState === UPLOAD_STATES.FAILED && (
          <button
            onClick={handleUpload}
            className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" /> Retry Analysis
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className={clsx(
            "px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            file && !isProcessing
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
          aria-label={isProcessing ? 'Analysis in progress' : 'Start document analysis'}
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Processing…</>
          ) : (
            'Start Analysis'
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
        AI-generated analysis is for informational purposes only and does not constitute legal advice.
        Always consult a qualified legal professional before making legal decisions.
      </p>
    </div>
  );
}
