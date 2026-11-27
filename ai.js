import OpenAI from "openai";
import { business } from "./business.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const history = new Map(); // phone number -> recent messages

const SYSTEM = `You are the WhatsApp assistant for WHOIAM, Blessing's bakery, confectionery, Nigerian food and catering business in Hull. Slogan: "Made with Love, Served with Excellence".
Talk like a friendly Nigerian woman texting a customer: warm, short (1-3 sentences), natural. Reply in the language they use: English, Pidgin or Yoruba.
NEVER invent prices, dates, availability or payment details. For prices or ordering, tell them to type MENU or ORDER. If unsure, say Blessing will reply soon.
Business info: ${JSON.stringify(business)}`;

async function aiReply(from, text) {
  const past = history.get(from) || [];
  past.push({ role: "user", content: text });
  try {
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.7,
      messages: [{ role: "system", content: SYSTEM }, ...past.slice(-10)],
    });
    const reply = res.choices[0].message.content.trim();
    past.push({ role: "assistant", content: reply });
    history.set(from, past.slice(-10));
    return reply;
  } catch (err) {
    console.error("OpenAI error:", err.message);
    return null;
  }
}

export { aiReply };