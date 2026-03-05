import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    VERIFIED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-orange-50 text-orange-700 border-orange-200',
    // Ticket statuses
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    // Audit log statuses
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    // Attendance statuses
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200',
    // Onboarding
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    NOT_STARTED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const normalizedStatus = status.toUpperCase();
    const colorClass = statusColors[normalizedStatus] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border",
            colorClass,
            className
        )}>
            {status}
        </span>
    );
};
