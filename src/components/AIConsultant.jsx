import React, { useState, useRef, useEffect } from 'react';
import { askLicensingAI } from '../services/geminiService.js';
import { PLANS } from '../constants.js';
import './AIConsultant.css';

const AIConsultant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your M365 Licensing Specialist. Need help picking a plan for your business? Ask me anything!" },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const context = `The user is looking at Microsoft 365 licensing. Available plans include: ${PLANS.map((p) => `${p.name} at ${p.price}`).join(', ')}.`;
        const response = await askLicensingAI(input, context);

        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        setIsLoading(false);
    };

    return (
        <div id="ai-consultant-root" className="chat-widget">
            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <i className="fas fa-robot"></i>
                            <h3>Licensing AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="chat-close-btn">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div ref={scrollRef} className="chat-body custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble ai">
                                <div className="chat-typing">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot delay-1"></div>
                                    <div className="typing-dot delay-2"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-footer">
                        <div className="chat-input-container">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about E3 vs E5..."
                                className="chat-input"
                            />
                            <button onClick={handleSend} disabled={isLoading} className="chat-send-btn">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={`chat-toggle ${isOpen ? 'open' : 'closed'}`}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-dots'}`}></i>
            </button>
        </div>
    );
};

export default AIConsultant;
