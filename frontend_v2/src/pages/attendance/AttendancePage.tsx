import React, { useState } from 'react';
import {
    Clock,
    MapPin,
    Calendar,
    CheckCircle2,
    AlertCircle,
    History,
    Timer,
    Play,
    Square,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { cn } from '../../utils/cn';

const AttendancePage: React.FC = () => {
    const { user } = useAuth();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);

    const stats = [
        { label: 'This Month', value: '18 Days', sub: 'On track' },
        { label: 'Late Marks', value: '2', sub: 'Needs attention' },
        { label: 'Work Hours', value: '142h', sub: 'Avg 8.2h/day' },
        { label: 'Overtime', value: '4h', sub: 'Approved' },
    ];

    const handleCheckIn = () => {
        setIsCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString());
    };

    const handleCheckOut = () => {
        setIsCheckedIn(false);
        setCheckInTime(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Time & <span className="text-indigo-600">Attendance</span></h1>
                    <p className="text-slate-500 font-medium">Log your daily hours and track your productivity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Check-In Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden h-full">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>

                        <div className="mb-8">
                            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center mb-4 relative">
                                <Clock className={cn("w-10 h-10 transition-colors", isCheckedIn ? "text-indigo-600" : "text-slate-300")} />
                                {isCheckedIn && (
                                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="w-full space-y-4 mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Location Status</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500 uppercase">Within HQ Hub</span>
                            </div>

                            {isCheckedIn && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-left animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Timer className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Clocked In Since</span>
                                    </div>
                                    <span className="text-xs font-black text-indigo-700 uppercase">{checkInTime}</span>
                                </div>
                            )}
                        </div>

                        {!isCheckedIn ? (
                            <button
                                onClick={handleCheckIn}
                                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center group"
                            >
                                <Play className="w-4 h-4 mr-2 group-hover:fill-current" />
                                Clock In Now
                            </button>
                        ) : (
                            <button
                                onClick={handleCheckOut}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-500/10 transition-all flex items-center justify-center group"
                            >
                                <Square className="w-4 h-4 mr-2 group-hover:fill-current" />
                                Clock Out
                            </button>
                        )}

                        <p className="mt-6 text-[10px] text-slate-400 font-medium max-w-[180px]">
                            Your location is being tracked for geofenced attendance verification.
                        </p>
                    </div>
                </div>

                {/* Stats & History */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:scale-150"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                                <History className="w-5 h-5 mr-3 text-indigo-600" />
                                Monthly Records
                            </h2>
                            <div className="flex space-x-2">
                                <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">In / Out</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    {[
                                        { date: 'Today, Mar 05', in: '09:12 AM', out: '--', dur: '--', status: 'PRESENT' },
                                        { date: 'Yesterday, Mar 04', in: '09:05 AM', out: '06:15 PM', dur: '9h 10m', status: 'PRESENT' },
                                        { date: 'Wed, Mar 03', in: '09:45 AM', out: '07:00 PM', dur: '9h 15m', status: 'LATE' },
                                        { date: 'Tue, Mar 02', in: '--', out: '--', dur: '0h', status: 'ABSENT' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-900">{row.date}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                                                <span className="text-slate-900">{row.in}</span> / {row.out}
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-bold">{row.dur}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider",
                                                    row.status === 'PRESENT' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        row.status === 'LATE' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                            <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center justify-center mx-auto group">
                                Download Detailed Report <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
