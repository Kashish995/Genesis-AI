import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm border"
      style={{ background: '#09111F', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
      {label && <p className="text-white/50 text-xs mb-1">{label}</p>}
      <p className="font-semibold text-white">{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

export default function DynamicChart({ config, data = [] }) {
  const chartData = useMemo(() => {
    if (!config?.groupBy || !data.length) return [];
    const groups = {};
    data.forEach(item => {
      const key = item[config.groupBy] || 'Unknown';
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [data, config?.groupBy]);

  const chartType = config?.chartType || 'bar';
  const noData = chartData.length === 0;

  const renderChart = () => {
    if (noData) {
      return (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-sm text-white/20">No data to display</p>
        </div>
      );
    }

    const axis = { tick: { fill: 'rgba(255,255,255,0.25)', fontSize: 11 }, axisLine: { stroke: 'rgba(255,255,255,0.06)' }, tickLine: false };

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4, fill: COLORS[0] }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <p className="text-sm font-semibold text-white/70 mb-4">{config?.title || 'Chart'}</p>
      {renderChart()}
    </div>
  );
}