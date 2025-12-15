import React, { useState } from 'react';
import { Card, Button, Input, SectionTitle } from '../components/ui';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { ContactInfo } from '../types';
import { DEFAULT_CONTACT_INFO } from '../constants';

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSendMessage) {
        onSendMessage(form);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 animate-fade-in">
      <SectionTitle title="Contact Us" subtitle="We're here to help with your repairs and orders." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-blucell-600 text-white border-none">
            <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blucell-100 text-sm">Phone</p>
                  <p className="font-bold">{contactInfo.phone}</p>
                  <p className="text-xs text-blucell-200 mt-1">Mon-Fri 8am-6pm PST</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blucell-100 text-sm">Email</p>
                  <p className="font-bold">{contactInfo.email}</p>
                  <p className="text-xs text-blucell-200 mt-1">24/7 Online Support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blucell-100 text-sm">Headquarters</p>
                  <p className="font-bold whitespace-pre-wrap">{contactInfo.address}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm text-silver-600 dark:text-silver-400">
                <p><strong>How do I track my repair?</strong><br/>You can track the real-time status of your repair in your Dashboard under the "Repairs" tab.</p>
                <p><strong>What is the warranty period?</strong><br/>We offer a 90-day warranty on all repairs and a 1-year manufacturer warranty on new products.</p>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            {submitted ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-silver-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-silver-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Your Name" 
                            placeholder="John Doe" 
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            required 
                        />
                        <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="john@example.com" 
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            required 
                        />
                    </div>
                    <Input 
                        label="Subject" 
                        placeholder="Repair Inquiry, Order Issue..." 
                        value={form.subject}
                        onChange={(e) => setForm({...form, subject: e.target.value})}
                        required 
                    />
                    <div>
                        <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Message</label>
                        <textarea 
                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-40 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                            placeholder="How can we help you today?"
                            value={form.message}
                            onChange={(e) => setForm({...form, message: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                            <Send className="w-4 h-4" /> Send Message
                        </Button>
                    </div>
                </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};