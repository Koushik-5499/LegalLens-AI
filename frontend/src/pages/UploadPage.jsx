import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size exceeds the 10MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Store result in localStorage for the analysis page
      localStorage.setItem('analysis_result', JSON.stringify(response.data));
      navigate('/dashboard/analysis');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('AI analysis is temporarily unavailable. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Analyze a Document</h1>
      <p className="text-slate-500 mb-8">Upload a legal contract, agreement, or policy to extract key clauses, attention areas, and simple explanations.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div 
        className={clsx(
          "border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200",
          dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-400",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-900 mb-1">Drag and drop your document here</p>
            <p className="text-slate-500 text-sm">Supports PDF, DOCX, and TXT (Max 10MB)</p>
          </div>
          <div className="relative mt-4">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleChange}
              accept=".pdf,.docx,.txt"
              disabled={isUploading}
            />
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors pointer-events-none">
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {file && (
        <div className="mt-8 bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <File className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => setFile(null)} 
            className="text-slate-400 hover:text-red-500 p-2"
            disabled={isUploading}
          >
            Remove
          </button>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={clsx(
            "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors",
            file && !isUploading 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {isUploading && file ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</>
          ) : (
            'Start Analysis'
          )}
        </button>
      </div>
    </div>
  );
}
