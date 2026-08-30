import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Network, Link2, Radar, SlidersHorizontal, X, Activity, TrendingUp, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';

const chartWidth = 1000;
const chartHeight = 650;
const cx = chartWidth / 2;
const cy = chartHeight / 2;
const radius = 240;

const SimilarityGraph = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [minThreshold, setMinThreshold] = useState(40);

  const graph = useMemo(() => {
    if (!data || !Array.isArray(data.nodes) || data.nodes.length === 0) {
      return { nodes: [], links: [] };
    }

    const total = data.nodes.length;
    const nodes = data.nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle: angle,
      };
    });

    return {
      nodes,
      links: data.links || [],
    };
  }, [data]);

  if (!data || graph.nodes.length === 0) {
    return (
      <div className="glass-card flex min-h-[600px] flex-col items-center justify-center rounded-[2rem] border border-[var(--border-default)] p-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <Network className="text-[var(--text-tertiary)]" size={28} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-[var(--text-primary)]">No Embedding Graph Yet</h3>
        <p className="max-w-sm text-sm leading-6 text-[var(--text-tertiary)]">Run an analysis to generate semantic embeddings and graph links.</p>
      </div>
    );
  }

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  
  // Calculate Peak Match for each node based on ALL links
  const maxSimByNode = new Map();
  graph.nodes.forEach(n => maxSimByNode.set(n.id, 0));
  graph.links.forEach(link => {
    maxSimByNode.set(link.source, Math.max(link.weight, maxSimByNode.get(link.source) || 0));
    maxSimByNode.set(link.target, Math.max(link.weight, maxSimByNode.get(link.target) || 0));
  });

  const filteredLinks = graph.links.filter(link => link.weight >= minThreshold);
  
  const edgesByNode = new Map();
  filteredLinks.forEach((link) => {
    if (!edgesByNode.has(link.source)) edgesByNode.set(link.source, []);
    if (!edgesByNode.has(link.target)) edgesByNode.set(link.target, []);
    edgesByNode.get(link.source).push(link);
    edgesByNode.get(link.target).push(link);
  });

  const activeNodeId = selectedNode || hoveredNode;
  const isNodeActive = (id) => !activeNodeId || activeNodeId === id || (edgesByNode.get(activeNodeId) || []).some(e => e.source === id || e.target === id);
  const isEdgeActive = (edge) => !activeNodeId || edge.source === activeNodeId || edge.target === activeNodeId;

  const content = (
    <div className={`card ${isFullscreen ? 'fixed inset-4 z-[99999] overflow-y-auto bg-[var(--bg-primary)]' : 'relative h-full w-full'} p-6 sm:p-8 lg:p-10 transition-all duration-300`}>
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="fixed top-8 right-8 z-[100000] rounded-full bg-[var(--bg-secondary)] p-3 text-[var(--text-primary)] border border-[var(--border-default)] hover:text-[var(--accent)] hover:border-[var(--border-default)] transition-colors"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {!isFullscreen && (
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--accent)]">
              <Radar size={18} />
            </span>
            <div>
              <div className="flex items-center gap-4">
              <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Embedding Similarity Graph</h3>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="rounded-full bg-[var(--bg-secondary)] p-2 text-[var(--text-tertiary)] border border-[var(--border-default)] hover:text-[var(--accent)] hover:border-[var(--border-default)] transition-colors"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
              <p className="text-sm text-[var(--text-tertiary)]">Node size indicates peak similarity. Hover to isolate a node's semantic network.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Link2 size={14} className="text-[var(--accent)]" /> {filteredLinks.length} connections
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Network size={14} className="text-[var(--accent)]" /> {graph.nodes.length} submissions
          </div>
        </div>
      </div>
      )}

      <div className={`flex flex-col gap-6 ${isFullscreen ? "h-full" : "lg:flex-row"}`}>
        {/* Main Graph Area */}
        <div className="flex-1 overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] relative">
          
          {/* Threshold Filter Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]/90 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-2">
                <SlidersHorizontal size={14}/> Noise Filter
              </label>
              <span className="text-xs font-semibold text-[var(--accent)]">&gt; {minThreshold}% Match</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              step="5"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-48 accent-[var(--accent)] cursor-pointer"
            />
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[600px] w-full min-w-[800px]">
            <defs>
              <radialGradient id="glowGrad">
                <stop offset="0%" stopColor="var(--accent-muted)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {/* Edges */}
            {filteredLinks.map((edge, idx) => {
              const source = graph.nodes.find((n) => n.id === edge.source);
              const target = graph.nodes.find((n) => n.id === edge.target);
              if (!source || !target) return null;

              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const cx = source.x + dx * 0.5 + dy * 0.1;
              const cy = source.y + dy * 0.5 - dx * 0.1;

              const isHigh = edge.weight > 75;
              const isSuspicious = edge.weight >= 40 && edge.weight <= 75;
              const active = isEdgeActive(edge);
              const dimmed = activeNodeId && !active;

              const d = `M ${source.x},${source.y} Q ${cx},${cy} ${target.x},${target.y}`;

              return (
                <path
                  key={`edge-${idx}`}
                  d={d}
                  fill="none"
                  stroke={isHigh ? 'var(--danger)' : isSuspicious ? 'var(--warning)' : 'var(--accent)'}
                  strokeWidth={active ? (isHigh ? 3 : 2) : 1}
                  opacity={dimmed ? 0.05 : active ? (isHigh ? 0.8 : 0.6) : (isHigh ? 0.4 : 0.2)}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render nodes */}
            {graph.nodes.map((node) => {
              const maxSim = maxSimByNode.get(node.id) || 0;
              const intensity = Math.min(1, maxSim / 100);
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              const active = isNodeActive(node.id);
              
              // Dim the node if it's not active during a hover, OR if it has NO visible links at the current filter threshold
              const hasVisibleLinks = (edgesByNode.get(node.id) || []).length > 0;
              const dimmed = (activeNodeId && !active) || (!activeNodeId && !hasVisibleLinks);
              
              const size = isSelected ? 24 : isHovered ? 22 : 14 + intensity * 10;
              const fillColor = maxSim > 75 ? 'var(--danger)' : maxSim >= 40 ? 'var(--warning)' : 'var(--accent)';
              
              const labelRadius = radius + 30;
              const labelX = cx + labelRadius * Math.cos(node.angle);
              const labelY = cy + labelRadius * Math.sin(node.angle);
              const isRightSide = Math.cos(node.angle) > 0;

              return (
                <g 
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  opacity={dimmed ? 0.15 : 1}
                >
                  {(isHovered || isSelected) && (
                    <circle cx={node.x} cy={node.y} r={size + 6} fill="none" stroke={fillColor} strokeWidth="2" opacity="0.5" className="animate-pulse"/>
                  )}
                  
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={fillColor}
                    stroke="var(--bg-primary)"
                    strokeWidth="3"
                    className="transition-all duration-300 drop-shadow-md"
                  />
                  
                  <text
                    x={labelX}
                    y={labelY}
                    dy=".3em"
                    textAnchor={isRightSide ? 'start' : 'end'}
                    fill={isHovered || isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={isHovered || isSelected ? '12px' : '10px'}
                    fontWeight={isHovered || isSelected ? 'bold' : 'normal'}
                    className="transition-all duration-300 select-none pointer-events-none drop-shadow-lg"
                  >
                    {node.id.split('/').pop()?.split('.').shift()?.substring(0, 12) || node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Sidebar */}
        {!isFullscreen && (
        <div className="w-full lg:w-72 space-y-4">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-5 shadow-lg">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Peak Match Strength</h4>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-[var(--accent)]"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">Low ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-[var(--warning)]"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">Suspicious (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-[var(--danger)]"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">High Risk ({'>'}75%)</span>
              </div>
            </div>

            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Link Strength</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-6 rounded-full bg-[var(--accent)]/60"></div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">Weak Link ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 rounded-full bg-[var(--warning)]/80"></div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">Suspicious Link (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-6 rounded-full bg-[var(--danger)]"></div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">Strong Link ({'>'}75%)</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Selected Node Details Panel */}
      {selectedNode && nodeById.has(selectedNode) && (() => {
        const nodeEdges = edgesByNode.get(selectedNode) || [];
        const maxMatch = nodeEdges.length > 0 ? Math.round(Math.max(...nodeEdges.map(e => e.weight))) : 0;
        const totalConnections = nodeEdges.length;
        
        const riskLevel = maxMatch > 75 ? 'CRITICAL RISK' : maxMatch >= 40 ? 'SUSPICIOUS' : 'LOW RISK';
        const riskColor = maxMatch > 75 ? 'text-[var(--danger)]' : maxMatch >= 40 ? 'text-[var(--warning)]' : 'text-[var(--accent)]';
        const riskBg = maxMatch > 75 ? 'bg-[var(--danger)]/10 border-[var(--danger)]/20 shadow-sm' 
                     : maxMatch >= 40 ? 'bg-[var(--warning)]/10 border-[var(--warning)]/20 shadow-sm' 
                     : 'bg-[var(--accent)]/10 border-[var(--accent)]/20 shadow-sm';
        const topBorder = maxMatch > 75 ? 'border-t-[var(--danger)]' : maxMatch >= 40 ? 'border-t-[var(--warning)]' : 'border-t-[var(--accent)]';

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 overflow-hidden rounded-2xl border border-[var(--border-default)] border-t-4 ${topBorder} bg-[var(--bg-primary)]/90 backdrop-blur-xl shadow-xl`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/70 px-6 py-4">
              <h4 className="font-display flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
                <Radar className="text-[var(--accent)]" size={20} />
                Node Intelligence: <span className="text-[var(--accent)]">{selectedNode.split('/').pop()}</span>
              </h4>
              <button 
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--border-default)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Horizontal Quick Stats */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className={`flex flex-col justify-center rounded-xl border p-5 ${riskBg}`}>
                  <div className="mb-1 flex items-center gap-2">
                    <Activity size={14} className={riskColor} />
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${riskColor}`}>Overall Verdict</p>
                  </div>
                  <p className={`text-2xl font-black tracking-tight ${riskColor}`}>{riskLevel}</p>
                </div>
                
                <div className="flex flex-col justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[var(--danger)]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Peak Match Strength</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{maxMatch}%</p>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <Network size={14} className="text-[var(--text-tertiary)]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Total Connected Files</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{totalConnections}</p>
                </div>
              </div>

              {/* Full Width Table */}
              <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm">
                <div className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-3">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    <TrendingUp size={14} className="text-[var(--warning)]" /> Highest Risk Pairings
                  </h5>
                </div>
                
                <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-track-[var(--bg-primary)] scrollbar-thumb-[var(--border-default)] hover:scrollbar-thumb-[var(--border-default)]">
                  {nodeEdges.length === 0 && (
                    <div className="p-8 text-center text-sm text-[var(--text-tertiary)]">No connections match the current noise threshold.</div>
                  )}
                  {nodeEdges
                    .sort((a, b) => b.weight - a.weight)
                    .map((edge, idx) => {
                      const targetNode = edge.source === selectedNode ? edge.target : edge.source;
                      const isHigh = edge.weight > 75;
                      const isSuspicious = edge.weight >= 40 && edge.weight <= 75;
                      
                      // Zebra striping
                      const rowBg = idx % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-secondary)]/40';

                      return (
                        <div key={idx} className={`group flex items-center justify-between border-b border-[var(--border-default)]/30 ${rowBg} px-5 py-3 transition-colors hover:bg-[var(--bg-surface)] cursor-pointer`}>
                          <div className="flex items-center gap-4 truncate">
                            <span className="text-sm font-semibold text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] truncate">
                              {targetNode.split('/').pop()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                              Inspect →
                            </span>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                              isHigh ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 shadow-sm' 
                              : isSuspicious ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30'
                              : 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                          }`}>
                            {Math.round(edge.weight)}% MATCH
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );

  return isFullscreen ? createPortal(content, document.body) : content;
};

export default SimilarityGraph;
