import React, { useState } from 'react';
import {
    Megaphone,
    Plus,
    Search,
    MoreVertical,
    Calendar,
    User,
    Tag,
    MessageSquare,
    ChevronRight,
    Pin
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { cn } from '../../utils/cn';

const AnnouncementsPage: React.FC = () => {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

    const [announcements, setAnnouncements] = useState([
        {
            id: '1',
            title: 'Annual Performance Review 2026',
            content: 'The performance review cycle for 2026 starts from April 1st. Please ensure your KRAs are updated and discussed with your reporting managers.',
            author: 'Sarah Miller (HR)',
            date: 'Mar 05, 2026',
            tag: 'IMPORTANT',
            isPinned: true
        },
        {
            id: '2',
            title: 'New Office Policy: Hybrid Work Updates',
            content: 'Starting next week, the office attendance requirement is updated to 3 days per week. Please coordinate with your team leads for schedule alignment.',
            author: 'Admin',
            date: 'Mar 02, 2026',
            tag: 'POLICY',
            isPinned: false
        },
        {
            id: '3',
            title: 'Team Outing - Bangalore Hub',
            content: 'We are organizing a team-building lunch with the Bangalore team this Friday. Don\'t forget to RSVP by Wednesday evening.',
            author: 'Ganesh Balaji',
            date: 'Feb 28, 2026',
            tag: 'SOCIAL',
            isPinned: false
        },
    ]);

    const handleAddAnnouncement = () => {
        const newAnn = {
            id: Date.now().toString(),
            title: 'New Platform Update ' + new Date().toLocaleTimeString(),
            content: 'We just pushed a new update to the internal portal. Please clear your cache and enjoy the new features!',
            author: user?.email?.split('@')[0] || 'Admin',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            tag: 'SYSTEM',
            isPinned: false
        };
        setAnnouncements([newAnn, ...announcements]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Company <span className="text-indigo-600">Announcements</span></h1>
                    <p className="text-slate-500 font-medium">Stay updated with the latest news and policies.</p>
                </div>
                {isAdminOrHR && (
                    <button
                        onClick={handleAddAnnouncement}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all group">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Post Update</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Filter by Category</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'All Updates', icon: Megaphone, count: 12, active: true },
                                { name: 'Policy', icon: Tag, count: 4, active: false },
                                { name: 'Events', icon: Calendar, count: 3, active: false },
                                { name: 'System', icon: Info, count: 2, active: false },
                            ].map((cat) => (
                                <button
                                    key={cat.name}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm",
                                        cat.active ? "bg-indigo-50 text-indigo-600 shadow-inner" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <cat.icon className="w-4 h-4 mr-3" />
                                        {cat.name}
                                    </div>
                                    <span className="text-[10px] font-black opacity-50">{cat.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125"></div>
                        <MessageSquare className="w-8 h-8 text-indigo-200 mb-4" />
                        <h4 className="text-lg font-black mb-2">Internal Blog</h4>
                        <p className="text-[10px] text-indigo-100 font-medium mb-6 leading-relaxed">Read stories and insights from your colleagues.</p>
                        <button className="flex items-center text-[10px] font-black uppercase tracking-widest text-white hover:underline">
                            Explore Now <ChevronRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-6">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden group">
                                {ann.isPinned && (
                                    <div className="absolute top-6 right-6 p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Pin className="w-4 h-4 fill-current" />
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                ann.tag === 'IMPORTANT' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    ann.tag === 'POLICY' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                                            )}>
                                                {ann.tag}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ann.date}</span>
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {ann.title}
                                            </h2>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                {ann.content}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {ann.author[0]}
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 tracking-tight">Posted by {ann.author}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <button className="text-xs font-black text-slate-400 hover:text-indigo-600 flex items-center transition-colors">
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    React
                                                </button>
                                                <button className="text-xs font-black text-slate-400 hover:text-indigo-600 flex items-center transition-colors">
                                                    Read More <ChevronRight className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
);

export default AnnouncementsPage;
