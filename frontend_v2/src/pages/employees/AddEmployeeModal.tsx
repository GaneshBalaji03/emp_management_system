import React, { useState } from 'react';
import { X, User, Mail, Briefcase, MapPin, Calendar, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeCode: '',
        department: '',
        designation: '',
        doj: '',
        location: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 2) {
            setStep(step + 1);
            return;
        }

        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            onSuccess();
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                    Step {step} of 2
                                </div>
                                {step === 2 && (
                                    <div className="flex items-center text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Almost done
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">New Talent</span></h2>
                            <p className="text-slate-500 text-sm font-medium">Enter the essential details to create a new profile.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Ganesh Balaji"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="ganesh@company.com"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Employee ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="EMP-001"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        value={formData.employeeCode}
                                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        >
                                            <option value="">Select HQ</option>
                                            <option value="chennai">Chennai HQ</option>
                                            <option value="bangalore">Bangalore Hub</option>
                                            <option value="remote">Remote</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Dept</option>
                                            <option value="eng">Engineering</option>
                                            <option value="hr">Human Resources</option>
                                            <option value="sales">Sales & Marketing</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Senior Architect"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Joining Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            value={formData.doj}
                                            onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => step > 1 && setStep(step - 1)}
                                className={cn(
                                    "flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all",
                                    step === 1 ? "opacity-0 pointer-events-none" : "text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 transition-all disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{step === 1 ? "Continue" : "Finalize & Send Invite"}</span>
                                        {step === 1 && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
