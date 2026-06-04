// 'use client'

// import Link from 'next/link'
// import { AlertTriangle, TrendingUp, CheckCircle, AlertOctagon } from 'lucide-react'

// export default function InsightStrip({ insights }) {
//   const runningOutSoon = insights?.productsRunningOutSoon || []
//   const runningOutCount = runningOutSoon.length
//   const runOutText = runningOutCount > 0
//     ? `${runningOutCount} product${runningOutCount > 1 ? 's' : ''} will run out within 15 days based on sales velocity`
//     : 'Keep an eye on stock velocities to prevent unexpected stockouts'

//   const topCategory = insights?.topCategoryThisMonth
//   const categoryText = topCategory
//     ? `${topCategory} is your best-selling category this month`
//     : 'Log your sales to identify your highest revenue categories'

//   const weeklyRevenue = insights?.weeklyRevenueSummary?.thisWeek || 0
//   const weeklyText = weeklyRevenue > 0
//     ? `You recorded Rs. ${weeklyRevenue.toLocaleString()} in sales this week — great momentum!`
//     : 'Record sales logs daily to monitor weekly revenue metrics'

//   const outOfStockList = insights?.outOfStockProducts || []
//   const outOfStockCount = outOfStockList.length
//   const outOfStockText = outOfStockCount > 0
//     ? `${outOfStockList[0].name} is out of stock — you are missing sales opportunities`
//     : 'Zero out-of-stock items currently — excellent inventory health!'

//   const cards = [
//     {
//       text: runOutText, link: '/products', linkLabel: 'View Products',
//       border: 'border-amber-200', bg: 'bg-amber-50', textColor: 'text-amber-700', linkColor: 'text-amber-700',
//       icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
//     },
//     {
//       text: categoryText, link: '/analytics', linkLabel: 'View Analytics',
//       border: 'border-blue-200', bg: 'bg-blue-50', textColor: 'text-blue-700', linkColor: 'text-blue-700',
//       icon: <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
//     },
//     {
//       text: weeklyText, link: '/sales', linkLabel: 'View Sales',
//       border: 'border-emerald-200', bg: 'bg-emerald-50', textColor: 'text-emerald-700', linkColor: 'text-emerald-700',
//       icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
//     },
//     {
//       text: outOfStockText, link: '/products', linkLabel: 'Restock Now',
//       border: 'border-red-200', bg: 'bg-red-50', textColor: 'text-red-700', linkColor: 'text-brandPrimary',
//       icon: <AlertOctagon className="w-4 h-4 text-brandPrimary shrink-0 mt-0.5" />,
//     },
//   ]

//   return (
//     <div className="w-full">
//       <h4 className="text-xs font-bold text-textMuted tracking-wider uppercase mb-3">
//         Workspace Insights
//       </h4>

//       {/*
//         Mobile:  1 column (all 4 stacked)
//         Tablet:  2 columns (2 + 2)
//         Desktop: 4 columns (all in one row) — no scroll ever
//       */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
//         {cards.map((card, i) => (
//           <div
//             key={i}
//             className={`p-4 rounded-xl border ${card.border} ${card.bg} flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
//           >
//             <div className="flex items-start space-x-3">
//               {card.icon}
//               <p className={`text-xs font-medium ${card.textColor} leading-relaxed`}>
//                 {card.text}
//               </p>
//             </div>
//             <div className="mt-3 flex justify-end">
//               <Link
//                 href={card.link}
//                 className={`text-xs font-bold ${card.linkColor} hover:underline flex items-center space-x-1`}
//               >
//                 <span>{card.linkLabel}</span>
//                 <span>→</span>
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
'use client'

import Link from 'next/link'
import { AlertTriangle, TrendingUp, CheckCircle, AlertOctagon } from 'lucide-react'

export default function InsightStrip({ insights }) {
  const runningOutSoon = insights?.productsRunningOutSoon || []
  const runningOutCount = runningOutSoon.length
  const runOutText = runningOutCount > 0
    ? `${runningOutCount} product${runningOutCount > 1 ? 's' : ''} will run out within 15 days based on sales velocity`
    : 'Keep an eye on stock velocities to prevent unexpected stockouts'

  const topCategory = insights?.topCategoryThisMonth
  const categoryText = topCategory
    ? `${topCategory} is your best-selling category this month`
    : 'Log your sales to identify your highest revenue categories'

  const weeklyRevenue = insights?.weeklyRevenueSummary?.thisWeek || 0
  const weeklyText = weeklyRevenue > 0
    ? `You recorded Rs. ${weeklyRevenue.toLocaleString()} in sales this week — great momentum!`
    : 'Record sales logs daily to monitor weekly revenue metrics'

  const outOfStockList = insights?.outOfStockProducts || []
  const outOfStockCount = outOfStockList.length
  const outOfStockText = outOfStockCount > 0
    ? `${outOfStockList[0].name} is out of stock — you are missing sales opportunities`
    : 'Zero out-of-stock items currently — excellent inventory health!'

  const cards = [
    {
      text: runOutText, link: '/products', linkLabel: 'View Products',
      border: 'border-amber-200', bg: 'bg-amber-50', textColor: 'text-amber-700', linkColor: 'text-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    },
    {
      text: categoryText, link: '/analytics', linkLabel: 'View Analytics',
      border: 'border-blue-200', bg: 'bg-blue-50', textColor: 'text-blue-700', linkColor: 'text-blue-700',
      icon: <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    },
    {
      text: weeklyText, link: '/sales', linkLabel: 'View Sales',
      border: 'border-emerald-200', bg: 'bg-emerald-50', textColor: 'text-emerald-700', linkColor: 'text-emerald-700',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
    },
    {
      text: outOfStockText, link: '/products', linkLabel: 'Restock Now',
      border: 'border-red-200', bg: 'bg-red-50', textColor: 'text-red-700', linkColor: 'text-brandPrimary',
      icon: <AlertOctagon className="w-4 h-4 text-brandPrimary shrink-0 mt-0.5" />,
    },
  ]

  return (
    <div className="w-full">
      <h4 className="text-xs font-bold text-textMuted tracking-wider uppercase mb-3">
        Workspace Insights
      </h4>

      {/*
        Mobile:  1 column (all 4 stacked)
        Tablet:  2 columns (2 + 2)
        Desktop: 4 columns (all in one row) — no scroll ever
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border ${card.border} ${card.bg} flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start space-x-3">
              {card.icon}
              <p className={`text-xs font-medium ${card.textColor} leading-relaxed`}>
                {card.text}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <Link
                href={card.link}
                className={`text-xs font-bold ${card.linkColor} hover:underline flex items-center space-x-1`}
              >
                <span>{card.linkLabel}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}