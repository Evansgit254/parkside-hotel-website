"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot } from "lucide-react";
import { addLead } from "../actions";

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Welcome to Parkside Villa! How can we assist you today?' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.message.trim()) return;

        const newMsg = { role: 'user', text: formData.message };
        setMessages([...messages, newMsg]);
        setIsSubmitting(true);

        if (step === 1) {
            setStep(2);
            setMessages(prev => [...prev, { role: 'bot', text: 'Thank you! To better assist you, could you please provide your contact details?' }]);
            setIsSubmitting(false);
            setFormData({ ...formData, message: "" });
        } else {
            // Final submission as a lead
            await addLead({
                name: formData.name,
                email: formData.email,
                phone: "Via Live Chat",
                room: "General Inquiry",
                guests: "1",
                date: "Ongoing",
                message: formData.message
            });

            setMessages(prev => [...prev, { role: 'bot', text: 'Got it! Our concierge team has been notified and will reach out to you shortly via email. Have a wonderful day!' }]);
            setIsSubmitting(false);
            setFormData({ name: "", email: "", message: "" });
            setStep(3);
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-[2000] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-96 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1a]/95 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="bg-[#d4af37] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-bold text-[#0f0f0e] uppercase tracking-widest text-xs">Villa Concierge</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-[#0f0f0e]/60 hover:text-[#0f0f0e]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="h-96 overflow-y-auto p-6 flex flex-col gap-4 bg-black/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                                            ? 'bg-[#d4af37] text-[#0f0f0e]'
                                            : 'bg-white/5 text-white/80 border border-white/5'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isSubmitting && <div className="text-white/30 text-[10px] animate-pulse">Typing...</div>}
                        </div>

                        {/* Input Area */}
                        {step < 3 && (
                            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/40">
                                {step === 2 && (
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Name"
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email"
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        placeholder={step === 1 ? "How can we help?" : "Type your message..."}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#d4af37] text-[#0f0f0e] w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-[#d4af37] text-[#0f0f0e] shadow-2xl flex items-center justify-center relative group"
            >
                <div className="absolute inset-0 rounded-full border border-[#d4af37] group-hover:animate-ping opacity-25" />
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
}
