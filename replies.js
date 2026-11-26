import { business } from "./business.js";
import { inOrder, startOrder, handleOrder } from "./orders.js";

const list = (items) => items.map((i) => `• ${i}`).join("\n");
import { aiReply } from "./ai.js";
const MENU = `Welcome to ${business.name} 🍰🍲
${business.slogan}

Reply with a number:
1. Cakes & cupcakes
2. Nigerian food & soups
3. Small chops
4. Delivery & collection
5. How to order & pay
6. Talk to ${business.owner}`;

export async function getReply(from, text) {
  const t = text.toLowerCase().trim();
    if (inOrder(from)) return handleOrder(from, text);
  if (t === "order" || t.includes("i want to order") || t.includes("place order")) return startOrder(from);

  // Friendly chat (friends & family)
  if (/(thank you|thanks|thank u|tnx|e se)/.test(t)) return "You're welcome! ❤️ Anything else, just reply MENU.";
  if (/(how far|how are you|how you dey|good morning|good afternoon|good evening|god bless|amen)/.test(t)) {
    return `Hello! 😊 Thank you, we're doing well. Hope you're good too ❤️\nIf you need anything from ${business.name}, just reply MENU.`;
  }

  if (/^(hi|hello|hey|menu|start)$/.test(t)) return MENU;

  if (t === "1" || t.includes("cake")) return `🎂 Cakes\n${list(business.menu.cakes)}\n\nCustom cakes: book 7 days ahead. Wedding cakes: 3–4 weeks.`;
  if (t === "2" || t.includes("jollof") || t.includes("soup") || t.includes("food")) return `🍲 Nigerian food\n${list(business.menu.food)}\n\nPlease allow 24–48 hours. Spice: moderate, or as you like. Meat is not halal.`;
  if (t === "3" || t.includes("small chops") || t.includes("puff")) return `🥟 Small chops\n${list(business.menu.smallchops)}`;
  if (t === "4" || t.includes("deliver") || t.includes("collect")) return `🚗 Delivery & collection\n${list(business.delivery)}`;
  if (t === "5" || t.includes("pay") || t.includes("order")) return `📝 Reply order to start, or send:\n• Item(s) and quantity\n• Date and time needed\n• Collection or delivery (with postcode)\n\nFull payment confirms your order.\nPay by Revolut: ${business.revolut}\nBank transfer details available on request.`;
  if (t === "6" || t.includes("blessing") || t.includes("person")) return `No problem 😊 ${business.owner} will reply to you personally soon.`;

  return (await aiReply(text)) || "Sorry, I didn't catch that 🙏 Type MENU to see options, or Blessing will reply soon.";
}