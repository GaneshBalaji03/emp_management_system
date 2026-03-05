import React, { useState } from 'react';
import {
    FileCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Upload,
    Eye,
    CheckSquare,
    History,
    Info
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { cn } from '../../utils/cn';

const OnboardingPage: React.FC = () => {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

    const pendingOnboardings = [
        { id: '1', name: 'Ganesh Balaji', dept: 'Engineering', progress: 40, status: 'IN_PROGRESS', tasks: 12, completed: 5 },
        { id: '2', name: 'Alice Smith', dept: 'HR', progress: 15, status: 'NOT_STARTED', tasks: 10, completed: 1 },
        { id: '3', name: 'Bob Johnson', dept: 'Sales', progress: 90, status: 'VERIFIED', tasks: 15, completed: 14 },
    ];

    const employeeTasks = [
        { id: 't1', title: 'Personal Information Form', description: 'Complete your profile details.', status: 'VERIFIED', due: 'Today' },
        { id: 't2', title: 'Aadhar & PAN Upload', description: 'Upload scanned copies of ID proofs.', status: 'PENDING', due: 'Mar 10' },
        { id: 't3', title: 'Bank Account Details', description: 'Enter salary credit information.', status: 'NOT_STARTED', due: 'Mar 12' },
        { id: 't4', title: 'Company Policy Acknowledgement', description: 'Read and sign the employee handbook.', status: 'NOT_STARTED', due: 'Mar 15' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding <span className="text-indigo-600">Center</span></h1>
                    <p className="text-slate-500 font-medium">
                        {isAdminOrHR
                            ? "Track and verify the onboarding status of new team members."
                            : "Complete your joining formalities to get started with the team."}
                    </p>
                </div>

                {isAdminOrHR && (
                    <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        {['PENDING', 'COMPLETED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                    activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isAdminOrHR ? (
                /* HR/ADMIN View: Onboarding Queue */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOnboardings.map((onb) => (
                        <div key={onb.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group border-b-4 border-b-indigo-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xl">
                                        {onb.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{onb.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{onb.dept}</p>
                                    </div>
                                </div>
                                <StatusBadge status={onb.status} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500 uppercase tracking-widest">Progress</span>
                                        <span className="text-indigo-600">{onb.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${onb.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center text-xs text-slate-500 font-bold">
                                        <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" />
                                        {onb.completed}/{onb.tasks} Tasks
                                    </div>
                                    <button className="text-xs font-black text-indigo-600 hover:underline flex items-center">
                                        Review <ChevronRight className="w-3 h-3 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Employee View: My Checklist */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                            <FileCheck className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboarding Checklist</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-indigo-600 leading-none">25%</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Overall Progress</p>
                                    </div>
                                </div>
                                <div className="h-2.5 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-indigo-600 w-1/4 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all"></div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {employeeTasks.map((task) => (
                                    <div key={task.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                                        <div className="flex items-center space-x-5 flex-1 pr-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                                                task.status === 'VERIFIED' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                                    task.status === 'PENDING' ? "bg-amber-50 border-amber-100 text-amber-500" :
                                                        "bg-white border-slate-100 text-slate-300 group-hover:border-indigo-200"
                                            )}>
                                                {task.status === 'VERIFIED' ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{task.description}</p>
                                                <div className="flex items-center mt-1.5 space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Due {task.due}</span>
                                                    <span className="text-slate-200">•</span>
                                                    <span className={cn(
                                                        task.status === 'VERIFIED' ? "text-emerald-500" :
                                                            task.status === 'PENDING' ? "text-amber-500" : ""
                                                    )}>{task.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {task.status === 'NOT_STARTED' && (
                                            <button className="bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-950/20 hover:bg-indigo-600 transition-all flex items-center whitespace-nowrap">
                                                Upload <ChevronRight className="w-3 h-3 ml-1" />
                                            </button>
                                        )}
                                        {task.status === 'VERIFIED' && (
                                            <div className="text-emerald-500 flex flex-col items-center">
                                                <Eye className="w-5 h-5 mb-1 opacity-20" />
                                                <span className="text-[10px] font-black uppercase">View</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <History className="w-8 h-8 text-indigo-500 mb-4" />
                            <h3 className="font-black text-slate-900 text-lg mb-2">Activity Feed</h3>
                            <div className="space-y-6 mt-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 leading-tight">Address Proof Verified</p>
                                    <p className="text-[10px] text-slate-400 font-medium">By Sarah (HR) • 2h ago</p>
                                </div>
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 leading-tight">Document Uploaded</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Pan Card • 5h ago</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-950/20 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 "></div>
                            <div className="relative z-10">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Info className="w-5 h-5 text-indigo-300" />
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Support</span>
                                </div>
                                <h4 className="font-black text-lg mb-2">Need help?</h4>
                                <p className="text-xs text-indigo-200 font-medium mb-6 leading-relaxed">If you're stuck or have questions about a document, our HR team is here to assist you.</p>
                                <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                                    Chat with HR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardingPage;
