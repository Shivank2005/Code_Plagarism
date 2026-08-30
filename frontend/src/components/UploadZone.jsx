import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Upload,
  FileCode,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Play,
} from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:8082';

const UploadZone = ({ onUploadSuccess }) => {
  const { token } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);

  const allowedExtensions = [
    '.java',
    '.py',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.cpp',
    '.c',
    '.h',
    '.cs',
    '.rb',
    '.php',
    '.kt',
    '.go',
    '.rs',
    '.swift',
    '.scala',
    '.txt',
    '.zip',
  ];

  const handleDrag = (e) => {
    e.preventDefault();

    if (e.type === 'dragover') {
      setIsDragging(true);
    }

    if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processDroppedItems = async (items) => {
    const files = [];
    const queue = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();

        if (entry) {
          queue.push(entry);
        }
      }
    }

    while (queue.length > 0) {
      const entry = queue.shift();

      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isFile) {
        const ext = entry.name.includes('.')
          ? entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase()
          : '';

        if (allowedExtensions.includes(ext) || ext === '') {
          const file = await new Promise((resolve) =>
            entry.file(resolve)
          );

          if (file.size <= 1048576) {
            try {
              Object.defineProperty(file, 'webkitRelativePath', {
                value: entry.fullPath.replace(/^[/\\]+/, ''),
                writable: true,
              });
            } catch {
              // Ignore if browser does not allow redefining the property
            }

            files.push(file);
          }
        }
      } else if (entry.isDirectory) {
        const reader = entry.createReader();

        const entries = await new Promise((resolve) =>
          reader.readEntries(resolve)
        );

        queue.push(...entries);
      }
    }

    return files;
  };

  const addFiles = (fileList) => {
    const incomingFiles = Array.from(fileList || []);

    const validFiles = incomingFiles.filter((file) => {
      const name = file.name.toLowerCase();

      return (
        allowedExtensions.some((ext) => name.endsWith(ext)) ||
        file.type.startsWith('text/')
      );
    });

    if (validFiles.length === 0) {
      toast.error(
        'Invalid file type. Please select code files or ZIP archives.'
      );
      return;
    }

    const oversizedFiles = validFiles.filter(
      (file) => file.size > 1048576
    );

    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} file(s) exceed the 1MB limit.`
      );
    }

    const filesWithinLimit = validFiles.filter(
      (file) => file.size <= 1048576
    );

    setSelectedFiles((previousFiles) => {
      const existingKeys = new Set(
        previousFiles.map(
          (file) => file.webkitRelativePath || file.name
        )
      );

      const newFiles = filesWithinLimit.filter((file) => {
        const key = file.webkitRelativePath || file.name;

        return !existingKeys.has(key);
      });

      return [...previousFiles, ...newFiles];
    });

    setError(null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;

    if (!items || items.length === 0) {
      return;
    }

    try {
      const files = await processDroppedItems(items);

      if (files.length > 0) {
        addFiles(files);
      } else {
        toast.error('No valid code files found.');
      }
    } catch (err) {
      console.error('Error reading dropped files:', err);
      toast.error('Failed to read dropped files.');
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((files) =>
      files.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files first.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      const relativeName =
        file.webkitRelativePath || file.name;

      formData.append('file', file, relativeName);
    });

    try {
      const res = await axios.post(
        `${API_BASE}/api/submissions/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const files = await Promise.all(
        selectedFiles.map(async (file) => ({
          id: file.webkitRelativePath || file.name,
          code: file.name.toLowerCase().endsWith('.zip')
            ? ''
            : await file.text(),
        }))
      );

      toast.success('Analysis started successfully!');

      onUploadSuccess({
        ...res.data,
        files,
      });
    } catch (err) {
      console.error('Upload error:', err);

      const message =
        err.response?.data?.message ||
        err.message ||
        'Analysis failed. Please check the backend connection.';

      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {selectedFiles.length === 0 ? (
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
            borderColor: isDragging
              ? 'var(--accent)'
              : 'var(--border-default)',
            background: isDragging
              ? 'var(--accent-muted)'
              : 'var(--bg-secondary)',
            transition:
              'border-color 0.2s ease, background 0.2s ease',
          }}
        >
          <input
            type="file"
            multiple
            webkitdirectory="true"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              if (e.target.files?.length) {
                addFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl"
            style={{
              background: isDragging
                ? 'var(--accent)'
                : 'var(--bg-surface)',
              color: isDragging
                ? '#fff'
                : 'var(--accent)',
            }}
          >
            <Upload size={28} />
          </div>

          <div className="text-center">
            <h4
              className="mb-1 text-lg font-semibold"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              {isDragging
                ? 'Drop files here'
                : 'Select Source Code'}
            </h4>

            <p
              className="mx-auto max-w-[280px] text-sm"
              style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              Select a folder, ZIP archive, or multiple
              source-code files to prepare for analysis.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge badge-neutral">
              <FileCode size={12} />
              JAVA
            </span>

            <span className="badge badge-neutral">
              <FileCode size={12} />
              PYTHON
            </span>

            <span className="badge badge-neutral">
              <FileCode size={12} />
              ZIP
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card overflow-hidden"
        >

          <div className="flex flex-col gap-4 border-b border-[var(--border-default)] p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="section-label">
                Selected Submissions
              </p>

              <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                {selectedFiles.length}{' '}
                {selectedFiles.length === 1
                  ? 'file'
                  : 'files'}{' '}
                selected
              </h3>
            </div>

            <button
              type="button"
              onClick={clearFiles}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={15} />
              Clear All
            </button>

          </div>


          <div className="max-h-[22rem] overflow-y-auto p-4">

            <div className="grid gap-2 sm:grid-cols-2">

              {selectedFiles.map((file, index) => {

                const fileName =
                  file.webkitRelativePath || file.name;

                return (
                  <div
                    key={`${fileName}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2.5"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                        <FileCode size={16} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {file.name}
                        </p>

                        <p className="truncate text-xs text-[var(--text-tertiary)]">
                          {fileName !== file.name
                            ? fileName
                            : `${(
                                file.size / 1024
                              ).toFixed(1)} KB`}
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={15} />
                    </button>

                  </div>
                );
              })}

            </div>

          </div>


          <div className="flex flex-col gap-3 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 sm:flex-row sm:items-center sm:justify-between">

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-muted)] hover:text-[var(--accent)]">

              <Plus size={17} />

              Add More Files

              <input
                type="file"
                multiple
                webkitdirectory="true"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />

            </label>


            <button
              type="button"
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0}
              className="btn-primary justify-center px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {uploading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Analyze Submissions
                </>
              )}

            </button>

          </div>

        </motion.div>
      )}


      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 flex-shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

    </div>
  );
};

export default UploadZone;