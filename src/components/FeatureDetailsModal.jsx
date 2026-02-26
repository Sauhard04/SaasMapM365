import React from 'react';
import { useData } from '../context/DataContext.jsx';
import './FeatureDetailsModal.css';

const getTierStyle = (index, total) => {
    const isLast = index === total - 1 && total > 1;
    if (isLast) return { card: 'tier-3', header: 'tier-header-indigo', badge: 'tier-badge-indigo', icon: 'fa-rocket', itemHover: 'tier-item-indigo' };
    if (index === 1) return { card: 'tier-2', header: 'tier-header-blue', badge: 'tier-badge-blue', icon: 'fa-check-double', itemHover: 'tier-item-blue' };
    return { card: 'tier-1', header: 'tier-header-slate', badge: 'tier-badge-slate', icon: 'fa-check', itemHover: 'tier-item-slate' };
};

const getCapabilityIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('ai') || t.includes('machine learning') || t.includes('automated') || t.includes('predictive')) return 'fa-microchip';
    if (t.includes('threat') || t.includes('phishing') || t.includes('protection') || t.includes('safe') || t.includes('attack')) return 'fa-shield-halved';
    if (t.includes('simulation') || t.includes('training')) return 'fa-user-graduate';
    if (t.includes('audit') || t.includes('investigation') || t.includes('explorer') || t.includes('analytics')) return 'fa-chart-bar';
    if (t.includes('encryption') || t.includes('key')) return 'fa-key';
    if (t.includes('identity') || t.includes('pim') || t.includes('access') || t.includes('conditional')) return 'fa-user-shield';
    if (t.includes('manual') || t.includes('user-driven')) return 'fa-hand-pointer';
    if (t.includes('retention') || t.includes('label')) return 'fa-tag';
    if (t.includes('dlp') || t.includes('data loss')) return 'fa-file-shield';
    if (t.includes('edr') || t.includes('endpoint')) return 'fa-computer';
    if (t.includes('cloud app') || t.includes('casb')) return 'fa-cloud';
    return 'fa-circle-check';
};

const isInherited = (cap) => {
    const t = cap.toLowerCase();
    return t.includes('all plan') || t.includes('all p1') || t.includes('all p2') || t.includes('includes ') || t.includes('base features');
};

const FeatureDetailsModal = ({ feature: propFeature, onClose }) => {
    const { features, plans } = useData();

    // Find the most up-to-date feature from context based on the ID passed
    const feature = propFeature ? features.find(f => f.id === propFeature.id) : null;

    if (!feature) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="modal-badges">
                            <span className="modal-category-badge">{feature.category}</span>
                            {feature.tierComparison && (
                                <span className="modal-tier-badge">
                                    <i className="fas fa-layer-group"></i>
                                    Service Progression
                                </span>
                            )}
                        </div>
                        <h2 className="modal-title">{feature.name}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body custom-scrollbar">
                    <section className="modal-summary">
                        <div className="modal-summary-bar"></div>
                        <h3 className="summary-heading">Core Functional Overview</h3>
                        <p className="summary-text">
                            {feature.description} This capability evolves across tiers, shifting from manual administrative tools to sophisticated, AI-driven automated responses as the license level increases.
                        </p>
                    </section>

                    {feature.tierComparison ? (
                        <section className="modal-tiers">
                            <div className="tier-section-header">
                                <h3 className="tier-section-title">{feature.tierComparison.title}</h3>
                                <div className="tier-section-line"></div>
                            </div>

                            <div className="tier-cards-grid">
                                {feature.tierComparison.tiers.map((tier, idx) => {
                                    const styles = getTierStyle(idx, feature.tierComparison.tiers.length);
                                    const inheritedCaps = tier.capabilities.filter(isInherited);
                                    const uniqueCaps = tier.capabilities.filter((c) => !isInherited(c));

                                    return (
                                        <div key={idx} className={`tier-card ${styles.card}`}>
                                            <div className="tier-step-badge">{idx + 1}</div>

                                            <div className="tier-card-header">
                                                <div>
                                                    <div className={`tier-level-label ${styles.header}`}>M365 Licensing Level {idx + 1}</div>
                                                    <h4 className="tier-name">{tier.tierName}</h4>
                                                </div>
                                                <div className={`tier-icon-box ${styles.badge}`}>
                                                    <i className={`fas ${styles.icon}`}></i>
                                                </div>
                                            </div>

                                            {tier.includedInPlanIds && tier.includedInPlanIds.length > 0 && (
                                                <div className="tier-plans-box">
                                                    <div className="tier-plans-label">
                                                        <i className="fas fa-id-card"></i>
                                                        Entitled Bundles
                                                    </div>
                                                    <div className="tier-plans-list">
                                                        {tier.includedInPlanIds.map((pid) => {
                                                            // Use dynamic plans from context instead of constants
                                                            const plan = plans.find((p) => p.id === pid);
                                                            if (!plan) return null;
                                                            return (
                                                                <div key={pid} className="tier-plan-chip">
                                                                    <div className="tier-plan-dot" style={{ backgroundColor: plan.color }}></div>
                                                                    {plan.name}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {inheritedCaps.length > 0 && (
                                                <div className="tier-inherited">
                                                    <div className={`tier-sub-label ${styles.header}`}>Foundation Components</div>
                                                    <div className="tier-inherited-chips">
                                                        {inheritedCaps.map((cap, i) => (
                                                            <div key={i} className="inherited-chip">
                                                                <i className="fas fa-link"></i>
                                                                {cap}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="tier-unique-caps">
                                                <div className="tier-sub-label tier-header-slate">
                                                    {inheritedCaps.length > 0 ? 'Tier-Specific Enhancements' : 'Complete Feature Set'}
                                                </div>
                                                <ul className="tier-cap-list">
                                                    {uniqueCaps.map((cap, cIdx) => (
                                                        <li key={cIdx} className={`capability-item ${styles.itemHover}`}>
                                                            <div className={`capability-icon-box ${styles.header}`}>
                                                                <i className={`fas ${getCapabilityIcon(cap)}`}></i>
                                                            </div>
                                                            <div>
                                                                <span className="capability-name">{cap}</span>
                                                                <p className="capability-type">Technical Capability</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {idx === feature.tierComparison.tiers.length - 1 && feature.tierComparison.tiers.length > 1 && (
                                                <div className="tier-top-badge-wrap">
                                                    <div className="tier-top-badge">
                                                        <i className="fas fa-crown"></i>
                                                        All-Inclusive Tier
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ) : (
                        <div className="modal-unified">
                            <div className="unified-icon-box">
                                <i className="fas fa-cube"></i>
                            </div>
                            <div>
                                <h4 className="unified-title">Unified Service Model</h4>
                                <p className="unified-desc">
                                    This service is delivered as a standardized, non-tiered capability. Its full technical scope is available universally to all entitled license holders without additional Plan 1 or Plan 2 performance variances.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    {feature.link && (
                        <a href={feature.link} target="_blank" rel="noopener noreferrer" className="modal-doc-link">
                            Open Technical Documentation
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    )}
                    <button onClick={onClose} className="modal-close-btn">Return to Map</button>
                </div>
            </div>
        </div>
    );
};

export default FeatureDetailsModal;
