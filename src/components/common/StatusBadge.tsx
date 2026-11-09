import React from 'react';

type StatusType = 
  | 'completed' 
  | 'paid' 
  | 'received' 
  | 'active'
  | 'reconciled'
  | 'partially_paid' 
  | 'partial' 
  | 'ordered' 
  | 'sent' 
  | 'draft' 
  | 'pending' 
  | 'unpaid' 
  | 'overdue' 
  | 'cancelled'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  const configs: Record<string, { bg: string; text: string; dot: string; defaultLabel: string }> = {
    completed: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'Completed' },
    paid: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'Paid' },
    received: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'Received' },
    active: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'Active' },
    reconciled: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'Reconciled' },
    in_stock: { bg: 'bg-[#F0F8F3]', text: 'text-[#00843D]', dot: 'bg-[#00A651]', defaultLabel: 'In Stock' },

    partially_paid: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', defaultLabel: 'Partially Paid' },
    partial: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', defaultLabel: 'Partial' },
    ordered: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', defaultLabel: 'Ordered' },
    sent: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', defaultLabel: 'Sent' },
    low_stock: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', defaultLabel: 'Low Stock' },

    draft: { bg: 'bg-neutral-100', text: 'text-neutral-700', dot: 'bg-neutral-400', defaultLabel: 'Draft' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', defaultLabel: 'Pending' },
    unpaid: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', defaultLabel: 'Unpaid' },

    overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', defaultLabel: 'Overdue' },
    cancelled: { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400', defaultLabel: 'Cancelled' },
    out_of_stock: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', defaultLabel: 'Out of Stock' },
  };

  const config = configs[normalized] || {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    dot: 'bg-neutral-400',
    defaultLabel: status
  };

  const displayLabel = label || config.defaultLabel;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
