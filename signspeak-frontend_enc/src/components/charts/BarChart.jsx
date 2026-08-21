import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BarChart({
  data,
  dataKey = 'value',
  xKey = 'name',
  color = '#20d8d3',
  height = 280,
  unit = '',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-slate-500 text-xs">
        No activity recorded for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          contentStyle={{
            backgroundColor: '#090d15',
            borderColor: '#1e293b',
            borderRadius: '12px',
            color: '#f8fafc',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '12px',
          }}
          itemStyle={{ color: color, fontWeight: 'bold' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
