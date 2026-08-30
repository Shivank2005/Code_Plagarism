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
      <div className="glass-card flex min-h-[600px] flex-col items-center justify-center rounded-[2rem] border border-[#E2E8F0] p-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <Network className="text-[#64748B]" size={28} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-[#0F172A]">No Embedding Graph Yet</h3>
        <p className="max-w-sm text-sm leading-6 text-[#64748B]">Run an analysis to generate semantic embeddings and graph links.</p>
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
    <div className={`glass-card rounded-[2rem] border border-[#E2E8F0] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[99999] overflow-y-auto bg-[#FFFFFF] shadow-2xl' : 'relative h-full w-full'}`}>
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="fixed top-8 right-8 z-[100000] rounded-full bg-[#F8FAFC] p-3 text-white border border-[#E2E8F0] shadow-2xl hover:text-[#2563EB] hover:border-[#2563EB]/50 transition-colors"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {!isFullscreen && (
<div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#2563EB]">
              <Radar size={18} />
            </span>
            <div>
              <div className="flex items-center gap-4">
              <h3 className="font-display text-2xl font-bold text-[#0F172A] sm:text-3xl">Embedding Similarity Graph</h3>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="rounded-full bg-[#F8FAFC] p-2 text-[#64748B] border border-[#E2E8F0] hover:text-[#2563EB] hover:border-[#2563EB]/50 transition-colors"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
              <p className="text-sm text-[#64748B]">Node size indicates peak similarity. Hover to isolate a node's semantic network.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#334155]">
            <Link2 size={14} className="text-[#2563EB]" /> {filteredLinks.length} connections
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#334155]">
            <Network size={14} className="text-[#2563EB]" /> {graph.nodes.length} submissions
          </div>
        </div>
      </div>

      )}
      <div className={`flex flex-col gap-6 ${isFullscreen ? "h-full" : "lg:flex-row"}`}>
        {/* Main Graph Area */}
        <div className="flex-1 overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] shadow-inner relative">
          
          {/* Threshold Filter Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                <SlidersHorizontal size={14}/> Noise Filter
              </label>
              <span className="text-xs font-semibold text-[#2563EB]">&gt; {minThreshold}% Match</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              step="5"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-48 accent-[#2563EB] cursor-pointer"
            />
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[600px] w-full min-w-[800px]">
            <defs>
              <radialGradient id="glowGrad">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
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
                  stroke={isHigh ? '#DC2626' : isSuspicious ? '#F59E0B' : '#2563EB'}
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
              const fillColor = maxSim > 75 ? '#DC2626' : maxSim >= 40 ? '#F59E0B' : '#2563EB';
              
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
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className="transition-all duration-300 drop-shadow-md"
                  />
                  
                  <text
                    x={labelX}
                    y={labelY}
                    dy=".3em"
                    textAnchor={isRightSide ? 'start' : 'end'}
                    fill={isHovered || isSelected ? '#ffffff' : '#334155'}
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
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-lg">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">Peak Match Strength</h4>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-[#2563EB]"></div>
                </div>
                <span className="text-sm font-medium text-[#334155]">Low ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-[#F59E0B]"></div>
                </div>
                <span className="text-sm font-medium text-[#334155]">Suspicious (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-[#DC2626]"></div>
                </div>
                <span className="text-sm font-medium text-[#334155]">High Risk ({'>'}75%)</span>
              </div>
            </div>

            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">Link Strength</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-6 rounded-full bg-[#2563EB]/60"></div>
                <span className="text-sm font-medium text-[#334155]">Weak Link ({'<'}40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 rounded-full bg-[#F59E0B]/80"></div>
                <span className="text-sm font-medium text-[#334155]">Suspicious Link (40-75%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-6 rounded-full bg-[#DC2626]"></div>
                <span className="text-sm font-medium text-[#334155]">Strong Link ({'>'}75%)</span>
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
        const riskColor = maxMatch > 75 ? 'text-[#DC2626]' : maxMatch >= 40 ? 'text-[#F59E0B]' : 'text-[#2563EB]';
        const riskBg = maxMatch > 75 ? 'bg-[#DC2626]/10 border-[#DC2626]/20 shadow-[inset_0_0_20px_rgba(248,81,73,0.05)]' 
                     : maxMatch >= 40 ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 shadow-[inset_0_0_20px_rgba(210,153,34,0.05)]' 
                     : 'bg-[#2563EB]/10 border-[#2563EB]/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]';
        const topBorder = maxMatch > 75 ? 'border-t-[#DC2626]' : maxMatch >= 40 ? 'border-t-[#F59E0B]' : 'border-t-[#2563EB]';

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 overflow-hidden rounded-2xl border border-[#E2E8F0] border-t-4 ${topBorder} bg-[#FFFFFF]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.08)]`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC]/70 px-6 py-4">
              <h4 className="font-display flex items-center gap-3 text-lg font-bold text-[#0F172A]">
                <Radar className="text-[#2563EB]" size={20} />
                Node Intelligence: <span className="text-[#2563EB]">{selectedNode.split('/').pop()}</span>
              </h4>
              <button 
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-[#E2E8F0] hover:text-white"
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
                
                <div className="flex flex-col justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#DC2626]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Peak Match Strength</p>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A]">{maxMatch}%</p>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-5 shadow-inner">
                  <div className="mb-1 flex items-center gap-2">
                    <Network size={14} className="text-[#64748B]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Total Connected Files</p>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A]">{totalConnections}</p>
                </div>
              </div>

              {/* Full Width Table */}
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-lg">
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0F172A]">
                    <TrendingUp size={14} className="text-[#F59E0B]" /> Highest Risk Pairings
                  </h5>
                </div>
                
                <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-track-[#FFFFFF] scrollbar-thumb-[#E2E8F0] hover:scrollbar-thumb-[#94A3B8]">
                  {nodeEdges.length === 0 && (
                    <div className="p-8 text-center text-sm text-[#64748B]">No connections match the current noise threshold.</div>
                  )}
                  {nodeEdges
                    .sort((a, b) => b.weight - a.weight)
                    .map((edge, idx) => {
                      const targetNode = edge.source === selectedNode ? edge.target : edge.source;
                      const isHigh = edge.weight > 75;
                      const isSuspicious = edge.weight >= 40 && edge.weight <= 75;
                      
                      // Zebra striping
                      const rowBg = idx % 2 === 0 ? 'bg-transparent' : 'bg-[#F8FAFC]/40';

                      return (
                        <div key={idx} className={`group flex items-center justify-between border-b border-[#E2E8F0]/30 ${rowBg} px-5 py-3 transition-colors hover:bg-[#F1F5F9]/60 cursor-pointer`}>
                          <div className="flex items-center gap-4 truncate">
                            <span className="text-sm font-semibold text-[#334155] transition-colors group-hover:text-white truncate">
                              {targetNode.split('/').pop()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                              Inspect →
                            </span>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                              isHigh ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 shadow-[0_0_10px_rgba(248,81,73,0.1)]' 
                              : isSuspicious ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                              : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30'
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
