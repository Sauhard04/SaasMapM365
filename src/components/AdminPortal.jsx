import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.jsx';
import { CATEGORY_COLORS } from '../constants.js';
import './AdminPortal.css';

const EMPTY_FEATURE = () => ({
    id: `feat-${Date.now()}`,
    name: 'New Service Capability',
    description: 'Provide a clear technical description of the service.',
    category: 'Productivity',
    link: '',
});

const AdminPortal = () => {
    const {
        features, plans, currentUser, allUsers, tenantInfo,
        updateFeature, addFeature, deleteFeature, updatePlan,
        addPlan, deletePlan, resetData, syncTenant,
        authConfig, setAuthConfig,
    } = useData();

    const [activeTab, setActiveTab] = useState('features');
    const [editingFeature, setEditingFeature] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [featurePlanLinks, setFeaturePlanLinks] = useState([]);
    const [selectedTierIndices, setSelectedTierIndices] = useState([]);
    const [bulkInput, setBulkInput] = useState('');
    const [localAuth, setLocalAuth] = useState(authConfig);

    useEffect(() => { setLocalAuth(authConfig); }, [authConfig]);
    useEffect(() => { setIsDirty(!!(editingFeature || editingPlan)); }, [editingFeature, editingPlan]);
    useEffect(() => {
        if (editingFeature) {
            setFeaturePlanLinks(plans.filter((p) => p.features.includes(editingFeature.id)).map((p) => p.id));
            setSelectedTierIndices([]);
        } else {
            setFeaturePlanLinks([]);
        }
    }, [editingFeature, plans]);

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
        return (
            <div className="admin-access-denied">
                <div className="access-denied-icon"><i className="fas fa-lock"></i></div>
                <h2>Access Restricted</h2>
                <p>This sector is reserved for verified administrators only. Please sign in with your Microsoft Entra ID credentials.</p>
            </div>
        );
    }

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => { syncTenant(); setIsSyncing(false); }, 2000);
    };

    const requestConfirm = (config) => setConfirmConfig(config);

    const handleTabSwitch = (tab) => {
        if (isDirty) {
            requestConfirm({
                title: 'Discard Current Edits?',
                message: 'Moving away will lose pending changes in your current editor.',
                actionLabel: 'Proceed',
                variant: 'warning',
                onConfirm: () => { setEditingFeature(null); setEditingPlan(null); setActiveTab(tab); },
            });
        } else {
            setActiveTab(tab);
        }
    };

    const saveAndClosePlanModal = () => {
        if (editingPlan) {
            if (isAddingNew) addPlan(editingPlan); else updatePlan(editingPlan);
            setEditingPlan(null); setIsAddingNew(false);
        }
    };

    const saveAndCloseFeatureModal = () => {
        if (editingFeature) {
            if (isAddingNew) addFeature(editingFeature); else updateFeature(editingFeature);
            plans.forEach((plan) => {
                const shouldBeLinked = featurePlanLinks.includes(plan.id);
                const isCurrentlyLinked = plan.features.includes(editingFeature.id);
                if (shouldBeLinked && !isCurrentlyLinked) updatePlan({ ...plan, features: [...plan.features, editingFeature.id] });
                else if (!shouldBeLinked && isCurrentlyLinked) updatePlan({ ...plan, features: plan.features.filter((fid) => fid !== editingFeature.id) });
            });
            setEditingFeature(null); setIsAddingNew(false);
        }
    };

    const handleClosePlanEditor = () => {
        if (isDirty) {
            requestConfirm({ title: 'Unsaved Changes', message: 'Discard changes?', actionLabel: 'Discard', variant: 'warning', onConfirm: () => { setEditingPlan(null); setIsAddingNew(false); } });
        } else { setEditingPlan(null); setIsAddingNew(false); }
    };

    const handleCloseFeatureEditor = () => {
        if (isDirty) {
            requestConfirm({ title: 'Unsaved Changes', message: 'Discard changes?', actionLabel: 'Discard', variant: 'warning', onConfirm: () => { setEditingFeature(null); setIsAddingNew(false); } });
        } else { setEditingFeature(null); setIsAddingNew(false); }
    };

    const handleToggleFeatureInPlan = (featureId) => {
        if (!editingPlan) return;
        const updated = { ...editingPlan };
        updated.features = updated.features.includes(featureId)
            ? updated.features.filter((id) => id !== featureId)
            : [...updated.features, featureId];
        setEditingPlan(updated);
    };

    const handleTogglePlanInFeature = (planId) => {
        setFeaturePlanLinks((prev) => prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]);
        setIsDirty(true);
    };

    const handleAddTier = () => {
        if (!editingFeature) return;
        const newTier = { tierName: 'New Tier Level', capabilities: [], includedInPlanIds: [] };
        if (editingFeature.tierComparison) {
            setEditingFeature({ ...editingFeature, tierComparison: { ...editingFeature.tierComparison, tiers: [...editingFeature.tierComparison.tiers, newTier] } });
        } else {
            setEditingFeature({ ...editingFeature, tierComparison: { title: `${editingFeature.name} Tier Mapping`, tiers: [newTier] } });
        }
        setIsDirty(true);
    };

    const handleUpdateTier = (idx, updatedTier) => {
        if (!editingFeature?.tierComparison) return;
        const newTiers = [...editingFeature.tierComparison.tiers];
        newTiers[idx] = updatedTier;
        setEditingFeature({ ...editingFeature, tierComparison: { ...editingFeature.tierComparison, tiers: newTiers } });
        setIsDirty(true);
    };

    const handleRemoveTier = (idx) => {
        if (!editingFeature?.tierComparison) return;
        const newTiers = editingFeature.tierComparison.tiers.filter((_, i) => i !== idx);
        setEditingFeature({ ...editingFeature, tierComparison: newTiers.length > 0 ? { ...editingFeature.tierComparison, tiers: newTiers } : undefined });
        setIsDirty(true);
    };

    const handleMoveTier = (idx, direction) => {
        if (!editingFeature?.tierComparison) return;
        const tiers = [...editingFeature.tierComparison.tiers];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= tiers.length) return;
        [tiers[idx], tiers[targetIdx]] = [tiers[targetIdx], tiers[idx]];
        setEditingFeature({ ...editingFeature, tierComparison: { ...editingFeature.tierComparison, tiers } });
        setIsDirty(true);
    };

    const handleToggleTierSelection = (idx) => {
        setSelectedTierIndices((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
    };

    const handleBulkOperation = (type) => {
        if (!editingFeature?.tierComparison || selectedTierIndices.length === 0) return;
        const newCaps = bulkInput.split(',').map((s) => s.trim()).filter(Boolean);
        if (!newCaps.length) return;
        const updatedTiers = editingFeature.tierComparison.tiers.map((tier, idx) => {
            if (!selectedTierIndices.includes(idx)) return tier;
            let caps = [...tier.capabilities];
            if (type === 'ADD') newCaps.forEach((nc) => { if (!caps.some((cc) => cc.toLowerCase() === nc.toLowerCase())) caps.push(nc); });
            else caps = caps.filter((cc) => !newCaps.some((nc) => nc.toLowerCase() === cc.toLowerCase()));
            return { ...tier, capabilities: caps };
        });
        setEditingFeature({ ...editingFeature, tierComparison: { ...editingFeature.tierComparison, tiers: updatedTiers } });
        setBulkInput('');
        setIsDirty(true);
    };

    const filteredFeatures = features.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveAuth = () => { setAuthConfig(localAuth); alert('Auth Configuration Saved.'); };
    const handleCopyRedirectUri = () => { navigator.clipboard.writeText(window.location.origin); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); };
    const handleSyncRedirectToCurrent = () => setLocalAuth({ ...localAuth, redirectUri: window.location.origin });

    const categories = [...new Set(features.map((f) => f.category))];

    return (
        <div className="admin-portal">
            {/* Confirm Modal */}
            {confirmConfig && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-icon"><i className="fas fa-exclamation-triangle"></i></div>
                        <div>
                            <h3 className="confirm-title">{confirmConfig.title}</h3>
                            <p className="confirm-message">{confirmConfig.message}</p>
                        </div>
                        <div className="confirm-actions">
                            <button onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }} className="confirm-btn primary">{confirmConfig.actionLabel}</button>
                            <button onClick={() => setConfirmConfig(null)} className="confirm-btn secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Header */}
            <div className="admin-header">
                <div className="admin-user-info">
                    <div className="admin-avatar-wrap">
                        <img src={currentUser.avatar} className="admin-avatar" alt="User" />
                        <div className="admin-ms-badge"><i className="fab fa-microsoft"></i></div>
                    </div>
                    <div>
                        <h2 className="admin-username">{currentUser.username}</h2>
                        <div className="admin-meta">
                            <span className="admin-job-title">{currentUser.jobTitle}</span>
                            <span className="admin-dot"></span>
                            <span className="admin-tenant-name">{tenantInfo.name}</span>
                        </div>
                    </div>
                </div>

                <div className="admin-header-actions">
                    <div className="sync-status-box">
                        <div className="sync-status-info">
                            <span className="sync-status-label">Entra ID Status</span>
                            <div className="sync-status-row">
                                <div className={`sync-dot ${tenantInfo.syncStatus === 'Healthy' ? 'healthy' : 'error'}`}></div>
                                <span className="sync-status-text">{tenantInfo.syncStatus}</span>
                            </div>
                        </div>
                        <button onClick={handleSync} disabled={isSyncing} className={`sync-btn ${isSyncing ? 'spinning' : ''}`}>
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <button onClick={() => requestConfirm({ title: 'System Reset', message: 'Reverting all configurations to factory defaults. Continue?', actionLabel: 'Revert All', variant: 'danger', onConfirm: resetData })} className="reset-btn">
                        Factory Reset
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {[['features', 'Services'], ['plans', 'Bundles'], ['identity', 'Sync'], ['security', 'Security & Auth']].map(([tab, label]) => (
                    <button key={tab} onClick={() => handleTabSwitch(tab)} className={`admin-tab-btn ${activeTab === tab ? 'active' : ''} ${tab === 'security' && activeTab === tab ? 'danger' : ''}`}>
                        {tab === 'identity' && <i className="fab fa-microsoft"></i>}
                        {tab === 'security' && <i className="fas fa-shield-halved"></i>}
                        {label}
                    </button>
                ))}
            </div>

            <div className="admin-content-card">
                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="admin-tab-content">
                        <h3 className="admin-section-title">Production Entra ID Setup</h3>
                        <p className="admin-section-desc">Connect SaaSMap to your real Microsoft 365 tenant using MSAL.</p>

                        <div className="auth-error-box">
                            <div className="auth-error-header">
                                <i className="fas fa-circle-exclamation"></i>
                                <h4>Fixing AADSTS50011: Redirect URI Mismatch</h4>
                            </div>
                            <p className="auth-error-desc">Ensure the exactly detected URL below is added to your Azure App Registration as a Single-page application (SPA) redirect URI.</p>
                            <div className="auth-uri-row">
                                <div className="auth-uri-display">
                                    <span className="auth-uri-text">{window.location.origin}</span>
                                    <button onClick={handleCopyRedirectUri} className={`auth-copy-btn ${copySuccess ? 'success' : ''}`}>
                                        {copySuccess ? <><i className="fas fa-check"></i> Copied!</> : <><i className="fas fa-copy"></i> Copy URI</>}
                                    </button>
                                </div>
                                <button onClick={handleSyncRedirectToCurrent} className="auth-sync-btn">Sync Local Config</button>
                            </div>
                        </div>

                        <div className="auth-fields-grid">
                            <div className="auth-field">
                                <label>Application (Client) ID</label>
                                <input type="text" placeholder="00000000-0000-0000-0000-000000000000" value={localAuth.clientId} onChange={(e) => setLocalAuth({ ...localAuth, clientId: e.target.value })} className="admin-input" />
                            </div>
                            <div className="auth-field">
                                <label>Directory (Tenant) ID</label>
                                <input type="text" placeholder="00000000-0000-0000-0000-000000000000" value={localAuth.tenantId} onChange={(e) => setLocalAuth({ ...localAuth, tenantId: e.target.value })} className="admin-input" />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Redirect URI</label>
                            <input type="text" value={localAuth.redirectUri} onChange={(e) => setLocalAuth({ ...localAuth, redirectUri: e.target.value })} className="admin-input" />
                        </div>

                        <div className="auth-toggle-row">
                            <div className="auth-toggle-left">
                                <div className={`auth-toggle-icon ${localAuth.isProduction ? 'active' : ''}`}><i className="fas fa-toggle-on"></i></div>
                                <div>
                                    <p className="auth-toggle-title">Enable Production Auth Mode</p>
                                    <p className="auth-toggle-desc">Requires valid Azure configuration to log in.</p>
                                </div>
                            </div>
                            <button onClick={() => setLocalAuth({ ...localAuth, isProduction: !localAuth.isProduction })} className={`auth-mode-btn ${localAuth.isProduction ? 'active' : ''}`}>
                                {localAuth.isProduction ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        <button onClick={handleSaveAuth} className="auth-save-btn">Apply Security Settings</button>
                    </div>
                )}

                {/* Identity Tab */}
                {activeTab === 'identity' && (
                    <div className="admin-tab-content">
                        <div className="identity-grid">
                            <div className="tenant-info-card">
                                <div className="tenant-info-header">
                                    <h4>Verified Tenant</h4>
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="tenant-info-fields">
                                    {[['Organization', tenantInfo.name], ['Primary Domain', tenantInfo.domain], ['Tenant ID', tenantInfo.tenantId]].map(([label, val]) => (
                                        <div key={label} className="tenant-field">
                                            <p className="tenant-field-label">{label}</p>
                                            <p className="tenant-field-value">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="identity-sync-panel">
                                <div className="identity-sync-header">
                                    <h3>Active Directory Synchronization</h3>
                                    <span>Last Sync: {new Date(tenantInfo.lastSync).toLocaleString()}</span>
                                </div>
                                <div className="identity-users-row">
                                    <div className="identity-users-left">
                                        <div className="identity-users-icon"><i className="fas fa-users"></i></div>
                                        <div>
                                            <p className="identity-users-title">Enterprise Users</p>
                                            <p className="identity-users-count">{allUsers.length} Synced Accounts</p>
                                        </div>
                                    </div>
                                    <button className="identity-manage-btn">Manage Directory</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plans Tab */}
                {activeTab === 'plans' && (
                    <div className="admin-tab-content">
                        <div className="plans-tab-header">
                            <div>
                                <h3 className="admin-section-title">License Catalog</h3>
                                <p className="admin-section-desc">Manage pricing, commitments, and feature bundles.</p>
                            </div>
                            <button onClick={() => { setEditingPlan({ id: `custom-${Date.now()}`, name: 'New Custom Plan', type: 'Business', price: '$0.00', priceINR: '₹0', priceAnnual: '$0.00', priceAnnualINR: '₹0', color: '#64748b', description: '', features: [] }); setIsAddingNew(true); }} className="admin-add-btn">
                                <i className="fas fa-plus"></i> Add New License
                            </button>
                        </div>

                        <div className="plans-grid">
                            {plans.map((plan) => (
                                <div key={plan.id} className="plan-admin-card">
                                    <div className="plan-admin-card-top">
                                        <div className="plan-admin-card-left">
                                            <div className="plan-color-dot" style={{ backgroundColor: plan.color }}></div>
                                            <span className="plan-type-badge">{plan.type}</span>
                                        </div>
                                        <button onClick={() => { setEditingPlan(JSON.parse(JSON.stringify(plan))); setIsAddingNew(false); }} className="plan-edit-btn">
                                            <i className="fas fa-pencil"></i>
                                        </button>
                                    </div>
                                    <h4 className="plan-admin-name">{plan.name}</h4>
                                    <div className="plan-pricing-rows">
                                        <div className="plan-pricing-row">
                                            <span className="plan-pricing-label">Monthly</span>
                                            <div className="plan-pricing-values">
                                                <span>{plan.price}</span>
                                                <span className="plan-inr">{plan.priceINR}</span>
                                            </div>
                                        </div>
                                        <div className="plan-pricing-row annual">
                                            <span className="plan-pricing-label">Annual</span>
                                            <div className="plan-pricing-values">
                                                <span>{plan.priceAnnual}</span>
                                                <span className="plan-inr">{plan.priceAnnualINR}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="plan-admin-footer">
                                        <span className="plan-feature-count">{plan.features.length} Features</span>
                                        {plan.id.startsWith('custom-') && (
                                            <button onClick={() => requestConfirm({ title: 'Delete Custom Plan?', message: 'This will permanently remove this license.', actionLabel: 'Delete Plan', variant: 'danger', onConfirm: () => deletePlan(plan.id) })} className="plan-delete-btn">Remove</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="admin-tab-content">
                        <div className="features-tab-header">
                            <div>
                                <h3 className="admin-section-title">Service Catalog</h3>
                                <p className="admin-section-desc">Centralized management for all Microsoft 365 features and services.</p>
                            </div>
                            <div className="features-tab-actions">
                                <div className="admin-search-wrap">
                                    <i className="fas fa-search admin-search-icon"></i>
                                    <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-search-input" />
                                </div>
                                <button onClick={() => { setEditingFeature(EMPTY_FEATURE()); setIsAddingNew(true); }} className="admin-add-btn">
                                    <i className="fas fa-plus"></i> Create Service
                                </button>
                            </div>
                        </div>

                        <div className="features-grid">
                            {filteredFeatures.map((f) => (
                                <div key={f.id} className="feature-admin-card">
                                    <div className="feature-admin-card-top">
                                        <span className={`feature-cat-badge ${CATEGORY_COLORS[f.category] || ''}`}>{f.category}</span>
                                        <button onClick={() => { setEditingFeature(JSON.parse(JSON.stringify(f))); setIsAddingNew(false); }} className="feature-edit-btn">
                                            <i className="fas fa-pencil"></i>
                                        </button>
                                    </div>
                                    <h5 className="feature-admin-name">{f.name}</h5>
                                    <p className="feature-admin-desc">{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Plan Edit Modal */}
            {editingPlan && (
                <div className="overlay-modal">
                    <div className="modal-content custom-scrollbar">
                        <div className="modal-sticky-header">
                            <div className="modal-title-row">
                                <div className="modal-icon-box" style={{ backgroundColor: editingPlan.color }}>
                                    <i className="fas fa-cube"></i>
                                </div>
                                <div>
                                    <h3 className="modal-main-title">Bundle Architect</h3>
                                    <p className="modal-sub-title">Configuring {editingPlan.name}</p>
                                </div>
                            </div>
                            <button onClick={handleClosePlanEditor} className="close-btn"><i className="fas fa-times"></i></button>
                        </div>

                        <div className="plan-editor-grid">
                            <div className="plan-editor-left">
                                <div className="form-group">
                                    <label className="form-label">Bundle Identifier</label>
                                    <input type="text" value={editingPlan.name} onChange={(e) => { setEditingPlan({ ...editingPlan, name: e.target.value }); setIsDirty(true); }} className="form-input" />
                                </div>

                                <div className="pricing-section">
                                    <span className="pricing-section-label">Monthly Commitment Rates</span>
                                    <div className="pricing-grid">
                                        <div>
                                            <label className="form-label">USD Price</label>
                                            <input type="text" value={editingPlan.price} onChange={(e) => { setEditingPlan({ ...editingPlan, price: e.target.value }); setIsDirty(true); }} className="form-input" />
                                        </div>
                                        <div>
                                            <label className="form-label">INR Price</label>
                                            <input type="text" value={editingPlan.priceINR} onChange={(e) => { setEditingPlan({ ...editingPlan, priceINR: e.target.value }); setIsDirty(true); }} className="form-input" />
                                        </div>
                                    </div>
                                    <div className="pricing-divider"></div>
                                    <span className="pricing-section-label annual">Annual Commitment Rates</span>
                                    <div className="pricing-grid">
                                        <div>
                                            <label className="form-label">USD (Year)</label>
                                            <input type="text" value={editingPlan.priceAnnual} onChange={(e) => { setEditingPlan({ ...editingPlan, priceAnnual: e.target.value }); setIsDirty(true); }} className="form-input annual" />
                                        </div>
                                        <div>
                                            <label className="form-label">INR (Year)</label>
                                            <input type="text" value={editingPlan.priceAnnualINR} onChange={(e) => { setEditingPlan({ ...editingPlan, priceAnnualINR: e.target.value }); setIsDirty(true); }} className="form-input annual" />
                                        </div>
                                    </div>
                                </div>

                                <div className="color-type-row">
                                    <div>
                                        <label className="form-label">Accent Color</label>
                                        <input type="color" value={editingPlan.color} onChange={(e) => { setEditingPlan({ ...editingPlan, color: e.target.value }); setIsDirty(true); }} className="color-picker" />
                                    </div>
                                    <div>
                                        <label className="form-label">Plan Category</label>
                                        <div className="plan-type-options">
                                            {['Business', 'Enterprise'].map((type) => (
                                                <div key={type} onClick={() => { setEditingPlan({ ...editingPlan, type }); setIsDirty(true); }} className={`plan-type-option ${editingPlan.type === type ? 'active' : ''}`}>
                                                    <div className={`plan-type-icon ${editingPlan.type === type ? 'active' : ''}`}>
                                                        <i className={`fas ${type === 'Business' ? 'fa-briefcase' : 'fa-building'}`}></i>
                                                    </div>
                                                    <span>{type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="plan-editor-right">
                                <div className="feature-mapping-header">
                                    <h4><i className="fas fa-layer-group"></i> Feature Matrix Mapping</h4>
                                    <span>{editingPlan.features.length} Enabled</span>
                                </div>
                                <div className="feature-mapping-list custom-scrollbar">
                                    {categories.map((cat) => (
                                        <div key={cat} className="feature-mapping-category">
                                            <h4 className="feature-mapping-cat-title">{cat}</h4>
                                            <div className="feature-mapping-items">
                                                {features.filter((f) => f.category === cat).map((f) => {
                                                    const isIncluded = editingPlan.features.includes(f.id);
                                                    return (
                                                        <button key={f.id} onClick={() => { handleToggleFeatureInPlan(f.id); setIsDirty(true); }} className={`feature-toggle-btn ${isIncluded ? 'active' : ''}`}>
                                                            <span>{f.name}</span>
                                                            {isIncluded ? <i className="fas fa-check-circle"></i> : <i className="fas fa-circle-plus"></i>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-actions">
                            <button onClick={saveAndClosePlanModal} className="modal-save-btn">Synchronize Catalog</button>
                            {!isAddingNew && editingPlan.id.startsWith('custom-') && (
                                <button
                                    type="button"
                                    onClick={() => requestConfirm({
                                        title: 'Delete Custom Plan?',
                                        message: 'This will permanently remove this license from the catalog.',
                                        actionLabel: 'Delete Plan',
                                        variant: 'danger',
                                        onConfirm: () => { deletePlan(editingPlan.id); setEditingPlan(null); }
                                    })}
                                    className="modal-delete-btn"
                                >
                                    Delete Plan
                                </button>
                            )}
                            <button onClick={handleClosePlanEditor} className="modal-cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Edit Modal */}
            {editingFeature && (
                <div className="overlay-modal">
                    <div className="modal-content custom-scrollbar">
                        <div className="modal-sticky-header">
                            <div className="modal-title-row">
                                <div className={`modal-icon-box ${CATEGORY_COLORS[editingFeature.category] || ''}`}>
                                    <i className="fas fa-cubes"></i>
                                </div>
                                <div>
                                    <h3 className="modal-main-title">Service Blueprint</h3>
                                    <p className="modal-sub-title">{isAddingNew ? 'Constructing New Feature' : `Refining ${editingFeature.name}`}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseFeatureEditor} className="close-btn"><i className="fas fa-times"></i></button>
                        </div>

                        <div className="feature-editor-grid">
                            {/* Left: Metadata */}
                            <div className="feature-editor-left">
                                <div className="form-group">
                                    <label className="form-label">Service Name</label>
                                    <input type="text" value={editingFeature.name} onChange={(e) => { setEditingFeature({ ...editingFeature, name: e.target.value }); setIsDirty(true); }} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Service Category</label>
                                    <select value={editingFeature.category} onChange={(e) => { setEditingFeature({ ...editingFeature, category: e.target.value }); setIsDirty(true); }} className="form-input">
                                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Documentation URL</label>
                                    <div className="url-input-wrap">
                                        <i className="fas fa-link url-input-icon"></i>
                                        <input type="url" placeholder="https://learn.microsoft.com/..." value={editingFeature.link || ''} onChange={(e) => { setEditingFeature({ ...editingFeature, link: e.target.value }); setIsDirty(true); }} className="form-input url-input" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Marketing Description</label>
                                    <textarea value={editingFeature.description} onChange={(e) => { setEditingFeature({ ...editingFeature, description: e.target.value }); setIsDirty(true); }} className="form-textarea" />
                                </div>
                            </div>

                            {/* Right: Tier Logic */}
                            <div className="feature-editor-right">
                                <div className="tier-editor-header">
                                    <h4><i className="fas fa-layer-group"></i> Tier Progression Logic</h4>
                                    <button onClick={handleAddTier} className="add-tier-btn"><i className="fas fa-plus"></i> Add Level</button>
                                </div>

                                {!editingFeature.tierComparison ? (
                                    <div className="no-tier-placeholder">
                                        <div className="no-tier-icon"><i className="fas fa-stream"></i></div>
                                        <p className="no-tier-title">Standard Service Model</p>
                                        <p className="no-tier-desc">This feature is currently non-tiered. Enable comparison to map Plan 1/Plan 2 variations.</p>
                                        <button onClick={handleAddTier} className="enable-tier-btn">Enable Multi-Tier Mapping</button>
                                    </div>
                                ) : (
                                    <div className="tier-editor-content">
                                        {editingFeature.tierComparison.tiers.length > 1 && (
                                            <div className="bulk-ops-panel">
                                                <div className="bulk-ops-header">
                                                    <div className="bulk-ops-title-row">
                                                        <div className="bulk-ops-icon"><i className="fas fa-screwdriver-wrench"></i></div>
                                                        <div>
                                                            <h5>Bulk Operations Architect</h5>
                                                            <p>Apply changes to {selectedTierIndices.length} targeted tier(s)</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => { const all = editingFeature.tierComparison.tiers.map((_, i) => i); setSelectedTierIndices(selectedTierIndices.length === all.length ? [] : all); }} className="select-all-btn">
                                                        {selectedTierIndices.length === editingFeature.tierComparison.tiers.length ? 'Deselect All' : 'Select All Tiers'}
                                                    </button>
                                                </div>
                                                <div className="bulk-ops-row">
                                                    <input type="text" value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="e.g. Audit Logging, Data Retention, MFA..." className="bulk-input" />
                                                    <div className="bulk-btns">
                                                        <button onClick={() => handleBulkOperation('ADD')} disabled={!selectedTierIndices.length || !bulkInput.trim()} className="bulk-add-btn"><i className="fas fa-plus-circle"></i> Inject</button>
                                                        <button onClick={() => handleBulkOperation('REMOVE')} disabled={!selectedTierIndices.length || !bulkInput.trim()} className="bulk-remove-btn"><i className="fas fa-minus-circle"></i> Prune</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="tier-cards-editor custom-scrollbar">
                                            {editingFeature.tierComparison.tiers.map((tier, tIdx) => {
                                                const isSelected = selectedTierIndices.includes(tIdx);
                                                return (
                                                    <div key={tIdx} className={`tier-editor-card ${isSelected ? 'selected' : ''}`}>
                                                        <div className="tier-card-controls">
                                                            <button onClick={() => handleMoveTier(tIdx, 'up')} disabled={tIdx === 0} className="tier-move-btn"><i className="fas fa-arrow-up"></i></button>
                                                            <button onClick={() => handleMoveTier(tIdx, 'down')} disabled={tIdx === editingFeature.tierComparison.tiers.length - 1} className="tier-move-btn"><i className="fas fa-arrow-down"></i></button>
                                                            <button onClick={() => handleRemoveTier(tIdx)} className="tier-delete-btn"><i className="fas fa-trash-alt"></i></button>
                                                        </div>
                                                        <button onClick={() => handleToggleTierSelection(tIdx)} className={`tier-select-checkbox ${isSelected ? 'active' : ''}`}>
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <div className="tier-editor-fields">
                                                            <label className="form-label">Level {tIdx + 1} Metadata</label>
                                                            <div className="tier-name-row">
                                                                <span className={`tier-num-badge ${isSelected ? 'selected' : ''}`}>{tIdx + 1}</span>
                                                                <input type="text" value={tier.tierName} onChange={(e) => handleUpdateTier(tIdx, { ...tier, tierName: e.target.value })} className="form-input" placeholder="Tier Title (e.g. Premium)" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">Capabilities Inventory</label>
                                                                <textarea value={tier.capabilities.join(', ')} onChange={(e) => handleUpdateTier(tIdx, { ...tier, capabilities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="form-textarea small" placeholder="Feature set for this tier..." />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">Associated Bundles</label>
                                                                <div className="tier-plan-chips">
                                                                    {plans.map((p) => {
                                                                        const isIncluded = tier.includedInPlanIds?.includes(p.id);
                                                                        return (
                                                                            <button key={p.id} onClick={() => { const ids = tier.includedInPlanIds || []; handleUpdateTier(tIdx, { ...tier, includedInPlanIds: isIncluded ? ids.filter((id) => id !== p.id) : [...ids, p.id] }); }} className={`tier-plan-chip ${isIncluded ? 'active' : ''}`}>
                                                                                {p.name}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <button onClick={handleAddTier} className="add-tier-placeholder">
                                                <div className="add-tier-placeholder-icon"><i className="fas fa-plus"></i></div>
                                                <span>Add Tier Stage</span>
                                                <p>Append a new technical level to the service map</p>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer-actions">
                            <button onClick={saveAndCloseFeatureModal} className="modal-save-btn">Commit to Global Catalog</button>
                            {!isAddingNew && (
                                <button
                                    type="button"
                                    onClick={() => requestConfirm({
                                        title: 'Delete Service Capability?',
                                        message: 'This will permanently remove this service from the catalog and all linked bundles in the matrix.',
                                        actionLabel: 'Delete Permanently',
                                        variant: 'danger',
                                        onConfirm: () => { deleteFeature(editingFeature.id); setEditingFeature(null); }
                                    })}
                                    className="modal-delete-btn"
                                >
                                    Delete Service
                                </button>
                            )}
                            <button onClick={handleCloseFeatureEditor} className="modal-cancel-btn">Discard Blueprint</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;
