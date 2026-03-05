import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Calendar,
    Clock,
    Megaphone,
    Ticket,
    Settings,
    LogOut,
    ChevronRight,
    BarChart4,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { cn } from '../../utils/cn';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Employees', icon: Users, path: '/employees', roles: ['ADMIN', 'HR'] },
        { title: 'Onboarding', icon: FileCheck, path: '/onboarding', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Attendance', icon: Clock, path: '/attendance', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Leaves', icon: Calendar, path: '/leaves', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Tickets', icon: Ticket, path: '/tickets', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { title: 'Analytics', icon: BarChart4, path: '/analytics', roles: ['ADMIN', 'HR'] },
        { title: 'Audit Logs', icon: ShieldCheck, path: '/management', roles: ['ADMIN'] },
    ];

    const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl">
            <div className="p-6 flex items-center space-x-3 bg-slate-900/50 border-b border-slate-800">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-xl font-bold">Z</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">ZDotApps <span className="text-indigo-400">Portal</span></h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>

                {filteredItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className={cn(
                                    "w-5 h-5 mr-3 transition-colors",
                                    isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                                )} />
                                <span className="font-medium">{item.title}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="flex items-center p-3 rounded-xl bg-slate-800/50 mb-3 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold truncate text-slate-100">{user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-indigo-400 font-medium">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-rose-400 bg-rose-400/10 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-400/20"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
