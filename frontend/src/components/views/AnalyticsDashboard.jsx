import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, BarChart3, Users } from 'lucide-react';

export default function AnalyticsDashboard({ results, fileStats }) {
  
  // 1. Risk Distribution Data (Donut Chart)
  const riskData = useMemo(() => {
    return [
      { name: 'Safe', value: fileStats.safe, fill: 'var(--success)' },
      { name: 'Suspicious', value: fileStats.suspicious, fill: 'var(--warning)' },
      { name: 'High Risk', value: fileStats.highRisk, fill: 'var(--danger)' },
    ].filter(item => item.value > 0);
  }, [fileStats]);

  // 2. Similarity Distribution Data (Histogram)
  const similarityData = useMemo(() => {
    if (!results || !results.matrix || !results.students) return [];
    
    const buckets = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '21-40%', min: 21, max: 40, count: 0 },
      { range: '41-60%', min: 41, max: 60, count: 0 },
      { range: '61-80%', min: 61, max: 80, count: 0 },
      { range: '81-100%', min: 81, max: 100, count: 0 },
    ];

    const len = results.students.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const score = results.matrix[i][j];
        if (score >= 0 && score <= 100) {
          const bucket = buckets.find(b => score >= b.min && score <= b.max) || buckets[0];
          bucket.count++;
        }
      }
    }
    return buckets;
  }, [results]);

  // 3. Cluster Size Distribution
  const clusterData = useMemo(() => {
    if (!results || !results.rings || results.rings.length === 0) return [];
    return results.rings.map((ring, idx) => ({
      name: `Cluster ${idx + 1}`,
      size: ring.members ? ring.members.length : (ring.length || (ring.size !== undefined ? ring.size : Array.from(ring).length) || 0)
    })).sort((a, b) => b.size - a.size);
  }, [results]);

  // Custom Tooltip for Histogram
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-3 rounded-lg shadow-lg">
          <p className="text-sm font-bold mb-1 text-[var(--text-primary)]">{label} Similarity</p>
          <p className="text-sm text-[var(--accent)]">{payload[0].value} Pairs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
      
      {/* Risk Distribution - Donut Chart */}
      <div className="card p-6 flex flex-col shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider mb-6">
          <PieChartIcon size={16} className="text-[var(--accent)]" /> Risk Distribution
        </h3>
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Files']}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{fileStats.total}</span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total Files</span>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {riskData.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
              <span className="text-xs font-bold text-[var(--text-secondary)]">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Similarity Distribution - Histogram */}
      <div className="card p-6 flex flex-col shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider mb-6">
          <BarChart3 size={16} className="text-[var(--accent)]" /> Similarity Distribution
        </h3>
        <div className="h-[250px] w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={similarityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-secondary)' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {similarityData.map((entry, index) => {
                  let fill = 'var(--success)';
                  if (index === 2 || index === 3) fill = 'var(--warning)';
                  if (index === 4) fill = 'var(--danger)';
                  if (index === 0 || index === 1) fill = 'var(--success)';
                  return <Cell key={`cell-${index}`} fill={fill} opacity={0.8} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-4 font-medium">Number of file pairs per similarity range</p>
      </div>

      {/* Cluster Size Distribution */}
      {clusterData.length > 0 && (
        <div className="card p-6 flex flex-col shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider mb-6">
            <Users size={16} className="text-[var(--accent)]" /> Cluster Size Distribution
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [value, 'Files in Cluster']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  cursor={{ fill: 'var(--bg-secondary)' }}
                />
                <Bar dataKey="size" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={60} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
