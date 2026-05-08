import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, FileCode, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadFile(files[0]);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8082/api/submissions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(res.data);
    } catch (err) {
      setError('Upload failed. Please check the backend connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`glass-card relative flex h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-8 transition-all duration-500 ${
          isDragging ? 'scale-[1.02] border-cyan-300/80 bg-cyan-500/20' : 'border-cyan-100/25 hover:border-cyan-100/45'
        }`}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
        />

        <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-500 ${
          isDragging ? 'rotate-6 bg-cyan-500 text-white' : 'bg-cyan-900/50 text-cyan-100/70 group-hover:bg-cyan-800/60 group-hover:text-cyan-100'
        }`}>
          {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
        </div>

        <div className="text-center">
          <h4 className="font-display mb-2 text-xl font-bold text-white">
            {uploading ? 'Processing Data...' : isDragging ? 'Release to Start' : 'Initialize Analysis'}
          </h4>
          <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-cyan-100/70">
            Drag and drop your ZIP archive or code files to begin structural verification.
          </p>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-6 flex gap-3">
          <Badge icon={<FileCode size={12}/>} label="JAVA" />
          <Badge icon={<FileCode size={12}/>} label="PYTHON" />
          <Badge icon={<FileCode size={12}/>} label="ZIP" />
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-rose-100/30 bg-rose-500/20 p-4 text-sm font-medium text-rose-100"
        >
          <AlertCircle size={18} /> {error}
        </motion.div>
      )}
    </div>
  );
};

const Badge = ({ icon, label }) => (
  <div className="flex items-center gap-2 rounded-full border border-cyan-100/25 bg-cyan-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100/75">
    {icon} {label}
  </div>
);

export default UploadZone;
