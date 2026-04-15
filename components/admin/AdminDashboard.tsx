'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Activity, 
  Shield, 
  Clock,
  Crown,
  Phone,
  CheckCircle,
  Archive,
  Users,
  MessageSquare,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AdminUserList } from './AdminUserList';

interface AdminStats {
    totalUsers: number;
    paidUsers: number;
    activeToday: number;
    totalFiles: number;
    totalDiscoveryNotes: number;
}

export function AdminDashboard() {
    const supabase = createClient();
    const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, paidUsers: 0, activeToday: 0, totalFiles: 0, totalDiscoveryNotes: 0 });
    const [messages, setMessages] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'logs'>('overview');

    const fetchAdminData = async () => {
        try {
            // Fetch Stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: paidCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('subscription_tier', 'free');
            const { count: fileCount } = await supabase.from('notes').select('*', { count: 'exact', head: true });
            const { count: discoveryCount } = await supabase.from('discovery_notes').select('*', { count: 'exact', head: true });
            
            setStats({
                totalUsers: userCount || 0,
                paidUsers: paidCount || 0,
                activeToday: Math.floor((userCount || 0) * 0.4) || 0, 
                totalFiles: fileCount || 0,
                totalDiscoveryNotes: discoveryCount || 0
            });

            // Fetch Messages (Support + Subscription Notifications)
            const { data: supportMsgs } = await supabase
                .from('support_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            
            const { data: payMsgs } = await supabase
                .from('payment_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            // Combine and sort
            const combined = [
                ...(supportMsgs || []).map(m => ({ ...m, type: 'support' })),
                ...(payMsgs || []).map(m => ({ 
                    ...m, 
                    type: 'payment', 
                    subject: `Payment from ${m.user_email}`, 
                    message: `User upgraded to ${m.plan_name} (${m.amount} ${m.currency})`, 
                    status: 'unread' 
                }))
            ].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setMessages(combined);

            // Fetch Logs
            const { data: logData } = await supabase
                .from('admin_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            setLogs(logData || []);

        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
    }

    useEffect(() => {
        fetchAdminData();
    }, []);

    const updateMessageStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase.from('support_messages').update({ status }).eq('id', id);
            if (!error) {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
                window.dispatchEvent(new CustomEvent('dcpi-notification', {
                    detail: { title: 'Message Updated', type: 'success' }
                }));
            }
        } catch (err) {
            console.error('Error updating message status:', err);
        }
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'logs', label: 'System Logs', icon: Shield },
    ];

    return (
        <div className="flex h-full bg-white dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
            {/* Admin Side Panel */}
            <div className="w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                   <div className="p-2 bg-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
                      <Shield className="w-5 h-5 text-white" />
                   </div>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-700">Admin Control</h2>
                </div>
                <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-tight transition-all ${
                                activeTab === item.id 
                                ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/20 scale-[1.02]' 
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'animate-bounce' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-4 py-6 bg-slate-900 rounded-[2rem] text-center border border-white/5">
                    <p className="text-[10px] text-violet-400 font-black uppercase tracking-[0.3em] mb-1">Status: Stable</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Enterprise Deployment<br/>Smart Notes HQ</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-white dark:bg-slate-950">
                {activeTab === 'overview' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 rounded-full px-4 font-black text-[9px] uppercase tracking-widest">Real-time Terminal Active</Badge>
                           </div>
                           <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">System Intelligence</h1>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-600/10' },
                                { label: 'Revenue Tier', value: stats.paidUsers, icon: Crown, color: 'text-amber-600', bg: 'bg-amber-600/10' },
                                { label: 'Community Feed', value: stats.totalDiscoveryNotes, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
                                { label: 'Cloud Data', value: stats.totalFiles, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-600/10' },
                            ].map((stat, i) => (
                                <Card key={i} className="p-8 rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all group cursor-default">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className="h-1.5 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                                    </div>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{stat.value.toLocaleString()}</p>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                                </Card>
                            ))}
                        </div>

                        {/* Recent Activity & Messages */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Latest Messages */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recent Transactions</h3>
                                   <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-violet-600">View All</Button>
                                </div>
                                <div className="space-y-4">
                                    {messages.slice(0, 5).map((msg) => (
                                        <div key={msg.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 hover:border-violet-200 transition-all shadow-sm group">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-violet-600 text-lg group-hover:scale-105 transition-transform">
                                                {msg.email[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                   <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{msg.subject || 'Support Request'}</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate font-medium">{msg.message}</p>
                                                <Badge variant="outline" className={`rounded-lg h-6 px-2 text-[9px] font-black uppercase tracking-tighter ${msg.status === 'unread' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                                    {msg.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && <p className="text-xs font-black text-slate-400 text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] uppercase tracking-widest">Security Matrix Clear</p>}
                                </div>
                            </div>

                            {/* Immutable logs summary */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Audit Trail</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                    <div className="max-h-[380px] overflow-auto custom-scrollbar">
                                        {logs.map((log) => (
                                            <div key={log.id} className="p-5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-default">
                                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                   <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                   <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                                                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                                <Badge variant="outline" className="ml-auto text-[8px] font-black tracking-widest uppercase opacity-40">{log.admin_email?.split('@')[0]}</Badge>
                                            </div>
                                        ))}
                                        {logs.length === 0 && <p className="text-xs text-slate-400 text-center py-12 font-black uppercase tracking-widest">Registry Pristine</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <AdminUserList />
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex flex-col gap-2">
                           <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Support Matrix</h1>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Manage user inquiries and critical feedback</p>
                        </div>
                        <div className="grid gap-6">
                            {messages.map((msg) => (
                                <Card key={msg.id} className="p-8 rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 text-xl font-black italic">
                                                {msg.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{msg.email}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 align-middle">
                                                      <Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleString()}
                                                   </p>
                                                   {msg.phone && (
                                                      <p className="text-[10px] text-violet-600 font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors hover:text-violet-700 cursor-pointer">
                                                         <Phone className="w-3 h-3" /> {msg.phone}
                                                      </p>
                                                   )}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={`font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full ${msg.status === 'unread' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{msg.status}</Badge>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-6 ring-1 ring-slate-100 dark:ring-slate-800/50 shadow-inner">
                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                                           <MessageSquare className="w-3 h-3" /> Subject: {msg.subject || 'Platform Inquiry'}
                                        </h5>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-black italic">"{msg.message}"</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button 
                                           onClick={() => updateMessageStatus(msg.id, 'read')}
                                           className="bg-slate-900 text-white hover:bg-black rounded-2xl text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-xl"
                                        >
                                           <CheckCircle className="w-4 h-4 mr-2" /> Mark Handled
                                        </Button>
                                        <Button 
                                           variant="outline"
                                           onClick={() => updateMessageStatus(msg.id, 'archived')}
                                           className="rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 hover:bg-slate-50 dark:hover:bg-slate-900"
                                        >
                                           <Archive className="w-4 h-4 mr-2" /> Archive
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {messages.length === 0 && (
                               <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white/50 dark:bg-slate-900/50">
                                  <MessageSquare className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbox Zero Achieved</p>
                               </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
