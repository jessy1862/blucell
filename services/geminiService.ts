
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize with the environment variable directly.
// The app assumes the API key is present for full functionality.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

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

    // Construct the parts array correctly for the API
    // images array is expected to contain objects like { inlineData: { data: '...', mimeType: '...' } }
    const parts = [{ text: promptText }, ...images];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
        // Format history for the model
        const conversationContext = history.map(msg => 
            `${msg.senderId === 'user' || msg.senderId.startsWith('u') ? 'Customer' : 'Support Agent'}: ${msg.text}`
        ).join('\n');

        const prompt = `
        You are 'Blu', the intelligent AI support agent for BLUCELL, a premium tech repair and retail platform.
        
        Your goals:
        1. Assist customers with questions about buying gadgets (phones, drones, etc.) or booking repairs.
        2. Be concise, professional, and friendly.
        3. If a user asks about order/repair status, guide them to their Dashboard.
        4. If you can't answer, apologize and say a human agent will review the chat.
        
        Current Conversation History:
        ${conversationContext}
        
        Customer's New Message: "${newMessage}"
        
        Reply as Support Agent:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text || "I'm having a little trouble connecting right now. One moment.";
    } catch (e) {
        console.error("Chat Error", e);
        return "Our system is currently busy. Please try again in a moment.";
    }
}
