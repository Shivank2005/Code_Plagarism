import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Library, CheckCircle2, AlertTriangle, FileCode, Search, ChevronRight } from 'lucide-react';

export default function AnalysesPage() {
  const { filteredHistory, exportHistoryPdf, clearHistory, fetchResults, searchTerm, setSearchTerm } = usePlagShield();
  const navigate = useNavigate();

  const handleOpenAnalysis = (batchId) => {
    fetchResults(batchId);
    navigate(`/analyses/${batchId}/results`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Library className="text-[var(--accent)]" size={24} /> 
            Analysis Library
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Review and export your saved code plagiarism investigation sessions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportHistoryPdf} className="btn-secondary text-[13px] py-2 px-3">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={clearHistory} className="btn-secondary text-[13px] py-2 px-3 hover:!border-[var(--danger)]/50 hover:!text-[var(--danger)] hover:!bg-[var(--danger)]/5">
            <Trash2 size={16} /> Clear History
          </button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-2 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
          <input
            type="text"
            placeholder="Search by ID, Status, or Date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:ring-0 placeholder:text-[var(--text-tertiary)] outline-none"
          />
        </div>
      </div>

      {/* Grid of Analyses */}
      {filteredHistory.length === 0 ? (
        <div className="card-flat border-dashed py-24 flex flex-col items-center justify-center text-center">
          <Library size={48} className="text-[var(--text-tertiary)] mb-4 opacity-50" />
          <p className="text-xl font-bold text-[var(--text-primary)]">No analyses found</p>
          <p className="mt-2 text-[var(--text-secondary)] max-w-md">
            Your investigation library is empty. Try running a new analysis batch or modifying your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHistory.map((batch) => (
            <div 
              key={batch.id} 
              className="card-flat flex flex-col hover:border-[var(--accent)] hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleOpenAnalysis(batch.id)}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    batch.status === 'COMPLETED' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                    batch.status === 'FAILED' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' :
                    'bg-[var(--accent)]/10 text-[var(--accent)]'
                  }`}>
                    {batch.status === 'COMPLETED' ? <CheckCircle2 size={24} /> :
                     batch.status === 'FAILED' ? <AlertTriangle size={24} /> :
                     <FileCode size={24} />}
                  </div>
                  <span className={`badge ${
                    batch.status === 'COMPLETED' ? 'badge-success' :
                    batch.status === 'FAILED' ? 'badge-danger' :
                    'badge-neutral'
                  }`}>
                    {batch.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-mono mb-1">
                  Batch {batch.id.substring(0, 8)}...
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                  {new Date(batch.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              
              <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 group-hover:bg-[var(--accent)]/5 transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                  Open Investigation
                </span>
                <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
