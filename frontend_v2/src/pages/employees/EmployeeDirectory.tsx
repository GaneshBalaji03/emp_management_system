import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    ArrowUpDown,
    FileText,
    UserCheck,
    UserX,
    ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { cn } from '../../utils/cn';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeDirectory: React.FC = () => {
    const [employees, setEmployees] = useState([
        { id: '1', name: 'Ganesh Balaji', email: 'ganesh@example.com', role: 'Software Engineer', dept: 'Engineering', status: 'ACTIVE', doj: '2023-01-15' },
        { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'HR Manager', dept: 'HR', status: 'ACTIVE', doj: '2022-06-10' },
        { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'Product Lead', dept: 'Product', status: 'INACTIVE', doj: '2021-11-20' },
        { id: '4', name: 'Emma Wilson', email: 'emma@example.com', role: 'UI Designer', dept: 'Design', status: 'ACTIVE', doj: '2023-05-01' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newEmp) => {
                    setEmployees([newEmp, ...employees]);
                    setIsModalOpen(false);
                }}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employee <span className="text-indigo-600">Directory</span></h1>
                    <p className="text-slate-500 font-medium">Manage and view all members of your organization.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>New Employee</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, department..."
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center cursor-pointer hover:text-indigo-600 transition-colors">
                                        Employee <ArrowUpDown className="w-3 h-3 ml-2" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Role & Dept</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Joining Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 mr-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors capitalize">
                                                {emp.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight">{emp.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700 leading-tight">{emp.role}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{emp.dept}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 font-medium">{new Date(emp.doj).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={emp.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button title="View Profile" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-sm">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button title="Edit" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg border border-transparent hover:border-amber-100 transition-all shadow-sm">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button title="More Actions" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-semibold">Showing 1 to 4 of 1,284 entries</p>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">1</button>
                        <button className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">2</button>
                        <button className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDirectory;
