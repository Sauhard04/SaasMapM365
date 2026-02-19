import express from 'express';
const router = express.Router();
import Feature from '../models/Feature.js';
import Plan from '../models/Plan.js';
import Configuration from '../models/Configuration.js';
import User from '../models/User.js';
import { FEATURES, PLANS, USERS } from '../defaults.js';

// --- Features ---
router.get('/features', async (req, res) => {
    try {
        const features = await Feature.find();
        res.json(features);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/features', async (req, res) => {
    try {
        const feature = req.body;
        const result = await Feature.findOneAndUpdate({ id: feature.id }, feature, { upsert: true, new: true });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/features/:id', async (req, res) => {
    try {
        await Feature.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Plans ---
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/plans', async (req, res) => {
    try {
        const plan = req.body;
        const result = await Plan.findOneAndUpdate({ id: plan.id }, plan, { upsert: true, new: true });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/plans/:id', async (req, res) => {
    try {
        await Plan.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Configuration (Auth, Tenant, Billing, SelectedPlans) ---
router.get('/config', async (req, res) => {
    try {
        let config = await Configuration.findOne({ key: 'global' });
        if (!config) {
            config = await Configuration.create({ key: 'global' });
        }
        res.json(config);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/config', async (req, res) => {
    try {
        const update = req.body;
        const config = await Configuration.findOneAndUpdate({ key: 'global' }, update, { upsert: true, new: true });
        res.json(config);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Users ---
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const result = await User.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Reset / Seed ---
router.post('/reset', async (req, res) => {
    try {
        await Feature.deleteMany({});
        await Plan.deleteMany({});
        await Configuration.deleteMany({});
        await User.deleteMany({});

        await Feature.insertMany(FEATURES);
        await Plan.insertMany(PLANS);
        await User.insertMany(USERS);
        // Config will be re-created on first access with defaults defined in Schema

        res.json({ success: true, message: 'Factory reset complete' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
