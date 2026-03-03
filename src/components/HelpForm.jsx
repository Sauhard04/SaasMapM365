import React, { useState } from 'react';
import './HelpForm.css';

const HelpForm = ({ onBack }) => {
    const [result, setResult] = useState("");
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

    const onSubmit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setResult("Sending....");
        const formData = new FormData(event.target);

        // Access key from env
        formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            setStatus('success');
            setResult("Form Submitted Successfully");
            event.target.reset();
        } else {
            console.log("Error", data);
            setStatus('error');
            setResult(data.message);
        }
    };

    return (
        <div className="help-container glass-morphism">
            <div className="help-header">
                <button className="back-btn" onClick={onBack}>
                    <i className="fas fa-arrow-left"></i> Back to Navigator
                </button>
                <div className="help-title-wrap">
                    <h2 className="help-title gradient-text">Support Assistant</h2>
                    <p className="help-subtitle">Need enterprise assistance? Send us your query and we'll get back to you.</p>
                </div>
            </div>

            {status === 'success' ? (
                <div className="success-message">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>Message Received!</h3>
                    <p>Our licensing experts will review your query and contact you shortly.</p>
                    <button className="action-btn" onClick={onBack}>Return to Dashboard</button>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="help-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-icon-wrap">
                                <i className="fas fa-user"></i>
                                <input type="text" id="name" name="name" placeholder="Full Name" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="company">Company Name</label>
                            <div className="input-icon-wrap">
                                <i className="fas fa-building"></i>
                                <input type="text" id="company" name="company" placeholder="Company Name" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-icon-wrap">
                            <i className="fas fa-envelope"></i>
                            <input type="email" id="email" name="email" placeholder="Email Address" required />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="query">Your Query</label>
                        <div className="input-icon-wrap textarea-wrap">
                            <i className="fas fa-envelope-open-text"></i>
                            <textarea id="query" name="query" rows="5" placeholder="Enter your query here..." required></textarea>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                            ) : (
                                <><i className="fas fa-paper-plane"></i> Send Ticket</>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {status === 'error' && (
                <div className="error-alert">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

export default HelpForm;
