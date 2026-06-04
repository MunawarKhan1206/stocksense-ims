'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function StatsCard({ title, value, icon: IconComponent, trend, isLoss, color = 'blue', prefix = '', sparklineData }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const endVal = Number(value) || 0
    if (endVal === 0) { setDisplayValue(0); return }

    let startTimestamp = null
    const duration = 1000

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const ease = progress * (2 - progress)
      setDisplayValue(Math.floor(ease * endVal))
      if (progress < 1) window.requestAnimationFrame(step)
      else setDisplayValue(endVal)
    }
    window.requestAnimationFrame(step)
  }, [value])

  const colorMap = {
    coral: { icon: 'bg-blue-50 text-brandPrimary border-blue-100',         sparkline: '#2563EB' },
    blue:  { icon: 'bg-blue-50 text-brandSecondary border-blue-100',     sparkline: '#3B82F6' },
    mint:  { icon: 'bg-emerald-50 text-brandSuccess border-emerald-100', sparkline: '#10B981' },
    red:   { icon: 'bg-red-50 text-brandDanger border-red-100',          sparkline: '#EF4444' },
    amber: { icon: 'bg-amber-50 text-brandWarning border-amber-100',     sparkline: '#F59E0B' },
  }

  const styles = colorMap[color] || colorMap.blue

  const chartData = (sparklineData?.length > 0)
    ? sparklineData.map((val, idx) => ({ id: idx, value: val }))
    : [30, 40, 35, 50, 45, 55, value > 0 ? value : 60].map((v, i) => ({ id: i, value: v }))

  // Format large numbers compactly so all cards stay same visual size
  // e.g. 84000 → "84K", 1200000 → "1.2M"
  const formatCompact = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (num >= 1_000)     return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return num.toLocaleString()
  }

  return (
    <Card className="p-4 flex flex-col justify-between overflow-hidden w-full min-h-[160px]">

      {/* Top: Icon + Trend badge */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          {IconComponent && <IconComponent className="w-4 h-4" />}
        </div>
        {trend && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 leading-tight ${
            isLoss
              ? 'bg-red-50 text-brandDanger border-red-100'
              : 'bg-emerald-50 text-brandSuccess border-emerald-100'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {/* Middle: Title + Value — always same height */}
      <div className="mt-3 flex-1 flex flex-col justify-end">
        {/* Title — full text, no truncation, wraps to 2 lines max */}
        <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider leading-tight mb-2 line-clamp-2">
          {title}
        </span>

        {/* Value row — prefix + number always on same line */}
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text- sm font-bold text-textMuted flex-shrink-0 leading-none">
              {prefix}
            </span>
          )}
          <span className="text-sm md:text-2xl font-bold tracking-tight text-textPrimary tabular-nums leading-none">
            {formatCompact(displayValue)}
          </span>
          {color === 'red' && value > 0 && (
            <span className="w-2 h-2 rounded-full bg-brandDanger pulse-red-dot inline-block flex-shrink-0 mb-0.5" />
          )}
        </div>
      </div>

      {/* Bottom: label + sparkline */}
      <div className="flex items-center justify-between border-t border-borderColor pt-2.5 mt-3 gap-2">
        <span className="text-[11px] text-textMuted font-medium flex-shrink-0">
          vs last month
        </span>
        <div className="w-16 h-[20px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={styles.sparkline}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </Card>
  )
}