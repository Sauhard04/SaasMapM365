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
    const ai = await getAI();
    if (!ai) return 'Server initialization failed. A valid VITE_GEMINI_API_KEY is not available';

    const systemInstruction = 'You are an expert Microsoft 365 Licensing Consultant. Help users understand M365 plans (E3, E5, Business Premium, etc.). Be concise, accurate, and focus on security. Suggest cost-effective plans.';
    const fullPrompt = `${systemInstruction}\n\nContext: ${context || 'General M365 Licensing'}\n\nUser Question: ${prompt}`;

    const generate = async (modelName) => {
        console.log(`Attempting to generate content with model: ${modelName}`);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
        });
        return response.text;
    };

    try {
        // Try standard flash first
        return await generate('gemini-1.5-flash');
    } catch (error) {
        console.warn('Gemini 1.5 Flash failed, attempting fallback to 2.0 Flash Lite:', error.message);

        try {
            // Fallback to lite model
            return await generate('gemini-2.0-flash-lite-001');
        } catch (fallbackError) {
            console.error('Gemini Fallback Error:', fallbackError);

            try {
                // Final fallback to pro
                return await generate('gemini-pro');
            } catch (finalError) {
                return `The AI assistant is currently unavailable due to high traffic (Rate Limit Exceeded). Please try again in a minute. Details: ${finalError.message}`;
            }
        }
    }
};
