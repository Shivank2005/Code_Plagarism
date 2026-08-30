import React, { useMemo, useState } from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, FileSearch, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PairsPage() {
  const { results, riskThreshold, suspiciousThreshold, handlePairSelection } = usePlagShield();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const matchRows = useMemo(() => {
    if (!results || !Array.isArray(results.students) || !Array.isArray(results.matrix)) return [];
    
    const detailedMap = {};
    if (results.detailedResults) {
      results.detailedResults.forEach(r => {
         detailedMap[`${r.submissionA}-${r.submissionB}`] = r;
         detailedMap[`${r.submissionB}-${r.submissionA}`] = r;
      });
    }

    const rows = [];
    for (let i = 0; i < results.students.length; i += 1) {
      for (let j = i + 1; j < results.students.length; j += 1) {
        const score = results.matrix[i][j] ?? 0;
        if (score <= 0) continue;
        
        const detail = detailedMap[`${results.students[i]}-${results.students[j]}`] || {};
        const riskLevel = score > riskThreshold ? 'High Risk' : score >= suspiciousThreshold ? 'Suspicious' : 'Safe';
        rows.push({
          fileA: results.students[i],
          fileB: results.students[j],
          score,
          riskLevel,
          isAnomaly: detail.anomaly || detail.isAnomaly || false,
          key: `${results.students[i]}-${results.students[j]}`,
        });
      }
    }
    return rows.sort((a, b) => b.score - a.score);
  }, [results, riskThreshold, suspiciousThreshold]);

  const filteredRows = useMemo(() => {
    return matchRows.filter((row) => {
      const matchesSearch = !searchTerm.trim() || row.fileA.toLowerCase().includes(searchTerm.toLowerCase()) || row.fileB.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'ALL' || row.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [matchRows, searchTerm, filterRisk]);

  const onReview = (pair) => {
    handlePairSelection(pair);
    navigate(`/analyses/latest/compare`); // Actually we should pass activeBatch, but context preserves selectedSuspiciousPair
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileSearch className="text-[var(--accent)]" size={24} /> Pair Explorer
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Investigate file combinations with flagged similarities.</p>
        </div>
      </div>

      <div className="card p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 relative min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filenames..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-tertiary)]" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="High Risk">High Risk</option>
              <option value="Suspicious">Suspicious</option>
              <option value="Safe">Safe</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Submission A</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Submission B</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Match %</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Assessment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-primary)]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    No matching pairs found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                    <td className="px-6 py-4 text-[var(--text-primary)] font-mono text-xs max-w-[200px] truncate">
                      {row.fileA}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)] font-mono text-xs max-w-[200px] truncate">
                      {row.fileB}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                      {row.score.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${row.riskLevel === 'High Risk' ? 'badge-danger' : row.riskLevel === 'Suspicious' ? 'badge-warning' : 'badge-success'}`}>
                        {row.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onReview({ student1: row.fileA, student2: row.fileB })}
                        className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-light)] font-medium text-xs transition-colors"
                      >
                        Inspect Code <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
