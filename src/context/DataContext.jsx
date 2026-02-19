import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FEATURES as INITIAL_FEATURES, PLANS as INITIAL_PLANS } from '../constants.js';
import * as msal from '@azure/msal-browser';

const DataContext = createContext(undefined);

const STORAGE_KEYS = {
    FEATURES: 's_v2_features',
    PLANS: 's_v2_plans',
    USERS: 's_v2_users',
    CURR_USER: 's_v2_curr_user',
    TENANT: 's_v2_tenant',
    BILLING: 's_v2_billing',
    AUTH: 's_v2_auth',
    SELECTED_PLANS: 's_v2_selected_plans',
};

const MOCK_TENANT = {
    tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
    name: 'Contoso Electronics',
    domain: 'contoso.com',
    isVerified: true,
    syncStatus: 'Healthy',
    lastSync: new Date().toISOString(),
};

const getInitialAuth = () => ({
    clientId: '',
    tenantId: '',
    redirectUri: window.location.origin,
    isProduction: false,
});

const API_BASE = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api';

export const DataProvider = ({ children }) => {
    const [features, setFeatures] = useState(INITIAL_FEATURES);
    const [plans, setPlans] = useState(INITIAL_PLANS);
    const [tenantInfo, setTenantInfo] = useState(MOCK_TENANT);
    const [billingFrequency, setBillingFrequency] = useState('monthly');
    const [authConfig, setAuthConfig] = useState(getInitialAuth());
    const [selectedPlanIds, setSelectedPlanIds] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.CURR_USER);
        return saved ? JSON.parse(saved) : null;
    });

    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featRes, planRes, configRes, userRes] = await Promise.all([
                    fetch(`${API_BASE}/features`),
                    fetch(`${API_BASE}/plans`),
                    fetch(`${API_BASE}/config`),
                    fetch(`${API_BASE}/users`)
                ]);

                const feats = await featRes.json();
                const pls = await planRes.json();
                const config = await configRes.json();
                const users = await userRes.json();

                if (feats && feats.length) setFeatures(feats);
                if (pls && pls.length) setPlans(pls);
                if (users && users.length) setAllUsers(users);

                if (config) {
                    if (config.auth) setAuthConfig({ ...getInitialAuth(), ...config.auth });
                    if (config.tenant) setTenantInfo(config.tenant);
                    if (config.billingFrequency) setBillingFrequency(config.billingFrequency);
                    if (config.selectedPlanIds) setSelectedPlanIds(config.selectedPlanIds);
                } else {
                    // Initialize default plan selection if no config
                    setSelectedPlanIds(INITIAL_PLANS.length > 2 ? [INITIAL_PLANS[2].id] : INITIAL_PLANS[0] ? [INITIAL_PLANS[0].id] : []);
                }
            } catch (err) {
                console.error('Failed to fetch data from MongoDB:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const msalInstance = useMemo(() => {
        if (!authConfig.isProduction || !authConfig.clientId) return null;
        return new msal.PublicClientApplication({
            auth: {
                clientId: authConfig.clientId,
                authority: `https://login.microsoftonline.com/${authConfig.tenantId || 'common'}`,
                redirectUri: authConfig.redirectUri,
            },
            cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
        });
    }, [authConfig]);

    useEffect(() => { if (msalInstance) msalInstance.initialize(); }, [msalInstance]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURR_USER, JSON.stringify(currentUser)); }, [currentUser]);

    // Data Sync Helpers
    const syncConfig = async (update) => {
        try {
            await fetch(`${API_BASE}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update)
            });
        } catch (err) { console.error('Failed to sync config:', err); }
    };

    const updateFeature = async (updated) => {
        setFeatures(prev => prev.map(f => f.id === updated.id ? JSON.parse(JSON.stringify(updated)) : f));
        try {
            await fetch(`${API_BASE}/features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
        } catch (err) { console.error('Failed to update feature:', err); }
    };

    const addFeature = async (newFeature) => {
        setFeatures(prev => [...prev, newFeature]);
        try {
            await fetch(`${API_BASE}/features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeature)
            });
        } catch (err) { console.error('Failed to add feature:', err); }
    };

    const deleteFeature = async (id) => {
        setFeatures(prev => prev.filter(f => f.id !== id));
        try {
            await fetch(`${API_BASE}/features/${id}`, { method: 'DELETE' });
        } catch (err) { console.error('Failed to delete feature:', err); }
    };

    const updatePlan = async (updated) => {
        setPlans(prev => prev.map(p => p.id === updated.id ? JSON.parse(JSON.stringify(updated)) : p));
        try {
            await fetch(`${API_BASE}/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
        } catch (err) { console.error('Failed to update plan:', err); }
    };

    const addPlan = async (newPlan) => {
        setPlans(prev => [...prev, newPlan]);
        try {
            await fetch(`${API_BASE}/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlan)
            });
        } catch (err) { console.error('Failed to add plan:', err); }
    };

    const deletePlan = async (id) => {
        setPlans(prev => prev.filter(p => p.id !== id));
        try {
            await fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' });
        } catch (err) { console.error('Failed to delete plan:', err); }
    };

    const setBillingFrequencyWithSync = (freq) => {
        setBillingFrequency(freq);
        syncConfig({ billingFrequency: freq });
    };

    const setAuthConfigWithSync = (auth) => {
        setAuthConfig(auth);
        syncConfig({ auth });
    };

    const setSelectedPlanIdsWithSync = (ids) => {
        const val = typeof ids === 'function' ? ids(selectedPlanIds) : ids;
        setSelectedPlanIds(val);
        syncConfig({ selectedPlanIds: val });
    };

    const loginWithEntra = async (requestedRole = 'USER', credentials = null) => {
        if (authConfig.isProduction && msalInstance) {
            try {
                const loginResponse = await msalInstance.loginPopup({ scopes: ['User.Read'] });
                const account = loginResponse.account;
                const entraUser = {
                    id: account.localAccountId,
                    username: account.name || 'Microsoft User',
                    email: account.username,
                    role: 'ADMIN',
                    isApproved: true,
                    jobTitle: 'Production Tenant User',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.username}`,
                    tenantId: account.tenantId,
                };

                setAllUsers(prev => {
                    const exists = prev.find(u => u.email === entraUser.email);
                    if (!exists) {
                        fetch(`${API_BASE}/users`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(entraUser)
                        });
                        return [...prev, entraUser];
                    }
                    return prev;
                });
                setCurrentUser(entraUser);
                const newTenant = { ...tenantInfo, tenantId: account.tenantId, name: 'Production Tenant', syncStatus: 'Healthy' };
                setTenantInfo(newTenant);
                syncConfig({ tenant: newTenant });
            } catch (err) {
                console.error('Entra ID Production Login Error:', err);
                throw err;
            }
            return;
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (credentials) {
                    const user = allUsers.find(u => u.username === credentials.username && u.password === credentials.password);
                    if (user) {
                        setCurrentUser(user);
                        resolve();
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                    return;
                }

                const entraUser = {
                    id: `entra-${Math.random().toString(36).substr(2, 9)}`,
                    username: requestedRole === 'SUPER_ADMIN' ? 'Admin' : 'IT Admin',
                    email: requestedRole === 'SUPER_ADMIN' ? 'admin@meridian.com' : 'itadmin@meridian.com',
                    role: requestedRole,
                    isApproved: true,
                    jobTitle: requestedRole === 'SUPER_ADMIN' ? 'Global Administrator' : 'IT Systems Manager',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${requestedRole}`,
                    entraGroups: requestedRole === 'SUPER_ADMIN' ? ['Global Admins'] : ['IT Admins'],
                    tenantId: tenantInfo.tenantId,
                };

                setAllUsers(prev => {
                    const exists = prev.find(u => u.email === entraUser.email);
                    if (!exists) {
                        fetch(`${API_BASE}/users`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(entraUser)
                        });
                        return [...prev, entraUser];
                    }
                    return prev;
                });
                setCurrentUser(entraUser);
                resolve();
            }, 1000);
        });
    };

    const syncTenant = () => {
        const newTenant = { ...tenantInfo, lastSync: new Date().toISOString(), syncStatus: 'Healthy' };
        setTenantInfo(newTenant);
        syncConfig({ tenant: newTenant });
    };

    const logout = () => { if (authConfig.isProduction && msalInstance) msalInstance.logoutPopup(); setCurrentUser(null); };

    const approveAdmin = async (userId) => {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            try {
                await fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...user, isApproved: true })
                });
            } catch (err) { console.error('Failed to approve user:', err); }
        }
    };

    const addUser = async (user) => {
        setAllUsers(prev => [...prev, user]);
        try {
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
        } catch (err) { console.error('Failed to add user:', err); }
    };

    const deleteUser = async (userId) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        try {
            await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
        } catch (err) { console.error('Failed to delete user:', err); }
    };

    const resetData = async () => {
        try {
            await fetch(`${API_BASE}/reset`, { method: 'POST' });
            window.location.reload(); // Refresh to get seeded data
        } catch (err) { console.error('Failed to reset data:', err); }
    };

    return (
        <DataContext.Provider value={{
            features, plans, currentUser, allUsers, tenantInfo, billingFrequency, setBillingFrequency: setBillingFrequencyWithSync,
            authConfig, setAuthConfig: setAuthConfigWithSync, isLoading,
            updateFeature, addFeature, deleteFeature, updatePlan, addPlan, deletePlan,
            loginWithEntra, logout, approveAdmin, addUser, deleteUser, resetData, syncTenant,
            selectedPlanIds, setSelectedPlanIds: setSelectedPlanIdsWithSync,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
