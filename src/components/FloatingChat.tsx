import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/aiAgents';
import { useLocation } from 'react-router-dom';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState<{sender: 'user'|'bot', text: string}[]>([
        { sender: 'bot', text: 'DESTINAI Engine online. How can I optimize your itinerary today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, loading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const currentMsg = message;
        setMessage("");
        setHistory(prev => [...prev, { sender: 'user', text: currentMsg }]);
        setLoading(true);

        const context = `User is currently on the path: ${location.pathname}.`;
        const responseText = await getChatResponse(context, currentMsg, history);

        setHistory(prev => [...prev, { sender: 'bot', text: responseText }]);
        setLoading(false);
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-body">
            {isOpen ? (
                <div className="bg-[#0B1A2E]/90 backdrop-blur-3xl w-[380px] h-[600px] mb-4 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
                    
                    {/* Header */}
                    <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-[0_0_15px_rgba(255,183,64,0.4)]">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-midnight" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-display text-white text-base tracking-wide font-bold leading-none mb-1">DESTINAI Core</h3>
                                <p className="font-label text-[9px] text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-mist-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 relative z-10 focus:outline-none cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{ animationFillMode: 'both' }}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-body ${
                                    msg.sender === 'user' 
                                        ? 'bg-gold text-midnight shadow-[0_4px_20px_rgba(255,183,64,0.15)] rounded-tr-sm' 
                                        : 'bg-white/5 border border-white/10 text-mist-500 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-mist-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 shrink-0 relative">
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                className="w-full pl-5 pr-14 py-3.5 bg-[#0B1A2E]/50 border border-white/10 rounded-xl outline-none focus:bg-[#0B1A2E]/80 focus:border-gold transition-all text-sm text-white placeholder:text-mist-500/30"
                                placeholder="Type your command..."
                            />
                            <button 
                                type="submit" 
                                disabled={loading || !message.trim()} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-gold text-midnight rounded-lg hover:bg-[#D48500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs focus:outline-none shadow-[0_0_15px_rgba(255,183,64,0.2)] cursor-pointer"
                            >
                                <svg className="w-4 h-4 translate-x-px translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="group relative w-[70px] h-[70px] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                    aria-label="Open AI Chat"
                >
                    {/* Atmospheric Glow Ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold/40 via-transparent to-teal-400/40 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
                    
                    {/* The Prismatic Orb */}
                    <div className="relative w-full h-full bg-[#0B1A2E] border border-white/10 rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden group-hover:border-gold/30 transition-all duration-500">
                        {/* Conic Refraction Backdrop */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,183,64,0.05)_50%,transparent_100%)] animate-spin-slow pointer-events-none"></div>
                        
                        {/* Compass Spark Icon */}
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gold relative z-10 transform group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" className="opacity-20" />
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className="animate-pulse" />
                            <path d="M12 8l-1 4 1 4 1-4-1-4z" fill="currentColor" className="drop-shadow-[0_0_8px_rgba(255,183,64,0.6)]" />
                        </svg>

                        {/* Bio-Metric Pulse Status */}
                        <div className="absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-ping"></div>
                    </div>

                    {/* Notification Alert (Hover only) */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] text-midnight font-bold scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg border border-[#0B1A2E]">
                        !
                    </div>
                </button>
            )}
        </div>
    );
}
