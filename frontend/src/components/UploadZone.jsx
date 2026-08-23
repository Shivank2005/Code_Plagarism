import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, FileCode, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';

const UploadZone = ({ onUploadSuccess }) => {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragover');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setUploading(true);
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
        
        // Skip hidden files/directories (like .git, .DS_Store)
        if (entry.name.startsWith('.')) continue;
        
        if (entry.isFile) {
          const ext = entry.name.includes('.') ? entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase() : '';
          if (allowedExtensions.includes(ext) || ext === '') {
            const file = await new Promise((resolve) => entry.file(resolve));
            // Skip files larger than 1MB to prevent browser memory crash
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
        uploadFiles(files);
      } else {
        setUploading(false);
      }
    } catch (err) {
      console.error("Error reading dropped files:", err);
      toast.error("Failed to read folder contents.");
      setUploading(false);
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    setError(null);
    
    // Filter for code files
    const validExts = ['.java', '.py', '.cpp', '.c', '.h', '.js', '.ts', '.cs', '.go', '.rs', '.txt', '.zip'];
    const validFiles = fileList.filter(f => 
      validExts.some(ext => f.name.toLowerCase().endsWith(ext)) || f.type.startsWith('text/')
    );

    if (validFiles.length === 0) {
      toast.error("Invalid file type: Please upload code files or ZIP archives only.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    validFiles.forEach((file) => {
      const relativeName = file.webkitRelativePath || file.name;
      formData.append('file', file, relativeName);
    });

    try {
      const res = await axios.post(`${API_BASE}/api/submissions/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const files = await Promise.all(
        validFiles.map(async (file) => ({
          id: file.webkitRelativePath || file.name,
          code: await file.text(),
        })),
      );
      toast.success("Upload successful!");
      onUploadSuccess({ ...res.data, files });
    } catch (err) {
      console.error('Upload error:', err);
      const message = err.response?.data?.message || err.message || 'Upload failed. Please check the backend connection.';
      toast.error(message);
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card relative flex min-h-[20rem] cursor-pointer flex-col items-center justify-center gap-5 p-6 sm:p-8"
        style={{
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: isDragging ? 'var(--accent)' : 'var(--border-default)',
          background: isDragging ? 'var(--accent-muted)' : 'var(--bg-secondary)',
          transition: 'border-color 0.2s ease, background 0.2s ease',
        }}
      >
        <input
          type="file"
          multiple
          webkitdirectory="true"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.length && uploadFiles(Array.from(e.target.files))}
        />

        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            background: isDragging ? 'var(--accent)' : 'var(--bg-surface)',
            color: isDragging ? '#fff' : 'var(--text-tertiary)',
          }}
        >
          {uploading ? <Loader2 className="animate-spin" size={28} /> : <Upload size={28} />}
        </div>

        {/* Text */}
        <div className="text-center">
          <h4
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {uploading ? 'Uploading...' : isDragging ? 'Drop to upload' : 'Drop files here'}
          </h4>
          <p
            className="text-sm max-w-[260px] mx-auto"
            style={{ color: 'var(--text-tertiary)', lineHeight: '1.6' }}
          >
            Drag and drop a folder, ZIP archive, or code files to begin analysis.
          </p>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="badge badge-neutral">
            <FileCode size={12} /> JAVA
          </span>
          <span className="badge badge-neutral">
            <FileCode size={12} /> PYTHON
          </span>
          <span className="badge badge-neutral">
            <FileCode size={12} /> ZIP
          </span>
        </div>
      </motion.div>

      
    </div>
  );
};

export default UploadZone;
