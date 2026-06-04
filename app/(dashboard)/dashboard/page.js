'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingUp, Sparkles, Heart, Zap, ShieldAlert, Award, History, Percent, Coins } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import InsightStrip from '@/components/dashboard/InsightStrip'
import RevenueChart from '@/components/dashboard/RevenueChart'
import TopProductsChart from '@/components/dashboard/TopProductsChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import LowStockAlert from '@/components/dashboard/LowStockAlert'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        fetch('/api/analytics/summary', { cache: 'no-store' }),
        fetch('/api/alerts/low-stock', { cache: 'no-store' })
      ])
      if (summaryRes.ok && alertsRes.ok) {
        const summaryData = await summaryRes.json()
        const alertsData = await alertsRes.json()
        setSummary(summaryData)
        setLowStockProducts(Array.isArray(alertsData) ? alertsData : [])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI skeletons — 2 col mobile, 3 col tablet, 6 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
        {/* Insights skeleton — 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-80 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[340px] w-full" />
          <Skeleton className="h-[340px] w-full" />
        </div>
        {/* Operational intelligence skeletons — 2 col tablet, 3 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[220px] w-full" />)}
        </div>
      </div>
    )
  }

  const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight">
            StockSense IMS Workspace
          </h1>
          <p className="text-sm md:text-base text-textSecondary mt-1">
            Real-time inventory, sales velocity, and margin insights.
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
          <div className="flex items-center space-x-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-brandPrimary text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>LIVE DATA</span>
          </div>
          <span className="text-[10px] text-black">Updated at {lastUpdated}</span>
        </div>
      </div>

      {/* ── KPI Cards ──
          Mobile:  1 column
          Tablet:  2-3 columns
          Desktop: 6 columns
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Stock Health %"
          value={summary?.stockHealth !== undefined ? summary.stockHealth : 100}
          icon={Heart}
          color="mint"
          trend={summary?.stockHealth >= 90 ? 'Optimal' : 'Needs Focus'}
          isLoss={summary?.stockHealth < 90}
        />
        <StatsCard
          title="Total Products"
          value={summary?.totalProducts || 0}
          icon={Package}
          color="blue"
          trend="+8%"
          isLoss={false}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount || 0}
          icon={AlertTriangle}
          color="red"
          trend={summary?.lowStockCount > 0 ? `${summary.lowStockCount} items` : '0 items'}
          isLoss={summary?.lowStockCount > 0}
        />
        <StatsCard
          title="Low Margin Alerts"
          value={summary?.lowMarginCount || 0}
          icon={Percent}
          color="amber"
          trend={summary?.lowMarginCount > 0 ? `${summary.lowMarginCount} alerts` : '0 alerts'}
          isLoss={summary?.lowMarginCount > 0}
        />
        <StatsCard
          title="Total Revenue"
          value={summary?.totalRevenue || 0}
          icon={TrendingUp}
          prefix="Rs."
          color="coral"
          trend={summary?.weeklyGrowthTrend !== undefined
            ? `${summary.weeklyGrowthTrend >= 0 ? '+' : ''}${summary.weeklyGrowthTrend}%`
            : '+24%'}
          isLoss={summary?.weeklyGrowthTrend < 0}
        />
        <StatsCard
          title="Total Profit"
          value={summary?.totalProfit || 0}
          icon={Coins}
          prefix="Rs."
          color="mint"
          trend="Net Earnings"
          isLoss={false}
        />
      </div>

      {/* ── Insights Strip ── */}
      <InsightStrip insights={summary?.insights} />

      {/* ── Revenue Chart ── */}
      <RevenueChart data={summary?.revenueByMonth} />

      {/* ── Charts Grid ──
          Mobile: 1 column stacked
          Desktop: 2 columns side by side
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProductsChart data={summary?.topProducts} />
        <CategoryPieChart data={summary?.categoryBreakdown} />
      </div>

      {/* ── Operational Intelligence ──
          Mobile:  1 column
          Tablet:  2 columns
          Large:   3 columns
          XL:      5 columns in a single row
      */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-textPrimary tracking-tight">
          Operational Intelligence &amp; Live Indicators
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">

          {/* Card 1 — Fast Moving */}
          <div className="bg-white border border-borderColor rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brandSecondary flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-textMuted bg-slate-50 px-2 py-0.5 rounded border border-borderColor">
                  &gt;20% Vol Share
                </span>
              </div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">
                Fast Moving Items
              </h3>
              <div className="space-y-2">
                {summary?.fastMovingProducts?.length > 0 ? (
                  summary.fastMovingProducts.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center justify-between py-1.5 border-b border-borderColor/40 last:border-0">
                      <span className="text-xs font-semibold text-textPrimary truncate max-w-[130px]" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-brandSecondary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                        {p.share}% vol
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted py-4 text-center">No fast-moving items yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 — Dead Stock */}
          <div className="bg-white border border-borderColor rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-brandDanger flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-textMuted bg-slate-50 px-2 py-0.5 rounded border border-borderColor">
                  30 Days Idle
                </span>
              </div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">
                Dead Stock Warning
              </h3>
              <div className="space-y-2">
                {summary?.deadStock?.length > 0 ? (
                  summary.deadStock.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center justify-between py-1.5 border-b border-borderColor/40 last:border-0">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-xs font-semibold text-textPrimary truncate" title={p.name}>{p.name}</span>
                        <span className="text-[9px] font-mono text-textMuted truncate">{p.sku}</span>
                      </div>
                      <span className="text-[10px] font-bold text-brandDanger bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex-shrink-0">
                        {p.stock} left
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted py-4 text-center">No idle items found</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3 — Low Margin */}
          <div className="bg-white border border-borderColor rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-brandWarning flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-textMuted bg-slate-50 px-2 py-0.5 rounded border border-borderColor">
                  &lt;15% Margin
                </span>
              </div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">
                Low Margin Alerts
              </h3>
              <div className="space-y-2">
                {summary?.lowMarginAlerts?.length > 0 ? (
                  summary.lowMarginAlerts.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center justify-between py-1.5 border-b border-borderColor/40 last:border-0">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-xs font-semibold text-textPrimary truncate" title={p.name}>{p.name}</span>
                        <span className="text-[9px] font-mono text-textMuted truncate">
                          Cost: Rs.{p.costPrice} • Price: Rs.{p.price}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-brandWarning bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 font-mono flex-shrink-0">
                        {p.marginPct}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted py-4 text-center">No low-margin items</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 4 — Top Suppliers */}
          <div className="bg-white border border-borderColor rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brandSuccess flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-textMuted bg-slate-50 px-2 py-0.5 rounded border border-borderColor">
                  By Value
                </span>
              </div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">
                Top Supplier Partners
              </h3>
              <div className="space-y-2">
                {summary?.topSuppliers?.length > 0 ? (
                  summary.topSuppliers.slice(0, 5).map((s) => (
                    <div key={s._id} className="flex items-center justify-between py-1.5 border-b border-borderColor/40 last:border-0">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-xs font-semibold text-textPrimary truncate" title={s.name}>{s.name}</span>
                        <span className="text-[9px] text-textMuted truncate">{s.company}</span>
                      </div>
                      <span className="text-[10px] font-bold text-brandSuccess bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                        Rs.{s.totalValue?.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted py-4 text-center">No supplier metrics yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 5 — Activity Feed */}
          <div className="bg-white border border-borderColor rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-borderColor flex items-center justify-center text-textSecondary flex-shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-textMuted bg-slate-50 px-2 py-0.5 rounded border border-borderColor">
                  Live Feed
                </span>
              </div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">
                Recent Stock Activity
              </h3>
              <div className="space-y-2">
                {summary?.stockMovements?.length > 0 ? (
                  summary.stockMovements.slice(0, 5).map((m) => (
                    <div key={m._id} className="flex items-center justify-between py-1.5 border-b border-borderColor/40 last:border-0">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-xs font-semibold text-textPrimary truncate" title={m.productName}>
                          {m.productName}
                        </span>
                        <span className="text-[9px] text-textSecondary truncate capitalize">
                          {m.type} • {m.reason || 'Manual update'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                        m.type === 'in'
                          ? 'bg-emerald-50 text-brandSuccess border-emerald-100'
                          : m.type === 'out'
                          ? 'bg-red-50 text-brandDanger border-red-100'
                          : 'bg-blue-50 text-brandSecondary border-blue-100'
                      }`}>
                        {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted py-4 text-center">No recent stock activity</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Low Stock Alert Table ── */}
      <LowStockAlert products={lowStockProducts.slice(0, 5)} />

    </div>
  )
}