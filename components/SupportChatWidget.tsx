import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card } from './ui';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { ChatMessage } from '../types';

interface SupportChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser?: { id: string; name: string };
}

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({ messages, onSendMessage, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  if (!currentUser) return null; // Don't show if not logged in (or handle differently)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-blucell-600 text-white hover:bg-blucell-700 hover:scale-110'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-[100] w-96 h-[500px] flex flex-col shadow-2xl animate-scale-up border-0 overflow-hidden">
          {/* Header */}
          <div className="bg-blucell-600 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Live Support
            </h3>
            <p className="text-blucell-100 text-xs mt-1">We typically reply within a few minutes.</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
            {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10">
                    <p>Welcome to BLUCELL Support!</p>
                    <p>How can we help you today?</p>
                </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                {msg.senderId !== currentUser.id && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mr-2 text-xs font-bold text-slate-500 shrink-0">
                        Sup
                    </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.senderId === currentUser.id 
                    ? 'bg-blucell-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 text-right ${msg.senderId === currentUser.id ? 'text-blucell-100' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-blucell-500 outline-none dark:text-white"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend}
                className="p-2 bg-blucell-600 text-white rounded-full hover:bg-blucell-700 transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}
    </>
  );
};
