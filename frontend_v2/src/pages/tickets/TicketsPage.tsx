import React, { useState } from 'react';
import {
    Plus,
    Search,
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Filter,
    LifeBuoy,
    MoreVertical,
    Paperclip,
    Tag
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { cn } from '../../utils/cn';

const TicketsPage: React.FC = () => {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const [tickets, setTickets] = useState([
        {
            id: 'T-1024',
            title: 'Salary Slip Missing for Feb 2026',
            category: 'Payroll',
            priority: 'HIGH',
            status: 'UNDER_REVIEW',
            date: 'Mar 04',
            employee: 'Ganesh Balaji'
        },
        {
            id: 'T-1025',
            title: 'Laptop Charger Replacement',
            category: 'IT Support',
            priority: 'MEDIUM',
            status: 'OPEN',
            date: 'Mar 05',
            employee: 'Sarah Miller'
        },
        {
            id: 'T-1022',
            title: 'Medical Insurance Inclusion',
            category: 'Benefits',
            priority: 'LOW',
            status: 'RESOLVED',
            date: 'Mar 02',
            employee: 'Alice Smith'
        },
    ]);

    const handleAddTicket = () => {
        const newTicket = {
            id: `T-${1026 + tickets.length}`,
            title: 'Software License Request',
            category: 'IT Support',
            priority: 'MEDIUM',
            status: 'OPEN',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            employee: user?.email?.split('@')[0] || 'Employee'
        };
        setTickets([newTicket, ...tickets]);
    };

    const handleResolve = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTickets(tix => tix.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Helpdesk & <span className="text-indigo-600">Tickets</span></h1>
                    <p className="text-slate-500 font-medium">Raise requests and track their resolution status.</p>
                </div>
                <button
                    onClick={handleAddTicket}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>New Ticket</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Support Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <LifeBuoy className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="font-black text-slate-900 text-lg mb-1">Support Hub</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Average Reply: 2.5h</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-2xl font-black text-slate-900">8</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Open</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-2xl font-black text-slate-900">142</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Solved</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <Paperclip className="w-8 h-8 text-indigo-400 mb-4" />
                        <h4 className="text-lg font-black mb-2">Knowledge Base</h4>
                        <p className="text-[10px] text-slate-400 font-medium mb-6 leading-relaxed">Self-service guides for common payroll and IT issues.</p>
                        <button className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                            Browse Docs
                        </button>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
                            <div className="relative flex-1 group w-full sm:w-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search tickets by ID, title..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Category</span>
                                </button>
                                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                                <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
                                    {['Open', 'Solved'].map((tab) => (
                                        <button key={tab} className={cn("px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight transition-all", tab === 'Open' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}>{tab}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1 italic font-medium">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Details</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tickets.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group cursor-pointer font-bold not-italic">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{t.id}</span>
                                                    <span className="text-slate-900 font-bold leading-tight group-hover:text-indigo-600 transition-colors">{t.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">Opened on {t.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-600 flex items-center">
                                                    <Tag className="w-3 h-3 mr-2 text-slate-300" />
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    t.priority === 'HIGH' ? "text-rose-500" :
                                                        t.priority === 'MEDIUM' ? "text-amber-500" : "text-emerald-500"
                                                )}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {t.status !== 'RESOLVED' && isAdminOrHR && (
                                                        <button
                                                            onClick={(e) => handleResolve(t.id, e)}
                                                            className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors tooltip"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-indigo-50/30 text-center border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-bold">Showing 3 of 150 tickets • <span className="text-indigo-600 hover:underline cursor-pointer">View All Activity Log</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketsPage;
