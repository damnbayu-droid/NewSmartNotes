'use client'

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendSupportEmail } from '@/lib/actions/emailActions';
import { toast } from 'sonner';

export function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-contact-modal', handleOpen);
    
    // Fetch user email if logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    };
    checkUser();

    return () => window.removeEventListener('open-contact-modal', handleOpen);
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setIsSubmitting(true);
    try {
      // 1. Send Real Email Notification via Server Action
      const emailRes = await sendSupportEmail({
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message
      });

      if (!emailRes.success) {
        throw new Error(emailRes.error || 'Failed to trigger support bridge');
      }

      // 2. Log to Database for Audit Trail
      const { error: dbError } = await supabase.from('support_messages').insert([{
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        status: 'unread',
        created_at: new Date().toISOString()
      }]);

      if (dbError) {
        console.warn('Email sent but DB log failed:', dbError);
      }

      setIsSuccess(true);
      toast.success('Inquiry Sent Successfully');
      
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        // Clear form
        setPhone('');
        setSubject('');
        setMessage('');
        setName('');
      }, 3000);
    } catch (err: any) {
      console.error('Contact submit error:', err);
      toast.error(err.message || 'Failed to connect to Support Matrix');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-violet-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950">
        {isSuccess ? (
          <div className="p-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Message Sent</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Our support intelligence has logged your inquiry. We will sync back with you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-8 bg-gradient-to-br from-violet-600 to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <DialogHeader className="relative z-10 text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white italic">Contact Support</DialogTitle>
                  <DialogDescription className="text-violet-100 font-bold opacity-90 text-[11px] uppercase tracking-widest mt-1">
                    Direct Bridge to Intelligence HQ
                  </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-8 space-y-5 bg-white dark:bg-slate-950">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                <Input 
                  placeholder="IDENTIFIER..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-violet-600 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <Input 
                    type="email" 
                    placeholder="PROTOCOL@MAIL.IO" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-violet-600 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Subject / System Area</label>
                <Input 
                  placeholder="TECHNICAL / BILLING / FEEDBACK" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-violet-600 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Message Detail</label>
                <Textarea 
                  placeholder="SYSTEM QUERY DETAILS..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-[120px] rounded-2xl border-slate-100 dark:border-slate-800 focus:ring-violet-600 bg-slate-50/50 dark:bg-slate-900/50 resize-none text-xs font-bold p-4"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-200 dark:shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transmit Inquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
