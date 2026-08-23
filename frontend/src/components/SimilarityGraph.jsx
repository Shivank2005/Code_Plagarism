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
      <div className="glass-card flex min-h-[600px] flex-col items-center justify-center rounded-[2rem] border border-[#30363d] p-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22]">
          <Network className="text-[#8b949e]" size={28} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-[#e6edf3]">No Embedding Graph Yet</h3>
        <p className="max-w-sm text-sm leading-6 text-[#8b949e]">Run an analysis to generate semantic embeddings and graph links.</p>
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
    <div className={`glass-card rounded-[2rem] border border-[#30363d] p-6 shadow-[0_16px_40px_rgba(1,4,9,0.35)] sm:p-8 lg:p-10 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[99999] overflow-y-auto bg-[#0d1117] shadow-2xl' : 'relative h-full w-full'}`}>
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="fixed top-8 right-8 z-[100000] rounded-full bg-[#161b22] p-3 text-white border border-[#30363d] shadow-2xl hover:text-[#58a6ff] hover:border-[#58a6ff]/50 transition-colors"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {!isFullscreen && (
<div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] text-[#58a6ff]">
              <Radar size={18} />
            </span>
            <div>
              <div className="flex items-center gap-4">
              <h3 className="font-display text-2xl font-bold text-[#e6edf3] sm:text-3xl">Embedding Similarity Graph</h3>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="rounded-full bg-[#161b22] p-2 text-[#8b949e] border border-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff]/50 transition-colors"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
              <p className="text-sm text-[#8b949e]">Node size indicates peak similarity. Hover to isolate a node's semantic network.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-semibold text-[#c9d1d9]">
            <Link2 size={14} className="text-[#58a6ff]" /> {filteredLinks.length} connections
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-semibold text-[#c9d1d9]">
            <Network size={14} className="text-[#58a6ff]" /> {graph.nodes.length} submissions
          </div>
        </div>
      </div>

      )}
      <div className={`flex flex-col gap-6 ${isFullscreen ? "h-full" : "lg:flex-row"}`}>
        {/* Main Graph Area */}
        <div className="flex-1 overflow-x-auto rounded-2xl border border-[#30363d] bg-gradient-to-b from-[#0d1117] to-[#161b22] shadow-inner relative">
          
          {/* Threshold Filter Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-[#30363d] bg-[#0d1117]/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-2">
                <SlidersHorizontal size={14}/> Noise Filter
              </label>
              <span className="text-xs font-semibold text-[#58a6ff]">&gt; {minThreshold}% Match</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              step="5"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-48 accent-[#58a6ff] cursor-pointer"
            />
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[600px] w-full min-w-[800px]">
            <defs>
              <radialGradient id="glowGrad">
                <stop offset="0%" stopColor="rgba(88, 166, 255, 0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Background Glow */}
            <circle cx={cx} cy={cy} r={radius + 40} fill="url(#glowGrad)" />

            {/* Render edges */}
            {filteredLinks.map((edge, idx) => {
              const source = nodeById.get(edge.source);
              const target = nodeById.get(edge.target);
              if (!source || !target) return null;
              
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
                  stroke={isHigh ? '#f85149' : isSuspicious ? '#d29922' : '#58a6ff'}
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
              const fillColor = maxSim > 75 ? '#f85149' : maxSim >= 40 ? '#d29922' : '#58a6ff';
              
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
                    stroke="#0d1117"
                    strokeWidth="3"
                    className="transition-all duration-300 drop-shadow-md"
                  />
                  
                  <text
                    x={labelX}
                    y={labelY}
                    dy=".3em"
                    textAnchor={isRightSide ? 'start' : 'end'}
                    fill={isHovered || isSelected ? '#ffffff' : '#c9d1d9'}
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
          <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-5 shadow-lg">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#8b949e]">Peak Match Strength</h4>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-[#58a6ff]"></div>
                </div>
                <span className="text-sm font-medium text-[#c9d1d9]">Low ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-[#d29922]"></div>
                </div>
                <span className="text-sm font-medium text-[#c9d1d9]">Suspicious (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-[#f85149]"></div>
                </div>
                <span className="text-sm font-medium text-[#c9d1d9]">High Risk ({'>'}75%)</span>
              </div>
            </div>

            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#8b949e]">Link Strength</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-6 rounded-full bg-[#58a6ff]/60"></div>
                <span className="text-sm font-medium text-[#c9d1d9]">Weak Link ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 rounded-full bg-[#d29922]/80"></div>
                <span className="text-sm font-medium text-[#c9d1d9]">Suspicious Link (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-6 rounded-full bg-[#f85149]"></div>
                <span className="text-sm font-medium text-[#c9d1d9]">Strong Link ({'>'}75%)</span>
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
        const riskColor = maxMatch > 75 ? 'text-[#f85149]' : maxMatch >= 40 ? 'text-[#d29922]' : 'text-[#58a6ff]';
        const riskBg = maxMatch > 75 ? 'bg-[#f85149]/10 border-[#f85149]/20 shadow-[inset_0_0_20px_rgba(248,81,73,0.05)]' 
                     : maxMatch >= 40 ? 'bg-[#d29922]/10 border-[#d29922]/20 shadow-[inset_0_0_20px_rgba(210,153,34,0.05)]' 
                     : 'bg-[#58a6ff]/10 border-[#58a6ff]/20 shadow-[inset_0_0_20px_rgba(88,166,255,0.05)]';
        const topBorder = maxMatch > 75 ? 'border-t-[#f85149]' : maxMatch >= 40 ? 'border-t-[#d29922]' : 'border-t-[#58a6ff]';

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 overflow-hidden rounded-2xl border border-[#30363d] border-t-4 ${topBorder} bg-[#0d1117]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
          >
            <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22]/70 px-6 py-4">
              <h4 className="font-display flex items-center gap-3 text-lg font-bold text-[#e6edf3]">
                <Radar className="text-[#58a6ff]" size={20} />
                Node Intelligence: <span className="text-[#58a6ff]">{selectedNode.split('/').pop()}</span>
              </h4>
              <button 
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1.5 text-[#8b949e] transition-colors hover:bg-[#30363d] hover:text-white"
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
                
                <div className="flex flex-col justify-center rounded-xl border border-[#30363d] bg-[#161b22]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#f85149]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Peak Match Strength</p>
                  </div>
                  <p className="text-2xl font-bold text-[#e6edf3]">{maxMatch}%</p>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-[#30363d] bg-[#161b22]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <Network size={14} className="text-[#8b949e]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Total Connected Files</p>
                  </div>
                  <p className="text-2xl font-bold text-[#e6edf3]">{totalConnections}</p>
                </div>
              </div>

              {/* Full Width Table */}
              <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-lg">
                <div className="border-b border-[#30363d] bg-[#161b22] px-5 py-3">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e6edf3]">
                    <TrendingUp size={14} className="text-[#d29922]" /> Highest Risk Pairings
                  </h5>
                </div>
                
                <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-track-[#0d1117] scrollbar-thumb-[#30363d] hover:scrollbar-thumb-[#484f58]">
                  {nodeEdges.length === 0 && (
                    <div className="p-8 text-center text-sm text-[#8b949e]">No connections match the current noise threshold.</div>
                  )}
                  {nodeEdges
                    .sort((a, b) => b.weight - a.weight)
                    .map((edge, idx) => {
                      const targetNode = edge.source === selectedNode ? edge.target : edge.source;
                      const isHigh = edge.weight > 75;
                      const isSuspicious = edge.weight >= 40 && edge.weight <= 75;
                      
                      // Zebra striping
                      const rowBg = idx % 2 === 0 ? 'bg-transparent' : 'bg-[#161b22]/40';

                      return (
                        <div key={idx} className={`group flex items-center justify-between border-b border-[#30363d]/30 ${rowBg} px-5 py-3 transition-colors hover:bg-[#1f2937]/60 cursor-pointer`}>
                          <div className="flex items-center gap-4 truncate">
                            <span className="text-sm font-semibold text-[#c9d1d9] transition-colors group-hover:text-white truncate">
                              {targetNode.split('/').pop()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#58a6ff] opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                              Inspect →
                            </span>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                              isHigh ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30 shadow-[0_0_10px_rgba(248,81,73,0.1)]' 
                              : isSuspicious ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30'
                              : 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30'
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
