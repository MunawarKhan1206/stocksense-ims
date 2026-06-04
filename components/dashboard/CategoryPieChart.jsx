'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/card'

const COLORS = {
  'Electronics':     '#4DA3FF',
  'Clothing':        '#FF4D6D',
  'Food & Beverages':'#10B981',
  'Stationery':      '#F59E0B',
  'Hardware':        '#A78BFA',
  'Other':           '#94A3B8',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-borderColor p-3 rounded-xl shadow-card-hover">
        <p className="text-xs font-bold text-textPrimary mb-1">{data.name}</p>
        <p className="text-xs font-semibold text-brandSecondary">
          Stock: <span className="font-mono text-textPrimary">{data.value} units</span>
        </p>
      </div>
    )
  }
  return null
}

export default function CategoryPieChart({ data }) {
  const chartData = (data && data.length > 0) ? data : [
    { name: 'Electronics',     value: 168 },
    { name: 'Clothing',        value: 257 },
    { name: 'Food & Beverages',value: 149 },
    { name: 'Stationery',      value: 268 },
    { name: 'Hardware',        value: 59  },
  ]

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-base font-bold text-textPrimary tracking-tight">Stock by Category</h3>
        <p className="text-xs text-textSecondary mt-0.5">Category-wise breakdown of current inventory</p>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%" cy="45%"
              innerRadius={55} outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name] || COLORS['Other']}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  fillOpacity={0.9}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#64748B', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
