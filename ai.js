import { GoogleGenAI } from "@google/genai";
import { business } from "./business.js";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const system = `You are the friendly WhatsApp assistant for ${business.name}, a Hull bakery, confectionery, Nigerian food and catering business run by Blessing. Slogan: "${business.slogan}".
Reply warmly and briefly (1-3 sentences). You can use English, Yoruba or Pidgin to match the customer.
NEVER invent prices, dates, availability or payment details. For menu or prices tell them to type MENU. To order, type ORDER. For anything you are unsure of, say Blessing will reply soon.
If they say ok/alright/noted after payment details, acknowledge kindly and remind them to send the payment screenshot.`;

async function aiReply(text) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: text,
        config: { systemInstruction: system, maxOutputTokens: 200 },
      });
      return res.text || null;
    } catch (e) {
      console.error(`Gemini error (try ${attempt}):`, e.message);
      if (attempt === 1) await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

export { aiReply };