import React from 'react';
import './LegalPages.css';

const PrivacyPolicy = ({ onBack }) => {
    return (
        <div className="legal-page">
            <div className="legal-page-container">
                <button className="legal-back-btn" onClick={onBack}>
                    <i className="fas fa-arrow-left"></i>
                    Back to Home
                </button>

                <div className="legal-card glass-morphism">
                    <div className="legal-header">
                        <div className="legal-icon-box">
                            <i className="fas fa-shield-halved"></i>
                        </div>
                        <h1 className="legal-title">Privacy Policy</h1>
                        <p className="legal-updated">Last updated: 12 March 2026</p>
                    </div>

                    <div className="legal-body">
                        <section className="legal-section">
                            <h2 className="legal-section-number">1</h2>
                            <div className="legal-section-content">
                                <h3>Overview</h3>
                                <p>
                                    This Privacy Policy explains how Meridian Solutions Private Limited ("Meridian") collects, uses, and protects personal data when you use{' '}
                                    <a href="https://license.onmeridian.com" target="_blank" rel="noopener noreferrer">
                                        license.onmeridian.com
                                    </a>.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">2</h2>
                            <div className="legal-section-content">
                                <h3>Data Fiduciary / Controller</h3>
                                <div className="legal-address-block">
                                    <p className="legal-company-name">Meridian Solutions Private Limited</p>
                                    <p>Tower B, Office No 1103 & 1104, 11th Floor,</p>
                                    <p>Spaze IT Tech Park, Sohna Road,</p>
                                    <p>Gurugram, Haryana, India</p>
                                    <p className="legal-phone">
                                        <i className="fas fa-phone"></i>
                                        1800‑102‑2150
                                    </p>
                                </div>
                                <p className="legal-contact-label">Official Contact (Support, Privacy & Grievance):</p>
                                <a href="mailto:techsupport@onmeridian.com" className="legal-email">
                                    <i className="fas fa-envelope"></i>
                                    techsupport@onmeridian.com
                                </a>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">3</h2>
                            <div className="legal-section-content">
                                <h3>Information We Collect</h3>
                                <ul>
                                    <li>Business contact information (name, email, phone, organization)</li>
                                    <li>Licensing‑related inputs and requests</li>
                                    <li>Support communications</li>
                                    <li>Technical usage data (IP address, browser, timestamps)</li>
                                </ul>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">4</h2>
                            <div className="legal-section-content">
                                <h3>Purpose of Processing</h3>
                                <ul>
                                    <li>Operate and secure the Platform</li>
                                    <li>Process licensing and support requests</li>
                                    <li>Improve service quality and reliability</li>
                                    <li>Meet legal and regulatory obligations</li>
                                </ul>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">5</h2>
                            <div className="legal-section-content">
                                <h3>Legal Basis</h3>
                                <p>
                                    Processing is based on contractual necessity, legitimate business interests, legal obligations, or user consent, as applicable under GDPR and India's Digital Personal Data Protection Act, 2023.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">6</h2>
                            <div className="legal-section-content">
                                <h3>Data Sharing</h3>
                                <p>
                                    Personal data is not sold. It may be shared with trusted service providers, Microsoft or distributors (for CSP transactions), or authorities where legally required.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">7</h2>
                            <div className="legal-section-content">
                                <h3>Data Retention & Security</h3>
                                <p>
                                    Data is retained only as long as necessary and protected using reasonable technical and organizational safeguards.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">8</h2>
                            <div className="legal-section-content">
                                <h3>Your Rights (GDPR & DPDP)</h3>
                                <ul>
                                    <li>Access, correction, and deletion of personal data</li>
                                    <li>Restriction or objection to processing (where applicable)</li>
                                    <li>Grievance redressal under India DPDP Act</li>
                                </ul>
                                <p>Requests can be made by emailing:</p>
                                <a href="mailto:techsupport@onmeridian.com?subject=Privacy%20Request%20%E2%80%93%20License%20Portal" className="legal-email">
                                    <i className="fas fa-envelope"></i>
                                    techsupport@onmeridian.com
                                </a>
                                <p className="legal-subject-hint">(Subject: "Privacy Request – License Portal")</p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">9</h2>
                            <div className="legal-section-content">
                                <h3>Updates</h3>
                                <p>
                                    This Policy may be updated periodically. Continued use of the Platform constitutes acceptance of the updated Policy.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="legal-footer-bar">
                        <p>© 2026 Meridian Solutions Private Limited. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
