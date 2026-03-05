import React, { useState } from 'react';
import {
    Calendar,
    Plus,
    Info,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { cn } from '../../utils/cn';

const LeavePage: React.FC = () => {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const balances = [
        { type: 'Sick Leave', used: 2, total: 12, color: 'rose' },
        { type: 'Casual Leave', used: 4, total: 10, color: 'amber' },
        { type: 'Privilege Leave', used: 0, total: 15, color: 'indigo' },
    ];

    const requests = [
        { id: '1', type: 'Sick Leave', from: 'Mar 10', to: 'Mar 12', days: 3, status: 'PENDING', reason: 'Fever and cold', employee: 'Ganesh Balaji' },
        { id: '2', type: 'Vacation', from: 'Apr 20', to: 'Apr 25', days: 6, status: 'APPROVED', reason: 'Family trip', employee: 'Sarah Miller' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave <span className="text-indigo-600">Management</span></h1>
                    <p className="text-slate-500 font-medium">Plan your time off and track your balances.</p>
                </div>
                <button className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95 group">
                    <Plus className="w-5 h-5" />
                    <span>Apply for Leave</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balances */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center">
                            <Info className="w-5 h-5 mr-3 text-indigo-500" />
                            Your Balances
                        </h3>
                        <div className="space-y-6">
                            {balances.map((bal) => (
                                <div key={bal.type} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{bal.type}</p>
                                            <p className="text-lg font-black text-slate-900">{bal.total - bal.used} <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">Days Left</span></p>
                                        </div>
                                        <p className="text-xs font-black text-slate-400">{bal.used}/{bal.total} Total</p>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 group-hover:opacity-80",
                                                `bg-${bal.color}-500 shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.5)]`
                                            )}
                                            style={{ width: `${(bal.used / bal.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <FileText className="w-8 h-8 text-indigo-400 mb-4" />
                        <h4 className="text-lg font-black mb-2">Policy Documents</h4>
                        <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">View all company leave and attendance policies in detail.</p>
                        <button className="flex items-center text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                            View Policies <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>

                {/* Request History / Approvals */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                                <Clock className="w-5 h-5 mr-3 text-amber-500" />
                                {isAdminOrHR ? "Recent Applications" : "My Requests"}
                            </h2>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {requests.map((req) => (
                                <div key={req.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center space-x-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner",
                                            req.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {req.type[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-black text-slate-900 leading-none">{req.type}</h4>
                                                <span className="text-[10px] font-black text-slate-300 uppercase leading-none mt-0.5">• {req.days} Days</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold mt-1.5">{req.from} to {req.to}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1 italic">"{req.reason}"</p>
                                            {isAdminOrHR && <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Requested by: {req.employee}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <StatusBadge status={req.status} />
                                        {isAdminOrHR && req.status === 'PENDING' && (
                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button className="p-2 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 border border-rose-100 bg-rose-50 text-rose-600 rounded-lg shadow-sm hover:bg-rose-100">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                            <AlertCircle className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Holiday Season Notice</p>
                            <p className="text-[10px] text-indigo-700 font-semibold">Applying for leave during Mar 25 - Apr 05 might require 1-level extra approval due to peak holiday season.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeavePage;
