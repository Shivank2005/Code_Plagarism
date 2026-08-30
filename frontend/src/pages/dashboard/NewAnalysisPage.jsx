import React, { useState, useEffect } from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCode, Loader2, ChevronRight, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';

export default function NewAnalysisPage() {
  const { token } = useAuth();
  const { handleUploadSuccess, isAnalyzing } = usePlagShield();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auto-redirect if analysis finishes
  useEffect(() => {
    if (step === 3 && !isAnalyzing && selectedFiles.length > 0 && !uploading) {
      setStep(4);
    }
  }, [step, isAnalyzing, selectedFiles, uploading]);

  const handleDrag = (e) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragover');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const files = [];
    const queue = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) queue.push(entry);
      }
    }

    const processQueue = async () => {
      const allowedExtensions = ['.java', '.py', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.c', '.h', '.cs', '.rb', '.php', '.kt', '.go', '.rs', '.swift', '.scala', '.txt'];
      while (queue.length > 0) {
        const entry = queue.shift();
        if (entry.name.startsWith('.')) continue;
        
        if (entry.isFile) {
          const ext = entry.name.includes('.') ? entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase() : '';
          if (allowedExtensions.includes(ext) || ext === '') {
            const file = await new Promise((resolve) => entry.file(resolve));
            if (file.size <= 1048576) {
              Object.defineProperty(file, 'webkitRelativePath', {
                value: entry.fullPath.replace(/^\//, ''),
                writable: true
              });
              files.push(file);
            }
          }
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          const entries = await new Promise((resolve) => reader.readEntries(resolve));
          queue.push(...entries);
        }
      }
    };

    try {
      await processQueue();
      if (files.length > 0) {
        processSelectedFiles(files);
      }
    } catch (err) {
      toast.error("Failed to read folder contents.");
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (fileList) => {
    const validExts = ['.java', '.py', '.cpp', '.c', '.h', '.js', '.ts', '.cs', '.go', '.rs', '.txt', '.zip'];
    const validFiles = fileList.filter(f => 
      validExts.some(ext => f.name.toLowerCase().endsWith(ext)) || f.type.startsWith('text/')
    );

    if (validFiles.length === 0) {
      toast.error("Invalid file type: Please upload code files or ZIP archives only.");
      return;
    }
    
    setSelectedFiles(validFiles);
    setStep(2); // Go to review step
  };

  const executeUploadAndAnalysis = async () => {
    setUploading(true);
    setStep(3); // Go to processing step

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      const relativeName = file.webkitRelativePath || file.name;
      formData.append('file', file, relativeName);
    });

    try {
      const res = await axios.post(`${API_BASE}/api/submissions/upload`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const parsedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          id: file.webkitRelativePath || file.name,
          code: await file.text(),
        })),
      );
      toast.success("Upload successful, analysis starting!");
      
      // Call the hook's central logic
      handleUploadSuccess({ ...res.data, files: parsedFiles });
      setUploading(false);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Upload failed.';
      toast.error(message);
      setUploading(false);
      setStep(2); // Back to review
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Investigation</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Follow the steps to submit code files and generate a comprehensive plagiarism report.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-12">
        {/* Background track line */}
        <div className="absolute left-0 top-[16px] -translate-y-1/2 w-full h-0.5 bg-[var(--border-default)] -z-10"></div>
        
        {/* Active progress line */}
        <div 
          className="absolute left-0 top-[16px] -translate-y-1/2 h-0.5 bg-[var(--accent)] -z-10 transition-all duration-500 ease-in-out" 
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>

        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Analyze' },
          { num: 4, label: 'Results' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-[var(--bg-primary)] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
              step > s.num ? 'bg-[var(--accent)] text-white' : 
              step === s.num ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20' : 
              'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-tertiary)]'
            }`}>
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </div>
            <span className={`text-xs font-semibold transition-colors duration-300 ${step >= s.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card p-8">
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">1. Select Files</h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Upload individual files or a ZIP archive containing the submissions you want to compare.
            </p>
            
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative flex min-h-[16rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border-default)] bg-[var(--bg-secondary)]'
              }`}
            >
              <input
                type="file"
                multiple
                webkitdirectory="true"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileInput}
              />
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isDragging ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)]'}`}>
                <Upload size={28} />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  Click or drag files here
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Supports folders, ZIP, Java, Python, C++, JS
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">2. Review Submissions</h3>
            
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedFiles.length} files selected
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB total
                </span>
              </div>
              <ul className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {selectedFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-elevated)] rounded-lg text-sm">
                    <FileCode size={16} className="text-[var(--text-tertiary)] shrink-0" />
                    <span className="truncate text-[var(--text-secondary)] font-mono text-xs">
                      {f.webkitRelativePath || f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={executeUploadAndAnalysis} className="btn-primary">
                Begin Analysis <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-20 rounded-full animate-pulse"></div>
              <Loader2 size={48} className="text-[var(--accent)] animate-spin relative" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Processing Analysis</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
                Uploading files, extracting ASTs, and running CodeBERT semantic embeddings. Please do not close this window.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Analysis Complete!</h3>
              <p className="text-[15px] text-[var(--text-secondary)] mt-2">
                The investigation has finished processing.
              </p>
            </div>
            <button 
              onClick={() => navigate('/analyses/latest/results')} 
              className="btn-primary py-3 px-8 mt-4"
            >
              View Results Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
