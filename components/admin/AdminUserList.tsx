'use client'

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Search, Trash2, Mail, ShieldAlert, Database, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    subscription_tier: string;
    ads_disabled: boolean;
    created_at: string;
}

export function AdminUserList() {
    const supabase = createClient();
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setUsers(data as Profile[]);
            } else if (error) {
                console.error('Error fetching users:', error);
                toast.error('Failed to sync node registry');
            }
        } catch (err) {
            console.error('An unexpected error occurred:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAds = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ ads_disabled: !currentStatus })
            .eq('id', userId);

        if (error) {
            toast.error('Failed to patch ad protocol');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, ads_disabled: !currentStatus } : u));
            toast.success('Ad protocol modified');
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            toast.error('Failed to escalate clearance');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success(`Identity cleared as ${newRole}`);
        }
    };

    const updateSubscription = async (userId: string, newTier: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ subscription_tier: newTier })
            .eq('id', userId);

        if (error) {
            toast.error('Failed to primary tier sync');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, subscription_tier: newTier } : u));
            toast.success(`Neural tier adjusted to ${newTier}`);
        }
    };

    const purgeUserData = async (userId: string) => {
        const { error } = await supabase.rpc('delete_user_data_admin', { target_user_id: userId });
        
        if (error) {
            console.error('Error purging user data:', error);
            toast.error(`PROTOCOL FAILURE: ${error.message}`);
        } else {
            setUsers(users.filter(u => u.id !== userId));
            toast.success('User data scrubbed from registry');
        }
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">Command Center: User Grid</CardTitle>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {users.length} Active Neural Nodes Registered
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={fetchUsers} 
                      disabled={isLoading}
                      className="rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest h-12 px-6 gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm active:scale-95 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Sync Registry
                    </Button>
                    <div className="relative w-full md:w-72 group">
                        <div className="absolute inset-0 bg-violet-500/5 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <Input 
                            placeholder="Filter Identifiers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md focus:ring-violet-500/20 text-xs font-bold"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50">
                                <TableHead className="px-8 h-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Identity</TableHead>
                                <TableHead className="h-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance</TableHead>
                                <TableHead className="h-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription</TableHead>
                                <TableHead className="h-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">Genesis Date</TableHead>
                                <TableHead className="px-8 h-16 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocols</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase text-violet-600 tracking-[0.3em] animate-pulse">Synchronizing Registry...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                       <div className="flex flex-col items-center justify-center gap-4 py-12">
                                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                             <Database className="w-8 h-8 text-slate-300" />
                                          </div>
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Zero Records Detected</p>
                                       </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((profile) => (
                                    <TableRow key={profile.id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors group">
                                        <TableCell className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 flex items-center justify-center font-black text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shadow-sm group-hover:scale-105 transition-transform">
                                                    {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[180px] uppercase tracking-tighter">
                                                       {profile.full_name || 'Anonymous Node'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3 opacity-50" /> {profile.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                         <TableCell>
                                            <Select 
                                                value={profile.role} 
                                                onValueChange={(val) => updateRole(profile.id, val)}
                                            >
                                                <SelectTrigger className="h-10 w-32 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                    <SelectItem value="user" className="text-[10px] font-black uppercase tracking-widest py-3">User Node</SelectItem>
                                                    <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest py-3 text-violet-600">Admin Priv</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={profile.subscription_tier} 
                                                onValueChange={(val) => updateSubscription(profile.id, val)}
                                            >
                                                <SelectTrigger className="h-10 w-40 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                    <SelectItem value="free" className="text-[10px] font-black uppercase tracking-widest py-3">Free Sequence</SelectItem>
                                                    <SelectItem value="full_access" className="text-[10px] font-black uppercase tracking-widest py-3 text-emerald-600">Full Access</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-8 text-right">
                                            <div className="flex items-center justify-end gap-10">
                                                  <div className="flex flex-col items-center">
                                                      <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase mb-2 leading-none tracking-[0.2em]">Ad Protocols</span>
                                                      <div className="flex items-center gap-3">
                                                         <span className={`text-[8px] font-black uppercase tracking-widest ${!(profile.ads_disabled || false) ? 'text-rose-500' : 'text-slate-200 dark:text-slate-800'}`}>ON</span>
                                                         <Switch 
                                                             checked={profile.ads_disabled || false} 
                                                             onCheckedChange={() => toggleAds(profile.id, profile.ads_disabled || false)}
                                                             className="data-[state=checked]:bg-emerald-500"
                                                         />
                                                         <span className={`text-[8px] font-black uppercase tracking-widest ${(profile.ads_disabled || false) ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-800'}`}>OFF</span>
                                                      </div>
                                                  </div>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all active:scale-95">
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2.5rem] border-rose-100 dark:border-rose-900 shadow-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter text-rose-600 flex items-center gap-3 italic">
                                                                <ShieldAlert className="w-7 h-7" />
                                                                Extraction Protocol
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                This will permanently terminate the identity sequence for <span className="font-black text-slate-900 dark:text-white underline">{profile.email}</span>. All stored intelligence snapshots and assets will be inaccessible.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="mt-8 gap-4">
                                                            <AlertDialogCancel className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest px-8">Abort Sequence</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                className="h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest px-8 shadow-xl shadow-rose-500/20"
                                                                onClick={() => purgeUserData(profile.id)}
                                                            >
                                                                Scrub Registry
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
