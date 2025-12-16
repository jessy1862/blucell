import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'mock-key' });

export const analyzeRepairRequest = async (device: string, description: string, images: any[] = []): Promise<string> => {
  // If no API key is set (or using the mock string from initialization), return a simulated response.
  // In a real env, we'd check if the key is valid. For this demo, we assume 'mock-key' means offline mode.
  if (!process.env.API_KEY || process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' === 'mock-key') {
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

export const generateChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!process.env.API_KEY || process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' === 'mock-key') {
         // Simple keyword matching for demo mode
         const lower = newMessage.toLowerCase();
         if (lower.includes('warranty')) return "All BLUCELL repairs come with a 90-day warranty, and new products have a 1-year manufacturer warranty.";
         if (lower.includes('repair')) return "You can book a repair through our 'Repair' page. We offer same-day pickup in select areas.";
         if (lower.includes('track')) return "You can track your order or repair status in your Dashboard.";
         return "Thanks for your message! A human agent will be with you shortly. (AI Demo Mode)";
    }

    try {
        // Format history for the model
        const conversationContext = history.map(msg => 
            `${msg.senderId === 'user' ? 'Customer' : 'Support Agent'}: ${msg.text}`
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