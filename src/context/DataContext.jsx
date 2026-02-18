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

export const DataProvider = ({ children }) => {
    const [features, setFeatures] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.FEATURES);
        return saved ? JSON.parse(saved) : INITIAL_FEATURES;
    });

    const [plans, setPlans] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
        return saved ? JSON.parse(saved) : INITIAL_PLANS;
    });

    const [tenantInfo, setTenantInfo] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.TENANT);
        return saved ? JSON.parse(saved) : MOCK_TENANT;
    });

    const [billingFrequency, setBillingFrequency] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.BILLING) || 'monthly';
    });

    const [authConfig, setAuthConfig] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed.redirectUri) parsed.redirectUri = window.location.origin;
            return parsed;
        }
        return getInitialAuth();
    });

    const [allUsers, setAllUsers] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.USERS);
        const defaultUsers = [
            {
                id: 'entra-1',
                username: 'Megan Bowen',
                email: 'meganb@contoso.com',
                role: 'SUPER_ADMIN',
                isApproved: true,
                jobTitle: 'Global Administrator',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Megan',
                entraGroups: ['Global Admins', 'IT Infrastructure'],
                tenantId: MOCK_TENANT.tenantId,
            },
        ];
        return saved ? JSON.parse(saved) : defaultUsers;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.CURR_USER);
        return saved ? JSON.parse(saved) : null;
    });

    const [selectedPlanIds, setSelectedPlanIds] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PLANS);
        if (saved) return JSON.parse(saved);
        const initialPlans = INITIAL_PLANS;
        return initialPlans.length > 2 ? [initialPlans[2].id] : initialPlans[0] ? [initialPlans[0].id] : [];
    });

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
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(features)); }, [features]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans)); }, [plans]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers)); }, [allUsers]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURR_USER, JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(tenantInfo)); }, [tenantInfo]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.BILLING, billingFrequency); }, [billingFrequency]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authConfig)); }, [authConfig]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SELECTED_PLANS, JSON.stringify(selectedPlanIds)); }, [selectedPlanIds]);

    const updateFeature = (updated) => setFeatures(prev => prev.map(f => f.id === updated.id ? JSON.parse(JSON.stringify(updated)) : f));
    const addFeature = (newFeature) => setFeatures(prev => [...prev, newFeature]);
    const deleteFeature = (id) => setFeatures(prev => prev.filter(f => f.id !== id));
    const updatePlan = (updated) => setPlans(prev => prev.map(p => p.id === updated.id ? JSON.parse(JSON.stringify(updated)) : p));
    const addPlan = (newPlan) => setPlans(prev => [...prev, newPlan]);
    const deletePlan = (id) => setPlans(prev => prev.filter(p => p.id !== id));

    const loginWithEntra = async (requestedRole = 'USER') => {
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
                setAllUsers(prev => prev.find(u => u.email === entraUser.email) ? prev : [...prev, entraUser]);
                setCurrentUser(entraUser);
                setTenantInfo(prev => ({ ...prev, tenantId: account.tenantId, name: 'Production Tenant', syncStatus: 'Healthy' }));
            } catch (err) {
                console.error('Entra ID Production Login Error:', err);
                throw err;
            }
            return;
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const entraUser = {
                    id: `entra-${Math.random().toString(36).substr(2, 9)}`,
                    username: requestedRole === 'SUPER_ADMIN' ? 'Megan Bowen' : 'Adele Vance',
                    email: requestedRole === 'SUPER_ADMIN' ? 'meganb@contoso.com' : 'adelev@contoso.com',
                    role: requestedRole,
                    isApproved: true,
                    jobTitle: requestedRole === 'SUPER_ADMIN' ? 'Global Administrator' : 'IT Compliance Officer',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${requestedRole}`,
                    entraGroups: requestedRole === 'SUPER_ADMIN' ? ['Global Admins'] : ['Compliance Admins'],
                    tenantId: tenantInfo.tenantId,
                };
                setAllUsers(prev => prev.find(u => u.email === entraUser.email) ? prev : [...prev, entraUser]);
                setCurrentUser(entraUser);
                resolve();
            }, 1500);
        });
    };

    const syncTenant = () => setTenantInfo(prev => ({ ...prev, lastSync: new Date().toISOString(), syncStatus: 'Healthy' }));
    const logout = () => { if (authConfig.isProduction && msalInstance) msalInstance.logoutPopup(); setCurrentUser(null); };
    const approveAdmin = (userId) => setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
    const deleteUser = (userId) => setAllUsers(prev => prev.filter(u => u.id !== userId));
    const resetData = () => { setFeatures(INITIAL_FEATURES); setPlans(INITIAL_PLANS); setAuthConfig(getInitialAuth()); };

    return (
        <DataContext.Provider value={{
            features, plans, currentUser, allUsers, tenantInfo, billingFrequency, setBillingFrequency,
            authConfig, setAuthConfig,
            updateFeature, addFeature, deleteFeature, updatePlan, addPlan, deletePlan,
            loginWithEntra, logout, approveAdmin, deleteUser, resetData, syncTenant,
            selectedPlanIds, setSelectedPlanIds,
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
