import React from 'react';
import {
    TrendingUp,
    Users,
    UserMinus,
    UserPlus,
    PieChart,
    BarChart4,
    Calendar,
    ChevronRight,
    Download,
    Filter
} from 'lucide-react';
import { cn } from '../../utils/cn';

const AnalyticsPage: React.FC = () => {
    const stats = [
        { label: 'Headcount', value: '1,284', grow: '+12%', icon: Users, color: 'indigo' },
        { label: 'New Joiners', value: '45', grow: '+5%', icon: UserPlus, color: 'emerald' },
        { label: 'Attrition', value: '2%', grow: '-0.5%', icon: UserMinus, color: 'rose' },
        { label: 'Open Positions', value: '12', grow: '0%', icon: PieChart, color: 'amber' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System <span className="text-indigo-600">Analytics</span></h1>
                    <p className="text-slate-500 font-medium">Real-time insights and organizational trends.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" />
                        <span>Generate PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-indigo-600 transition-all">
                        <Filter className="w-4 h-4" />
                        <span>Advanced Filters</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150",
                            `bg-${stat.color}-500/10`
                        )}></div>
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn("p-3 rounded-2xl", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("text-xs font-black px-2 py-1 rounded-lg", stat.grow.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                {stat.grow}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                            <BarChart4 className="w-5 h-5 mr-3 text-indigo-600" />
                            Headcount Growth
                        </h2>
                        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {['6M', '1Y', 'ALL'].map((t) => (
                                <button key={t} className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", t === '1Y' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between space-x-2 pt-4">
                        {[35, 45, 65, 55, 85, 95, 75, 90, 110, 100, 120, 135].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                                <div
                                    className="w-full bg-slate-50 rounded-lg relative overflow-hidden transition-all duration-700 group-hover:bg-indigo-50"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-600 h-0 group-hover:h-full opacity-20"></div>
                                    <div className="absolute inset-x-0 bottom-0 bg-indigo-600 rounded-t-lg transition-all duration-700 h-[2px] group-hover:h-full"></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-3 transform -rotate-45 md:rotate-0">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Role Distribution</h2>
                    <div className="space-y-6">
                        {[
                            { name: 'Engineering', count: 540, progress: 75, color: 'indigo' },
                            { name: 'Sales', count: 320, progress: 45, color: 'emerald' },
                            { name: 'HR & Admin', count: 120, progress: 15, color: 'amber' },
                            { name: 'Product', count: 200, progress: 25, color: 'purple' },
                        ].map((role) => (
                            <div key={role.name}>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{role.name}</p>
                                    <p className="text-xs font-bold text-slate-400">{role.count}</p>
                                </div>
                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", `bg-${role.color}-500 shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.5)]`)} style={{ width: `${role.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-slate-950 rounded-[2rem] text-white relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none"></div>
                        <h4 className="text-sm font-black mb-1">Weekly Digest</h4>
                        <p className="text-[10px] text-slate-400 font-medium mb-4">You have 12 active hiring targets this month.</p>
                        <button className="flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                            View Reports <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
