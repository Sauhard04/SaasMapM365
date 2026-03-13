import React from 'react';
import './LegalPages.css';

const TermsAndConditions = ({ onBack }) => {
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
                            <i className="fas fa-file-contract"></i>
                        </div>
                        <h1 className="legal-title">Terms & Conditions</h1>
                        <p className="legal-updated">Last updated: 12 March 2026</p>
                    </div>

                    <div className="legal-body">
                        <section className="legal-section">
                            <h2 className="legal-section-number">1</h2>
                            <div className="legal-section-content">
                                <h3>Introduction</h3>
                                <p>
                                    These Terms & Conditions govern access to and use of{' '}
                                    <a href="https://license.onmeridian.com" target="_blank" rel="noopener noreferrer">
                                        license.onmeridian.com
                                    </a>{' '}
                                    (the "Platform"), operated by Meridian Solutions Private Limited ("Meridian"). By using the Platform, you agree to these Terms.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">2</h2>
                            <div className="legal-section-content">
                                <h3>Platform Purpose</h3>
                                <p>
                                    The Platform provides informational tools and workflows related to Microsoft and cloud licensing requests, comparisons, and coordination. The Platform is intended for business and enterprise users only.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">3</h2>
                            <div className="legal-section-content">
                                <h3>Important Disclaimer (Accuracy & Finality)</h3>
                                <ul>
                                    <li>Information displayed on this Platform may include estimates, comparisons, recommendations, or inputs based on customer‑provided data.</li>
                                    <li>The information may not represent final, complete, or contractually binding data.</li>
                                    <li>Meridian does not guarantee the accuracy, completeness, or current validity of information shown on the Platform.</li>
                                    <li>Final licensing terms, quantities, pricing, and entitlements are governed solely by Microsoft agreements and official confirmations.</li>
                                    <li>Meridian shall not be responsible for decisions made based on information presented on this Platform.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">4</h2>
                            <div className="legal-section-content">
                                <h3>Microsoft CSP & Customer Agreements</h3>
                                <p>
                                    Microsoft products and services are licensed under Microsoft's own agreements (e.g., Microsoft Customer Agreement). Where Meridian acts as a Cloud Solution Provider (CSP), customers must accept the applicable Microsoft agreements prior to order fulfillment.
                                </p>
                                <p>
                                    Certain subscriptions may be non‑cancellable or subject to limited cancellation windows under Microsoft commercial rules.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">5</h2>
                            <div className="legal-section-content">
                                <h3>Access & Security</h3>
                                <p>
                                    Users are responsible for maintaining the confidentiality of their credentials and for all activities performed under their access. Unauthorized use is prohibited.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">6</h2>
                            <div className="legal-section-content">
                                <h3>Intellectual Property</h3>
                                <p>
                                    All content, workflows, and branding on this Platform are the intellectual property of Meridian or its licensors. No rights are granted except for permitted business use.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">7</h2>
                            <div className="legal-section-content">
                                <h3>Limitation of Liability</h3>
                                <p>
                                    To the maximum extent permitted by law, Meridian shall not be liable for any indirect, incidental, consequential, or business losses arising from use of the Platform.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">8</h2>
                            <div className="legal-section-content">
                                <h3>Governing Law</h3>
                                <p>
                                    These Terms are governed by the laws of India. Courts in Gurugram, Haryana shall have exclusive jurisdiction.
                                </p>
                            </div>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-section-number">9</h2>
                            <div className="legal-section-content">
                                <h3>Contact</h3>
                                <p>For support, licensing, legal, or privacy‑related queries:</p>
                                <a href="mailto:techsupport@onmeridian.com" className="legal-email">
                                    <i className="fas fa-envelope"></i>
                                    techsupport@onmeridian.com
                                </a>
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

export default TermsAndConditions;
