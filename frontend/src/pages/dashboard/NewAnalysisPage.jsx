import React, { useState, useEffect } from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCode, Loader2, ChevronRight, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, ArrowLeft, FileUp } from 'lucide-react';
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
      const allowedExtensions = ['.java', '.py', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.c', '.h', '.cs', '.rb', '.php', '.kt', '.go', '.rs', '.swift', '.scala', '.txt', '.zip'];
      while (queue.length > 0) {
        const entry = queue.shift();
        if (entry.name.startsWith('.')) continue;
        
        if (entry.isFile) {
          const ext = entry.name.includes('.') ? entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase() : '';
          if (allowedExtensions.includes(ext) || ext === '') {
            const file = await new Promise((resolve) => entry.file(resolve));
            if (file.size <= 52428800) { // 50MB Limit
              Object.defineProperty(file, 'webkitRelativePath', {
                value: entry.fullPath.replace(/^\//, ''),
                writable: true
              });
              files.push(file);
            } else {
              toast.error(`File ${file.name} exceeds 50MB limit.`);
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
        <div className="absolute left-0 top-[16px] -translate-y-1/2 w-full h-1 bg-[var(--border-default)] z-0 rounded-full"></div>
        
        {/* Active progress line */}
        <div 
          className="absolute left-0 top-[16px] -translate-y-1/2 h-1 bg-[var(--accent)] z-0 transition-all duration-500 ease-in-out rounded-full shadow-[0_0_10px_var(--accent)]/50" 
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>

        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Analyze' },
          { num: 4, label: 'Results' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-[var(--bg-primary)] px-4 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step > s.num ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30' : 
              step === s.num ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/30' : 
              'bg-[var(--bg-surface)] border-2 border-[var(--border-default)] text-[var(--text-tertiary)]'
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
          <div className="flex flex-col items-center max-w-3xl mx-auto text-center space-y-8">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px]">1</span>
                Source Code Selection
              </div>
              <h3 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Upload Submissions</h3>
              <p className="text-[var(--text-secondary)] text-base max-w-xl mx-auto">
                Drag and drop individual source files or zipped archives. Our parsing system automatically normalizes directory structures before generating ASTs.
              </p>
            </div>
            
            {/* Full-width High-Contrast Dropzone */}
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative flex min-h-[22rem] w-full cursor-pointer flex-col items-center justify-center gap-8 rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 overflow-hidden group ${
                isDragging 
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.02] shadow-[0_0_40px_var(--accent)]/20' 
                  : 'border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/10'
              }`}
            >
              <input
                type="file"
                multiple
                webkitdirectory="true"
                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                onChange={handleFileInput}
              />
              
              <div className="relative">
                {/* Expanding pulse circles on drag */}
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${isDragging ? 'bg-[var(--accent)]/20 scale-[2] blur-xl' : 'bg-[var(--accent)]/10 scale-150 blur-lg group-hover:scale-[1.75]'}`}></div>
                
                {/* Prominent Circular Upload Button */}
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 z-10 ${
                  isDragging 
                    ? 'bg-[var(--accent)] text-white shadow-2xl shadow-[var(--accent)]/40 -translate-y-2 scale-110' 
                    : 'bg-[var(--bg-primary)] border-2 border-[var(--accent)]/20 text-[var(--accent)] shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-[var(--accent)]/40'
                }`}>
                  <Upload size={40} className={`transition-transform duration-300 ${isDragging ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                </div>
              </div>
              
              <div className="relative z-10 space-y-3 bg-[var(--bg-primary)]/40 backdrop-blur-sm p-6 rounded-2xl border border-[var(--accent)]/10">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  Drag and drop files to analyze
                </p>
                <p className="text-base text-[var(--text-secondary)]">
                  or <span className="text-[var(--accent)] font-semibold underline decoration-2 underline-offset-4 cursor-pointer">browse your computer</span>
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 mt-2 border-t border-[var(--accent)]/10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold">
                    <FileUp size={16} /> ZIP Archives
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold">
                    <FileCode size={16} /> Source Folders
                  </div>
                </div>
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
