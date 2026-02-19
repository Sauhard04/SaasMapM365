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

// --- Chat / AI ---
router.post('/chat', async (req, res) => {
    try {
        const { messages, context } = req.body;
        const GROQ_API_KEY = process.env.grok_ai_api;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are the "Meridian M365 Senior Consultant," a highly knowledgeable, friendly, and elaborative expert in Microsoft 365 licensing.

                        **Your Persona:**
                        - You are a trusted advisor, not just a database. Be warm, welcoming, and thorough in your explanations.
                        - When comparing plans, NEVER just give counts. Instead, explain the qualitative difference in value.
                        
                        **Technical Grounding:**
                        - Ground your advice in official 'learn.microsoft.com' documentation.
                        - Use the following real-time data from the Meridian SaaSMap database to guide your specific plan Knowledge:
                        ${JSON.stringify(context)}
                        
                        **Response Structure:**
                        1. **Warm Direct Answer**: Start with a friendly, clear confirmation of the user's query.
                        2. **Detailed Feature Deep-Dive**: Use the actual feature names provided in the context to explain what the user gets. Don't say "E5 has 33 features"; say "E5 includes advanced capabilities like **Defender for Identity**, **Privileged Identity Management (PIM)**, and **Teams Phone** which are missing in E3."
                        3. **Value Comparison**: Explain *why* one might choose a higher tier (e.g., "The move to E5 is typically driven by a need for automated security response and advanced compliance auditing.")
                        4. **Official Guidance**: Conclude with a friendly invitation for more questions and a clickable link to the official Microsoft documentation for the relevant plan.
                        
                        **Formatting:**
                        - Use **bold** for feature names and plan names.
                        - Use bullet points for lists.
                        - Use a professional yet conversational tone.`
                    },
                    ...messages
                ],
                temperature: 0.5,
                max_tokens: 500
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Chat API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
