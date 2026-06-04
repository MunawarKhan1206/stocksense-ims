'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3, TrendingUp, Archive, History, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import RevenueChart from '@/components/dashboard/RevenueChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'

const COLORS = ['#FF6B6B', '#4A9AF5', '#34D399', '#FFB347', '#A78BFA']

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/summary', { cache: 'no-store' })
        if (res.ok) {
          const summary = await res.json()
          setData(summary)
        }
      } catch (err) {
        console.error('Error fetching analytics reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse-slow">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  // Top products horizontal format
  const topProductsData = data?.topProducts || []

  // Stock movements list
  const movements = data?.stockMovements || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight leading-none">
          Analytics & Audits
        </h1>
        <p className="text-sm md:text-base text-textSecondary mt-1">
          Examine financial charts, product margins, category weightings, and transaction movements.
        </p>
      </div>

      {/* Row 1: Revenue Area Chart */}
      <div className="w-full">
        <RevenueChart data={data?.revenueByMonth} />
      </div>

      {/* Row 2: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Top Products Bar Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-textPrimary tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brandPrimary" />
              <span>Top Catalog Lines (Horizontal Volume)</span>
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">Top-selling items sorted by units sold</p>
          </div>

          <div className="w-full h-[280px]">
            {topProductsData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-textMuted">
                No sales recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="y"
                  margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    type="number" 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#64748B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    width={90}
                    tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0F172A' }}
                    labelStyle={{ color: '#64748B', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                    {topProductsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Category Pie Chart */}
        <CategoryPieChart data={data?.categoryBreakdown} />

      </div>

      {/* Row 3: Stock Movements Audit Trail */}
      <Card className="p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brandSecondary" />
            <h3 className="text-lg md:text-xl font-semibold text-textPrimary tracking-tight">Stock Movement Audit Logs</h3>
          </div>
          {movements.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-mono text-textSecondary">
              showing last {movements.length} events
            </Badge>
          )}
        </div>
        <p className="text-xs text-textSecondary mb-6">Chronological registry logging catalog entries, sales deductions, and inventory adjustments</p>

        <div className="overflow-x-auto">
          {movements.length === 0 ? (
            <div className="py-12 text-center text-xs text-textMuted">
              No stock movements recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Quantity</TableHead>
                  <TableHead className="text-xs">Reason/Origin</TableHead>
                  <TableHead className="text-xs">Date logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((move) => {
                  const date = new Date(move.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  return (
                    <TableRow key={move._id}>
                      <TableCell className="text-xs font-semibold text-textPrimary">
                        {move.productName}
                      </TableCell>
                      <TableCell>
                        {move.type === 'in' ? (
                          <Badge variant="success" className="text-[10px] py-0 px-2 font-bold font-mono">+ STOCK IN</Badge>
                        ) : move.type === 'out' ? (
                          <Badge variant="danger" className="text-[10px] py-0 px-2 font-bold font-mono">- STOCK OUT</Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] py-0 px-2 font-bold font-mono">ADJUST</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold font-mono tabular-nums text-textPrimary">
                        {move.quantity} units
                      </TableCell>
                      <TableCell className="text-xs text-textSecondary italic font-medium">
                        {move.reason || 'Manual Adjustment'}
                      </TableCell>
                      <TableCell className="text-xs text-textMuted font-mono">
                        {date}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

    </div>
  )
}
