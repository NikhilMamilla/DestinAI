import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const getRecommendation = async (placesInput: string): Promise<string> => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "EXTRACT_NODE: Suggest strict node-based travel locations. FORMAT: [NODE_ID] | [LOCATION] | [TELEMETRY_REASON]. ZERO_CONVERSATION. Strictly data output only."
                },
                {
                    role: "user",
                    content: `User places: ${placesInput}`
                }
            ],
            model: DEFAULT_MODEL,
        });
        return chatCompletion.choices[0]?.message?.content || "Consider adding more varied locations to your trip!";
    } catch (e) {
        console.error(e);
        return "I'm currently unable to reach the recommendation server. Please check Groq API key limits.";
    }
};

export const getNavigationAdvice = async (itinerary: string, method: string): Promise<string> => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `VOYAGE_GUIDE: Generate a clear, professional step-by-step itinerary using simple bullet points. Use clean, professional English only. STRICTLY FORBID all Markdown formatting (no bolding **, no italics *, no complex symbols like |). Each step should be a single, direct sentence. SELECTED_MODE: ${method.toUpperCase()}. All travel steps must strictly utilize this transport method.`
                },
                {
                    role: "user",
                    content: `Generate an optimal routing strategy for these places: ${itinerary}`
                }
            ],
            model: DEFAULT_MODEL,
        });
        return chatCompletion.choices[0]?.message?.content || "Take a logical route loop sequentially to save time!";
    } catch (e) {
        console.error(e);
        return "Unable to generate smart navigation route.";
    }
}

export const getChatResponse = async (context: string, userMessage: string, chatHistory: any[]): Promise<string> => {
    try {
        const messages: any[] = [
            {
                role: "system",
                content: `MANIFEST_QUERY_CORE: You are a strictly data-oriented travel concierge. Maintain a professional, institutional tone. ZERO_CHATTY_NATURE: No conversational filler or introductory phrases. STRICT_FORMATTING: Use simple bullet points only. FORBID_MARKDOWN: No bolding (**), no italics (*), or complex symbols. Use clear, professional English. Each point must be a single direct sentence. Context: ${context}.`
            },
            ...chatHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            {
                role: "user",
                content: userMessage
            }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: DEFAULT_MODEL,
        });
        return chatCompletion.choices[0]?.message?.content || "I'm here to help!";
    } catch (e) {
        console.error(e);
        return "Sorry, I'm having connection issues.";
    }
}
