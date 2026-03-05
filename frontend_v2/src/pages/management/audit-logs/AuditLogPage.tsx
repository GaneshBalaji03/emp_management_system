import React from 'react';
import {
    ShieldCheck,
    Search,
    Filter,
    Download,
    Clock,
    ChevronRight,
    History,
    Calendar
} from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { cn } from '../../../utils/cn';

const AuditLogPage: React.FC = () => {
    const logs = [
        {
            id: 'L-8821',
            user: 'Sarah Miller (HR)',
            action: 'EMPLOYEE_CREATE',
            target: 'EMP-992 (David Wood)',
            time: '12:45 PM',
            date: 'Today',
            status: 'SUCCESS'
        },
        {
            id: 'L-8820',
            user: 'Admin',
            action: 'ROLE_UPDATE',
            target: 'Ganesh Balaji (EMPLOYEE -> ADMIN)',
            time: '11:20 AM',
            date: 'Today',
            status: 'SUCCESS'
        },
        {
            id: 'L-8819',
            user: 'Sarah Miller (HR)',
            action: 'LEAVE_APPROVE',
            target: 'Leave ID: #4421',
            time: '10:05 AM',
            date: 'Today',
            status: 'SUCCESS'
        },
        {
            id: 'L-8818',
            user: 'System',
            action: 'TOKEN_REFRESH',
            target: 'User ID: #551',
            time: '09:00 AM',
            date: 'Today',
            status: 'WARNING'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System <span className="text-indigo-600">Audit Logs</span></h1>
                    <p className="text-slate-500 font-medium">Traceable history of all system activities and administrative actions.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" />
                        <span>Export Logs</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {/* Advanced Filters */}
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative flex-1 group w-full lg:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by action, user, or target..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                        <div className="flex items-center bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 whitespace-nowrap">
                            <Filter className="w-3.5 h-3.5 mr-2" />
                            <span>Action Type: All</span>
                        </div>
                        <div className="flex items-center bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 mr-2" />
                            <span>Date Range</span>
                        </div>
                    </div>
                </div>

                {/* Log Feed */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white sticky top-0 z-10">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Time</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Initiated By</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 italic font-medium">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors group cursor-default">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 text-slate-300 mr-3" />
                                            <div>
                                                <p className="text-xs font-black text-slate-900 not-italic leading-none mb-1">{log.time}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter not-italic">{log.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3 not-italic">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                                {log.user[0]}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2 not-italic">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black tracking-widest text-slate-600 flex items-center">
                                                <ShieldCheck className="w-3.5 h-3.5 mr-2 opacity-40 shrink-0" />
                                                {log.action}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-slate-500 font-bold not-italic">{log.target}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black tracking-widest not-italic border",
                                            log.status === 'SUCCESS' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 text-center border-t border-slate-100 flex flex-col items-center">
                    <History className="w-6 h-6 text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400 font-bold">Audit logs are immutable and cryptographically signed. Records are kept for 7 years.</p>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;
