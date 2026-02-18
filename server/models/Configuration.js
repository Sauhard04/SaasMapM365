const mongoose = require('mongoose');

const AuthConfigSchema = new mongoose.Schema({
    clientId: { type: String, default: '' },
    tenantId: { type: String, default: '' },
    redirectUri: { type: String, default: '' },
    isProduction: { type: Boolean, default: false },
}, { _id: false });

const TenantInfoSchema = new mongoose.Schema({
    tenantId: { type: String, default: '72f988bf-86f1-41af-91ab-2d7cd011db47' },
    name: { type: String, default: 'Contoso Electronics' },
    domain: { type: String, default: 'contoso.com' },
    isVerified: { type: Boolean, default: true },
    syncStatus: { type: String, default: 'Healthy' },
    lastSync: { type: Date, default: Date.now },
}, { _id: false });

const ConfigurationSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'global' }, // Using 'global' key for singleton
    auth: { type: AuthConfigSchema, default: {} },
    tenant: { type: TenantInfoSchema, default: {} },
    billingFrequency: { type: String, default: 'monthly' },
    selectedPlanIds: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Configuration', ConfigurationSchema);
