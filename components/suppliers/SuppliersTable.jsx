'use client'

import { Mail, Phone, MapPin, Edit, Trash2, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

export default function SuppliersTable({ suppliers = [], onEdit, onDelete }) {
  const { data: session } = useSession()
  const role = session?.user?.role || 'staff'
  const canManage = ['super-admin', 'admin'].includes(role)

  const getInitials = (name) => {
    if (!name) return 'SP'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {suppliers.map((supplier) => (
        <Card 
          key={supplier._id} 
          hoverable={true} 
          className="border border-borderColor/6 bg-borderColor/2 flex flex-col justify-between overflow-hidden"
        >
          <CardContent className="p-6">
            {/* Header: Avatar and Company details */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center space-x-3.5 min-w-0">
                <Avatar className="w-11 h-11 border border-brandSecondary/25">
                  <AvatarFallback className="bg-brandSecondary/10 text-brandSecondary font-bold text-sm">
                    {getInitials(supplier.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm font-bold text-textPrimary truncate leading-tight">
                    {supplier.company || 'Private Distributor'}
                  </h4>
                  <span className="text-xs text-textSecondary mt-0.5 truncate font-medium">
                    {supplier.name}
                  </span>
                </div>
              </div>

              {/* Product Count Badge */}
              <Badge variant="success" className="text-[10px] py-0 px-2 font-mono flex items-center space-x-1 border-brandSuccess/20 bg-brandSuccess/5 shrink-0">
                <Briefcase className="w-3 h-3 text-brandSuccess mr-1" />
                <span>{supplier.productCount || 0} catalog items</span>
              </Badge>
            </div>

            {/* Info lines */}
            <div className="space-y-2.5 text-xs text-textSecondary">
              {supplier.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-textMuted shrink-0" />
                  <a href={`mailto:${supplier.email}`} className="hover:underline truncate hover:text-textPrimary font-medium">
                    {supplier.email}
                  </a>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-textMuted shrink-0" />
                  <a href={`tel:${supplier.phone}`} className="hover:underline hover:text-textPrimary font-mono">
                    {supplier.phone}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start space-x-2 pt-1 border-t border-borderColor/5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-textMuted shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">
                    {supplier.address}
                  </span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {canManage && (
              <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-borderColor/5">
                <button
                  onClick={() => onEdit(supplier)}
                  className="p-2 text-textSecondary hover:text-brandPrimary hover:bg-borderColor/5 rounded-xl transition-all"
                  title="Edit Supplier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(supplier)}
                  className="p-2 text-textSecondary hover:text-brandDanger hover:bg-borderColor/5 rounded-xl transition-all"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
