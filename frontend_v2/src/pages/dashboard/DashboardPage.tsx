import React from 'react';
import {
    Users,
    UserPlus,
    FileWarning,
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { cn } from '../../utils/cn';
import { StatusBadge } from '../../components/common/StatusBadge';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const stats = [
        { label: 'Headcount', value: '1,284', icon: Users, color: 'indigo', trend: '+12% this month' },
        { label: 'Pending Docs', value: '18', icon: FileWarning, color: 'amber', trend: '5 critical' },
        { label: 'On Leave', value: '24', icon: Calendar, color: 'rose', trend: '8 returning tomorrow' },
        { label: 'Attendance', value: '98.2%', icon: CheckCircle2, color: 'emerald', trend: '+0.4% vs last week' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {isAdminOrHR
                            ? "Everything looks good today. Here's your organizational summary."
                            : "Welcome back! Here's a quick look at your profile status."}
                    </p>
                </div>

                {isAdminOrHR && (
                    <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 group">
                        <UserPlus className="w-5 h-5" />
                        <span>Add New Employee</span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-3xl -translate-y-1/2 translate-x-1/2 opacity-10 rounded-full",
                            `bg-${stat.color}-500`
                        )}></div>

                        <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                                "p-3 rounded-2xl shadow-sm border",
                                `bg-${stat.color}-50/50 border-${stat.color}-100 text-${stat.color}-600`
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                                Live
                            </div>
                        </div>

                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mb-2 truncate">{stat.value}</h3>
                        <p className="text-xs font-semibold text-slate-400 truncate">{stat.trend}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <h2 className="font-bold text-slate-900 text-lg flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                {isAdminOrHR ? "Pending Approvals" : "My Recent Tasks"}
                            </h2>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {isAdminOrHR ? "JD" : "TS"}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">
                                                {isAdminOrHR ? "John Doe" : "Update Profile Photo"}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {isAdminOrHR ? "Requested 2 days leave (Sick Leave)" : "Onboarding item #4"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <StatusBadge status={isAdminOrHR ? "PENDING" : "SUBMITTED"} />
                                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <ArrowUpRight className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Announcements Widget */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex items-center space-x-2 mb-6">
                            <Megaphone className="w-5 h-5 text-indigo-300" />
                            <h2 className="font-bold uppercase tracking-widest text-xs">Announcements</h2>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
                                <h3 className="font-bold text-sm mb-1 group-hover:text-indigo-200 transition-colors">Annual Townhall 2026</h3>
                                <p className="text-[10px] text-indigo-200 font-medium mb-2">March 15, 2026 • 10:00 AM</p>
                                <div className="flex items-center text-[10px] font-bold text-white uppercase tracking-tighter">
                                    Join Meeting <ArrowUpRight className="w-3 h-3 ml-1" />
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <h3 className="font-bold text-sm mb-1 group-hover:text-indigo-200 transition-colors">New Policy Update</h3>
                                <p className="text-[10px] text-indigo-300 font-medium">March 12, 2026</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 text-sm italic">Quick Tip</h3>
                            <AlertCircle className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Complete your onboarding forms by Friday to ensure a smooth salary processing for this month.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
