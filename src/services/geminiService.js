// Gemini AI Service
let aiInstance = null;

const getAI = async () => {
    try {
        const { GoogleGenAI } = await import('@google/genai');

        const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
        const processViteKey = window?.process?.env?.VITE_GEMINI_API_KEY;
        const processGeminiKey = window?.process?.env?.GEMINI_API_KEY;
        const processApiKey = window?.process?.env?.API_KEY;

        const apiKey = viteKey || processViteKey || processGeminiKey || processApiKey || '';

        if (!apiKey || apiKey === 'dummy-key') {
            console.error('Gemini API Check: validation failed', { apiKeySource: viteKey ? 'vite' : 'process' });
            return null;
        }

        if (!aiInstance) {
            // Initialize with API version explicitly
            aiInstance = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
        }
        return aiInstance;
    } catch (e) {
        console.error('Failed to initialize GoogleGenAI client:', e);
        return null;
    }
};

export const askLicensingAI = async (prompt, context) => {
    try {
        const ai = await getAI();
        if (!ai) return 'Server initialization failed. A valid VITE_GEMINI_API_KEY is not available';

        const systemInstruction = 'You are an expert Microsoft 365 Licensing Consultant. Help users understand M365 plans (E3, E5, Business Premium, etc.). Be concise, accurate, and focus on security. Suggest cost-effective plans.';
        const fullPrompt = `${systemInstruction}\n\nContext: ${context || 'General M365 Licensing'}\n\nUser Question: ${prompt}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: fullPrompt,
        });

        const text = response.text;
        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);

        // Enhanced Debugging
        try {
            const ai = await getAI();
            if (ai) {
                console.log('Attempting to list available models...');
                const listResp = await ai.models.list();
                console.log('ListModels Full Response:', listResp);

                // Try to find ANY valid model
                if (listResp && listResp.models) {
                    console.log('Found models:', listResp.models.map(m => m.name));
                }
            }
        } catch (listError) {
            console.error('Failed to list models during debug:', listError);
        }

        return `The AI assistant encountered an error. Please verify your API key or try again later. Error details: ${error.message}`;
    }
};
