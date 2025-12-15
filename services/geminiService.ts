import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'mock-key' });

export const analyzeRepairRequest = async (device: string, description: string, images: any[] = []): Promise<string> => {
  if (!process.env.API_KEY) {
    return `AI Diagnosis (Demo Mode): Based on your description of the ${device}${images.length > 0 ? " and the provided images" : ""}, this appears to be a hardware fault. We recommend a full diagnostic by our team. Estimated range: $50 - $200.`;
  }

  try {
    const promptText = `
      You are an expert technician at BLUCELL. 
      Analyze this repair request:
      Device: ${device}
      Problem: ${description}
      ${images.length > 0 ? "Images of the device damage are provided for reference." : ""}
      
      Provide a concise 2-sentence diagnosis and a rough estimated price range for repair.
      Do not promise exact prices, just estimates.
    `;

    const parts = [{ text: promptText }, ...images];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "Unable to generate diagnosis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Diagnosis temporarily unavailable. Our technicians will review manually.";
  }
};

export const generateChatResponse = async (history: string[], newMessage: string): Promise<string> => {
    if (!process.env.API_KEY) return "This is an automated response (Demo Mode). Connecting you to a live agent...";

    try {
        const prompt = `
        You are BLUCELL's AI assistant. 
        Context of conversation: ${history.join('\n')}
        User: ${newMessage}
        
        Respond helpfully and briefly. If they ask about status, tell them to check the dashboard.
        `;
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I'm having trouble understanding. Please contact support.";
    } catch (e) {
        return "System busy. Please try again.";
    }
}