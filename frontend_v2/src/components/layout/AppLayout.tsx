import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../api/AuthContext';

const AppLayout: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your portal...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    {/* Subtle background flourishes */}
                    <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl opacity-40 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
