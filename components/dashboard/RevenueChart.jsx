'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload[0]?.value || 0
    const profit  = payload[1]?.value || 0
    const margin  = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0

    return (
      <div className="bg-white border border-borderColor rounded-xl shadow-lg p-4 min-w-[180px]">
        <p className="text-[11px] font-bold text-textMuted uppercase tracking-wider mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brandPrimary flex-shrink-0" />
              <span className="text-xs text-textSecondary">Revenue</span>
            </div>
            <span className="text-xs font-bold text-textPrimary font-mono">
              Rs. {revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brandSuccess flex-shrink-0" />
              <span className="text-xs text-textSecondary">Profit</span>
            </div>
            <span className="text-xs font-bold text-brandSuccess font-mono">
              Rs. {profit.toLocaleString()}
            </span>
          </div>
          <div className="pt-2 mt-1 border-t border-borderColor flex items-center justify-between">
            <span className="text-[11px] text-textMuted">Margin</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              margin >= 20
                ? 'bg-emerald-50 text-brandSuccess'
                : margin >= 10
                ? 'bg-amber-50 text-brandWarning'
                : 'bg-red-50 text-brandDanger'
            }`}>
              {margin}%
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data }) {
  const chartData = (data && data.length > 0) ? data : [
    { month: 'Jan', revenue: 25000, profit: 8000 },
    { month: 'Feb', revenue: 45000, profit: 12000 },
    { month: 'Mar', revenue: 35000, profit: 10000 },
    { month: 'Apr', revenue: 50000, profit: 15000 },
    { month: 'May', revenue: 65000, profit: 22000 },
    { month: 'Jun', revenue: 58000, profit: 18000 },
  ]

  // Calculate summary stats from data
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)
  const totalProfit  = chartData.reduce((sum, d) => sum + d.profit, 0)
  const avgMargin    = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0

  // Month-over-month trend (last vs second-to-last)
  const lastMonth = chartData[chartData.length - 1]
  const prevMonth = chartData[chartData.length - 2]
  const revGrowth = prevMonth?.revenue > 0
    ? (((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1)
    : null
  const isPositive = revGrowth >= 0

  return (
    <Card className="p-5 sm:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-textPrimary tracking-tight">
            Sales &amp; Profit Overview
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Monthly revenue and net earnings trend
          </p>
        </div>

        {/* Summary stat pills */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          {/* Revenue pill */}
          <div className="flex flex-col items-end bg-red-50 border border-red-100 rounded-xl px-3 py-2 min-w-[90px]">
            <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Revenue</span>
            <span className="text-sm font-extrabold text-brandPrimary tabular-nums">
              Rs. {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(0)}K` : totalRevenue.toLocaleString()}
            </span>
          </div>
          {/* Profit pill */}
          <div className="flex flex-col items-end bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 min-w-[90px]">
            <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Profit</span>
            <span className="text-sm font-extrabold text-brandSuccess tabular-nums">
              Rs. {totalProfit >= 1000 ? `${(totalProfit / 1000).toFixed(0)}K` : totalProfit.toLocaleString()}
            </span>
          </div>
          {/* Margin pill */}
          <div className="flex flex-col items-end bg-slate-50 border border-borderColor rounded-xl px-3 py-2 min-w-[70px]">
            <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Margin</span>
            <span className="text-sm font-extrabold text-textPrimary tabular-nums">{avgMargin}%</span>
          </div>
        </div>
      </div>

      {/* ── Legend row ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full bg-brandPrimary inline-block" />
            <span className="text-[11px] text-textMuted font-medium">Total Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full bg-brandSuccess inline-block" />
            <span className="text-[11px] text-textMuted font-medium">Net Profit</span>
          </div>
        </div>
        {/* MoM growth badge */}
        {revGrowth !== null && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isPositive
              ? 'bg-emerald-50 text-brandSuccess border-emerald-100'
              : 'bg-red-50 text-brandDanger border-red-100'
          }`}>
            {isPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            <span>{isPositive ? '+' : ''}{revGrowth}% MoM</span>
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="w-full h-[240px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#FF4D6D" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#FF4D6D" stopOpacity={0.0}  />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10B981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.0}  />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1.5 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF4D6D"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              dot={false}
              activeDot={{ r: 5, fill: '#FF4D6D', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProfit)"
              dot={false}
              activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </Card>
  )
}