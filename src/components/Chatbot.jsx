import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext.jsx';
import './Chatbot.css';

const Chatbot = () => {
    const { plans, features, API_BASE } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm your M365 License Assistant. How can I help you compare plans today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Provide relevant context to the AI
            const context = {
                availablePlans: plans.map(p => ({
                    name: p.name,
                    price: p.price,
                    type: p.type,
                    features: p.features.map(fid => features.find(f => f.id === fid)?.name).filter(Boolean)
                })),
                featureDirectory: features.map(f => ({ name: f.name, category: f.category }))
            };

            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })).concat({ role: 'user', content: input }),
                    context
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                setMessages(prev => [...prev, { role: 'bot', content: data.choices[0].message.content }]);
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to my brain right now. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        setMessages([
            { role: 'bot', content: "Hello! I'm your M365 License Assistant. How can I help you compare plans today?" }
        ]);
        setInput('');
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>License Assistant</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="chatbot-status"></div>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Online & Ready</span>
                            </div>
                        </div>
                        <button onClick={handleReset} className="chatbot-reset-btn" title="Reset Conversation">
                            <i className="fas fa-rotate-right"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages custom-scrollbar">
                        {messages.map((msg, idx) => {
                            // Simple formatting for bold, lists, and links
                            const formattedContent = msg.content
                                .split('\n').map((line, i) => {
                                    // Bolding
                                    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                    // Links [text](url)
                                    processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');
                                    // Basic Bullet points
                                    if (processed.trim().startsWith('* ') || processed.trim().startsWith('- ')) {
                                        return `<li style="margin-left: 10px">${processed.trim().substring(2)}</li>`;
                                    }
                                    return processed + '<br/>';
                                }).join('');

                            return (
                                <div
                                    key={idx}
                                    className={`message ${msg.role}`}
                                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                                />
                            );
                        })}
                        {isTyping && (
                            <div className="message bot">
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Ask about M365 licenses..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSend}
                            disabled={isTyping || !input.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}

            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
            </button>
        </div>
    );
};

export default Chatbot;
