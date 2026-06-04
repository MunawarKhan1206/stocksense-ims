'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/card'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-borderColor p-3 rounded-xl shadow-card-hover">
        <p className="text-xs font-bold text-textPrimary mb-2">{data.name}</p>
        <div className="space-y-1">
          <p className="text-xs text-brandSecondary flex justify-between gap-4 font-semibold">
            <span>Units Sold:</span>
            <span className="font-mono">{data.quantity} qty</span>
          </p>
          <p className="text-xs text-brandSuccess flex justify-between gap-4 font-semibold">
            <span>Revenue:</span>
            <span className="font-mono">Rs. {data.revenue?.toLocaleString()}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

const COLORS = ['#FF4D6D', '#4DA3FF', '#10B981', '#F59E0B', '#A78BFA']

export default function TopProductsChart({ data }) {
  const chartData = (data && data.length > 0) ? data : [
    { name: '12W LED Bulb',       quantity: 45, revenue: 15750 },
    { name: 'Cotton Polo T-Shirt',quantity: 38, revenue: 57000 },
    { name: 'Basmati Rice 5kg',   quantity: 30, revenue: 55500 },
    { name: 'Spiral Notebook A4', quantity: 28, revenue: 7000  },
    { name: 'Extension Lead 5m',  quantity: 22, revenue: 20900 },
  ]

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-base font-bold text-textPrimary tracking-tight">Best Selling Products</h3>
        <p className="text-xs text-textSecondary mt-0.5">Top 5 items ranked by units sold</p>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false}
              tickFormatter={(v) => v.length > 12 ? `${v.substring(0, 12)}...` : v}
            />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
