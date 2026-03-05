import React from 'react';
import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { useAuth } from '../../api/AuthContext';

const Header: React.FC = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm shadow-black/5">
            <div className="flex items-center flex-1">
                <div className="relative w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects, employees, tasks..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all border hover:border-gray-300"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-5">
                <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                </button>

                <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <HelpCircle className="w-5 h-5" />
                </button>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center space-x-3 pl-2">
                    <div className="text-right hidden sm:block leading-none">
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                            Welcome, <span className="text-indigo-600 capitalize">
                                {user?.role === 'HR' ? 'HR' : user?.email?.split('@')[0]}
                            </span>
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
