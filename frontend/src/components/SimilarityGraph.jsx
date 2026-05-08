import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Link2, Radar, X } from 'lucide-react';

const chartWidth = 1000;
const chartHeight = 650;
const cx = chartWidth / 2;
const cy = chartHeight / 2;
const radius = 240;

const SimilarityGraph = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const graph = useMemo(() => {
    if (!data || !Array.isArray(data.nodes) || data.nodes.length === 0) {
      return { nodes: [], links: [] };
    }

    const total = data.nodes.length;
    const nodes = data.nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / total;
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });

    return {
      nodes,
      links: data.links || [],
    };
  }, [data]);

  if (!data || graph.nodes.length === 0) {
    return (
      <div className="glass-card rounded-[2rem] border border-dashed border-cyan-100/30 p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-100/25 bg-cyan-900/40">
          <Network className="text-cyan-100/55" size={30} />
        </div>
        <h3 className="font-display text-2xl font-bold text-white">No Embedding Graph Yet</h3>
        <p className="mt-2 text-cyan-100/65">Run an analysis to generate semantic embeddings and graph links.</p>
      </div>
    );
  }

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const highSimilarityThreshold = 75;
  
  const edgesByNode = new Map();
  graph.links.forEach((link) => {
    if (!edgesByNode.has(link.source)) edgesByNode.set(link.source, []);
    if (!edgesByNode.has(link.target)) edgesByNode.set(link.target, []);
    edgesByNode.get(link.source).push(link);
    edgesByNode.get(link.target).push(link);
  });

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display flex items-center gap-3 text-2xl font-bold text-white">
            <Radar className="text-cyan-300" /> Embedding Similarity Graph
          </h3>
          <p className="mt-1 text-sm text-cyan-100/70">Node size indicates overall similarity. Edge weight shows pair-wise match strength.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/70 px-3 py-2 text-xs text-cyan-100/80">
            <Link2 size={14} /> {graph.links.length} connections
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/70 px-3 py-2 text-xs text-cyan-100/80">
            <Network size={14} /> {graph.nodes.length} submissions
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[600px] w-full min-w-[800px] rounded-2xl border border-cyan-100/12 bg-[#031520]/80">
            <defs>
              <linearGradient id="edgeGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.7)" />
                <stop offset="100%" stopColor="rgba(14, 116, 144, 0.45)" />
              </linearGradient>
              <filter id="shadowFilter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {/* Render edges */}
            {graph.links.map((edge, idx) => {
              const source = nodeById.get(edge.source);
              const target = nodeById.get(edge.target);
              if (!source || !target) {
                return null;
              }
              const isHighSimilarity = edge.weight > highSimilarityThreshold;
              return (
                <line
                  key={`${edge.source}-${edge.target}-${idx}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighSimilarity ? 'rgba(244, 63, 94, 0.6)' : 'url(#edgeGrad)'}
                  strokeWidth={Math.max(1, (edge.weight - 50) / 15)}
                  opacity={Math.min(0.9, edge.weight / 100)}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Render nodes */}
            {graph.nodes.map((node) => {
              const intensity = Math.min(1, (node.avgSimilarity || 0) / 100);
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              const size = isSelected ? 24 : isHovered ? 22 : 16 + intensity * 11;
              
              return (
                <g 
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isHovered || isSelected ? (
                    <>
                      <circle
                        r={size + 8}
                        fill="rgba(34, 211, 238, 0.2)"
                        opacity="0.5"
                      />
                      <circle
                        r={size + 4}
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.5)"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                    </>
                  ) : null}
                  
                  <circle
                    r={size}
                    fill={`rgba(${Math.round(40 + intensity * 200)}, ${Math.round(130 + intensity * 90)}, 220, 0.9)`}
                    stroke={isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.55)'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />
                  <text
                    x="0"
                    y="-36"
                    textAnchor="middle"
                    className="fill-cyan-100 text-[11px] font-bold"
                    pointerEvents="none"
                  >
                    {node.id.split('/').pop()?.split('.').shift()?.substring(0, 12) || node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <div className="rounded-2xl border border-cyan-100/15 bg-cyan-500/5 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-100/70">Legend</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full border border-cyan-100/40" style={{ backgroundColor: 'rgba(100, 150, 220, 0.9)' }} />
                <span className="text-xs text-cyan-100/80">Small: Low avg similarity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border border-cyan-100/40" style={{ backgroundColor: 'rgba(200, 180, 255, 0.9)' }} />
                <span className="text-xs text-cyan-100/80">Large: High avg similarity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: 'rgba(34, 211, 238, 0.7)' }} />
                <span className="text-xs text-cyan-100/80">Thin: Weak link (&lt;70%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: 'rgba(244, 63, 94, 0.6)' }} />
                <span className="text-xs text-cyan-100/80">Thick: Strong link (&gt;75%)</span>
              </div>
            </div>
          </div>

          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan-100/20 bg-[#062333]/80 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-100/60">Selected Node</p>
                  <p className="font-semibold text-cyan-50">{selectedNode}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-cyan-100/60 hover:text-cyan-100"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="bg-cyan-950/60 rounded-lg p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100/65 mb-1">Connected Files</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(edgesByNode.get(selectedNode) || []).slice(0, 8).map((edge, idx) => (
                    <div key={idx} className="text-xs text-cyan-100/70 flex justify-between">
                      <span>{edge.source === selectedNode ? edge.target : edge.source}</span>
                      <span className="font-mono">{edge.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarityGraph;
