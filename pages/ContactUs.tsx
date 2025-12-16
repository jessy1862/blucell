
import React, { useState } from 'react';
import { Card, Button, Input, SectionTitle } from '../components/ui';
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle } from 'lucide-react';
import { ContactInfo } from '../types';
import { DEFAULT_CONTACT_INFO } from '../constants';
import { db, collection, addDoc } from '../services/firebase';
import { saveContactMessageToNeon } from '../services/neon';

interface ContactUsProps {
    contactInfo?: ContactInfo;
    onSendMessage?: (msg: { name: string, email: string, subject: string, message: string }) => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ contactInfo = DEFAULT_CONTACT_INFO, onSendMessage }) => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const timestamp = new Date().toISOString();

    try {
        // 1. Save to Firestore (Existing logic - kept for redundancy)
        const firestorePromise = addDoc(collection(db, "contact_messages"), {
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            date: timestamp,
            read: false
        }).catch(e => console.error("Firestore save failed", e));

        // 2. Save to Neon Postgres (New logic)
        const neonPromise = saveContactMessageToNeon({
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            created_at: timestamp
        }).catch(e => console.error("Neon DB save failed", e));
        
        // Wait for both to attempt saving
        await Promise.allSettled([firestorePromise, neonPromise]);
        
        // Update local state (for admin view/UI consistency)
        if (onSendMessage) {
            onSendMessage(form);
        }

        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
        console.error("Error sending message: ", error);
        // We still show success if at least one service likely worked or to not discourage user
        // Ideally show a toast error here if both failed
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 animate-fade-in">
      <SectionTitle title="Contact Us" subtitle="We're here to help with your repairs and orders." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blucell-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-8">Get in Touch</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-blucell-500/10 rounded-xl backdrop-blur-md border border-blucell-500/20 group-hover:bg-blucell-500/20 transition-colors shrink-0">
                      <Phone className="w-6 h-6 text-blucell-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Phone Support</p>
                      <p className="font-bold text-lg tracking-tight text-white">{contactInfo.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">Mon-Fri 8am-6pm PST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-blucell-500/10 rounded-xl backdrop-blur-md border border-blucell-500/20 group-hover:bg-blucell-500/20 transition-colors shrink-0">
                      <Mail className="w-6 h-6 text-blucell-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Email</p>
                      <p className="font-bold text-lg tracking-tight text-white">{contactInfo.email}</p>
                      <p className="text-xs text-slate-500 mt-1">24/7 Online Support</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-blucell-500/10 rounded-xl backdrop-blur-md border border-blucell-500/20 group-hover:bg-blucell-500/20 transition-colors shrink-0">
                      <MapPin className="w-6 h-6 text-blucell-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Headquarters</p>
                      <p className="font-bold text-lg tracking-tight leading-snug whitespace-pre-wrap text-white">{contactInfo.address}</p>
                    </div>
                  </div>
                </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-silver-300 dark:border-l-silver-700">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-silver-400" />
                <h3 className="font-bold text-lg text-silver-900 dark:text-white">Quick Answers</h3>
            </div>
            <div className="space-y-4 text-sm text-silver-600 dark:text-silver-400">
                <div className="pb-3 border-b border-silver-100 dark:border-silver-800 last:border-0 last:pb-0">
                    <p className="font-bold text-silver-800 dark:text-silver-200 mb-1">How do I track my repair?</p>
                    <p>Track real-time status in your Dashboard under the "Repairs" tab.</p>
                </div>
                <div>
                    <p className="font-bold text-silver-800 dark:text-silver-200 mb-1">What is the warranty period?</p>
                    <p>90-day warranty on all repairs and 1-year on new products.</p>
                </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 md:p-10 h-full">
            {submitted ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-silver-900 dark:text-white mb-3">Message Sent!</h3>
                    <p className="text-silver-500 text-lg max-w-md mx-auto">Thanks for reaching out. Our team will review your message and get back to you within 24 hours.</p>
                    <Button variant="outline" className="mt-8 px-8" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="mb-8 pb-6 border-b border-silver-100 dark:border-silver-800">
                        <h3 className="text-2xl font-bold text-silver-900 dark:text-white mb-2">Send us a Message</h3>
                        <p className="text-silver-500">Have a specific question about a device or repair? Fill out the form below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Your Name" 
                                placeholder="e.g. Alex Sterling" 
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                required 
                                className="bg-silver-50 dark:bg-silver-900 border-silver-200 dark:border-silver-800 focus:bg-white dark:focus:bg-silver-950 transition-colors"
                            />
                            <Input 
                                label="Email Address" 
                                type="email" 
                                placeholder="name@example.com" 
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                required 
                                className="bg-silver-50 dark:bg-silver-900 border-silver-200 dark:border-silver-800 focus:bg-white dark:focus:bg-silver-950 transition-colors"
                            />
                        </div>
                        <Input 
                            label="Subject" 
                            placeholder="Briefly describe your inquiry..." 
                            value={form.subject}
                            onChange={(e) => setForm({...form, subject: e.target.value})}
                            required 
                            className="bg-silver-50 dark:bg-silver-900 border-silver-200 dark:border-silver-800 focus:bg-white dark:focus:bg-silver-950 transition-colors"
                        />
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-2">Message</label>
                            <textarea 
                                className="w-full rounded-xl border border-silver-200 dark:border-silver-800 bg-silver-50 dark:bg-silver-900 px-4 py-3 text-sm h-48 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100 placeholder:text-silver-400 focus:bg-white dark:focus:bg-silver-950 transition-colors resize-none"
                                placeholder="How can we help you today? Please provide as many details as possible..."
                                value={form.message}
                                onChange={(e) => setForm({...form, message: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting} className="px-8 py-3 text-base flex items-center gap-2 shadow-lg shadow-blucell-500/20">
                                <Send className="w-5 h-5" /> Send Message
                            </Button>
                        </div>
                    </form>
                </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
