"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { addLead } from "../actions";
import styles from "./LiveChat.module.css";

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
                date: `Chat: ${formData.message}`,
            });

            setMessages(prev => [...prev, { role: 'bot', text: 'Got it! Our concierge team has been notified and will reach out to you shortly via email. Have a wonderful day!' }]);
            setIsSubmitting(false);
            setFormData({ name: "", email: "", message: "" });
            setStep(3);
        }
    }

    return (
        <div className={styles.chatContainer}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={styles.chatWindow}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <div className={styles.onlineIndicator} />
                                <span className={styles.headerTitle}>Villa Concierge</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className={styles.messagesArea}>
                            {messages.map((m, i) => (
                                <div key={i} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper}`}>
                                    <div className={`${styles.messageBubble} ${m.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isSubmitting && <div className={styles.typingIndicator}>Typing...</div>}
                        </div>

                        {/* Input Area */}
                        {step < 3 && (
                            <form onSubmit={handleSend} className={styles.inputArea}>
                                {step === 2 && (
                                    <div className={styles.formGrid}>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Name"
                                            className={styles.inputField}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email"
                                            className={styles.inputField}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className={styles.messageRow}>
                                    <input
                                        type="text"
                                        required
                                        placeholder={step === 1 ? "How can we help?" : "Type your message..."}
                                        className={styles.textInput}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={styles.sendButton}
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
                className={styles.chatButton}
            >
                <div className={styles.pingEffect} />
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
}
