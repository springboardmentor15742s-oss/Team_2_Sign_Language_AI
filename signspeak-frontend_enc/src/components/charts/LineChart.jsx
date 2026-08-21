import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LineChart({
  data,
  dataKey = 'value',
  xKey = 'name',
  color = '#20d8d3',
  unit = '',
  yDomain = [0, 100],
  height = 280,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-slate-500 text-xs">
        No trend data recorded for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={yDomain}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#090d15',
            borderColor: '#1e293b',
            borderRadius: '12px',
            color: '#f8fafc',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '12px',
          }}
          itemStyle={{ color: color, fontWeight: 'bold' }}
          formatter={(val) => [`${val}${unit}`, 'Accuracy']}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 4, fill: '#090d15', strokeWidth: 2, stroke: color }}
          activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
