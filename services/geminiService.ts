
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// The API key is obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRepairRequest = async (device: string, description: string, images: any[] = []): Promise<string> => {
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
      model: 'gemini-3-flash-preview',
      contents: { parts },
    });

    return response.text || "Unable to generate diagnosis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Diagnosis currently unavailable. Please proceed with manual booking or contact support.";
  }
};

export const generateChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const conversationContext = history.map(msg => 
            `${msg.senderId === 'user' || msg.senderId.startsWith('u') ? 'Customer' : 'Support Agent'}: ${msg.text}`
        ).join('\n');

        const prompt = `
        You are 'Blu', the intelligent AI support agent for BLUCELL, a premium tech repair and retail platform.
        
        Your goals:
        1. Assist customers with questions about buying gadgets (phones, drones, etc.) or booking repairs.
        2. Be concise, professional, and friendly.
        3. If a user asks about order/repair status, guide them to their Dashboard.
        
        Current Conversation History:
        ${conversationContext}
        
        Customer's New Message: "${newMessage}"
        
        Reply as Support Agent:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        
        return response.text || "I'm having a little trouble connecting right now. One moment.";
    } catch (e) {
        console.error("Chat Error", e);
        return "Our system is currently busy. Please try again in a moment.";
    }
}
