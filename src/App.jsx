import React, { useState, useMemo } from 'react';
import PlanSelector from './components/PlanSelector.jsx';
import FeatureMatrix from './components/FeatureMatrix.jsx';
import ComparisonTool from './components/ComparisonTool.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import Chatbot from './components/Chatbot.jsx';
import { DataProvider, useData } from './context/DataContext.jsx';
import './styles/App.css';

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[$,₹]/g, '').trim();
    const match = cleaned.match(/^(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
};

const AppContent = () => {
    const [activeTab, setActiveTab] = useState('map');
    const {
        plans, currentUser, loginWithEntra, logout, tenantInfo,
        billingFrequency, setBillingFrequency,
        selectedPlanIds, setSelectedPlanIds, isLoading
    } = useData();

    const [showLogin, setShowLogin] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const togglePlan = (id) => {
        setSelectedPlanIds((prev) =>
            prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
        );
    };

    const selectedPlans = useMemo(
        () => plans.filter((p) => selectedPlanIds.includes(p.id)),
        [selectedPlanIds, plans]
    );

    const totals = useMemo(() => {
        const usd = selectedPlans.reduce((sum, p) => {
            return sum + parsePrice(billingFrequency === 'monthly' ? p.price : p.priceAnnual);
        }, 0);
        const inr = selectedPlans.reduce((sum, p) => {
            return sum + parsePrice(billingFrequency === 'monthly' ? p.priceINR : p.priceAnnualINR);
        }, 0);
        return { usd, inr };
    }, [selectedPlans, billingFrequency]);

    const uniqueFeaturesCount = new Set(selectedPlans.flatMap((p) => p.features)).size;

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Establishing Connection to Matrix DB...</p>
            </div>
        );
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            await loginWithEntra(null, { username, password });
            setShowLogin(false);
            setActiveTab('admin');
            setUsername('');
            setPassword('');
        } catch (err) {
            setLoginError('Invalid Administrator Credentials');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="app-container">
            {/* ... header and main content ... */}
            {/* I will keep the existing header and main content, just updating the login modal below */}
            <header className="app-header glass-morphism">
                <div className="header-content">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <i className="fas fa-map-marked-alt"></i>
                        </div>
                        <div className="logo-text">
                            <h1 className="logo-title gradient-text">SaaSMap</h1>
                            <p className="logo-subtitle">M365 Navigator</p>
                        </div>
                    </div>

                    <div className="nav-container">
                        <nav className="nav-pill-group">
                            <button onClick={() => setActiveTab('map')} className={`nav-pill ${activeTab === 'map' ? 'active' : ''}`}>
                                Visual Map
                            </button>
                            <button onClick={() => setActiveTab('compare')} className={`nav-pill ${activeTab === 'compare' ? 'active' : ''}`}>
                                Matrix
                            </button>
                            {currentUser && (
                                <button onClick={() => setActiveTab('admin')} className={`nav-pill ${activeTab === 'admin' ? 'active' : ''}`}>
                                    Admin
                                </button>
                            )}
                        </nav>

                        <div className="billing-toggle">
                            <button onClick={() => setBillingFrequency('monthly')} className={`billing-button ${billingFrequency === 'monthly' ? 'active' : ''}`}>
                                Monthly
                            </button>
                            <button onClick={() => setBillingFrequency('annual')} className={`billing-button ${billingFrequency === 'annual' ? 'active' : ''}`}>
                                Annual
                            </button>
                        </div>
                    </div>

                    <div className="header-actions">
                        {currentUser ? (
                            <div className="user-info">
                                <div className="user-text">
                                    <p className="user-name">{currentUser.username}</p>
                                    <p className="user-tenant">{tenantInfo.name}</p>
                                </div>
                                <button onClick={logout} className="logout-btn" title="Logout">
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowLogin(true)} className="sign-in-btn">
                                <i className="fab fa-microsoft"></i>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                {activeTab === 'admin' ? (
                    <AdminPortal />
                ) : activeTab === 'map' ? (
                    <div className="map-view">
                        <div className="hero-section">
                            <div className="hero-content">
                                <div className="hero-top">
                                    <div className="hero-left">
                                        <div className="plan-tags">
                                            {selectedPlans.length > 0 ? (
                                                selectedPlans.map((p) => (
                                                    <span key={p.id} className="plan-tag">{p.name}</span>
                                                ))
                                            ) : (
                                                <span className="no-plans-label">No Plans Selected</span>
                                            )}
                                        </div>
                                        <h2 className="hero-title">
                                            {selectedPlans.length > 1 ? (
                                                <span className="gradient-text">Multi-License Stack</span>
                                            ) : (
                                                selectedPlans[0]?.name || 'Start Exploring'
                                            )}
                                        </h2>
                                    </div>
                                    <div className="hero-right">
                                        <span className="billing-label">Current Commitment</span>
                                        <div className="billing-badge">{billingFrequency} billing</div>
                                    </div>
                                </div>

                                <div className="hero-stats">
                                    <div className="cost-display">
                                        <p className="cost-label">Total Estimated Cost</p>
                                        <div className="cost-values">
                                            <span className="total-usd">${totals.usd.toFixed(2)}</span>
                                            <span className="total-inr">/ ₹{totals.inr.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="features-count">
                                        <p className="cost-label">Combined Capabilities</p>
                                        <div className="cost-values">
                                            <span className="count-number">{uniqueFeaturesCount}</span>
                                            <span className="count-label">Active Maps</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-decoration"></div>
                        </div>

                        <section className="plan-section">
                            <div className="section-header">
                                <div className="section-title-wrap">
                                    <h3 className="section-title">License Selection Portfolio</h3>
                                    <span className="section-hint">Select multiple to stack features</span>
                                </div>
                                {selectedPlanIds.length > 0 && (
                                    <button
                                        onClick={() => setSelectedPlanIds([])}
                                        className="clear-selection-btn"
                                    >
                                        <i className="fas fa-trash-can"></i>
                                        Clear ({selectedPlanIds.length})
                                    </button>
                                )}
                            </div>
                            <PlanSelector selectedPlanIds={selectedPlanIds} onToggle={togglePlan} />
                        </section>

                        <section className="feature-section">
                            <div className="feature-section-header">
                                <h3 className="feature-section-title">Active Feature Map</h3>
                                <div className="feature-section-divider"></div>
                            </div>
                            <FeatureMatrix plans={selectedPlans} />
                        </section>
                    </div>
                ) : (
                    <ComparisonTool />
                )}
            </main>

            {showLogin && (
                <div className="modal-overlay" onClick={() => setShowLogin(false)}>
                    <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="login-modal-header">
                            <div className="ms-icon-box">
                                <i className="fas fa-shield-halved"></i>
                            </div>
                            <h3 className="login-title">Admin Gateway</h3>
                            <p className="login-subtitle">Enter your administrator credentials to access the configuration portal.</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="login-form">
                            <div className="login-field">
                                <label>Username</label>
                                <div className="login-input-wrap">
                                    <i className="fas fa-user"></i>
                                    <input
                                        type="text"
                                        placeholder="Admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="login-field">
                                <label>Password</label>
                                <div className="login-input-wrap">
                                    <i className="fas fa-lock"></i>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {loginError && <p className="login-error-msg">{loginError}</p>}

                            <button type="submit" disabled={isLoggingIn} className="login-btn primary">
                                {isLoggingIn ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-right-to-bracket"></i>}
                                Sign In
                            </button>
                        </form>

                        <button onClick={() => setShowLogin(false)} className="login-cancel">Cancel</button>
                    </div>
                </div>
            )}

            <Chatbot />
        </div>
    );
};

const App = () => (
    <DataProvider>
        <AppContent />
    </DataProvider>
);

export default App;
