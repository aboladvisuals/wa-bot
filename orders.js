import { business } from "./business.js";

const sessions = new Map(); // phone number -> { step, order }

const newRef = () => "WHO-" + Math.floor(1000 + Math.random() * 9000);

export function inOrder(from) {
  return sessions.has(from);
}

export function startOrder(from) {
  sessions.set(from, { step: "item", order: {} });
  return "Lovely! 😊 What would you like to order? (item and quantity)\nType CANCEL any time to stop.";
}

export function handleOrder(from, text) {
  const s = sessions.get(from);
  const t = text.trim();

  if (t.toLowerCase() === "cancel") {
    sessions.delete(from);
    return "No problem, order cancelled. Reply MENU anytime 😊";
  }

  if (s.step === "item") {
    s.order.item = t;
    s.step = "date";
    return "What date and time do you need it?";
  }
  if (s.step === "date") {
    s.order.date = t;
    s.step = "method";
    return "Collection or delivery? (reply COLLECTION or DELIVERY)";
  }
  if (s.step === "method") {
    if (t.toLowerCase().startsWith("del")) {
      s.order.method = "Delivery";
      s.step = "postcode";
      return "What's the delivery postcode?";
    }
    s.order.method = "Collection";
    s.step = "name";
    return "And your name, please?";
  }
  if (s.step === "postcode") {
    s.order.postcode = t.toUpperCase();
    s.step = "name";
    return "And your name, please?";
  }
  if (s.step === "name") {
    s.order.name = t;
    s.order.ref = newRef();
    const o = s.order;
    sessions.delete(from);
    return `Thank you ${o.name}! ❤️ Here's your order:

Ref: ${o.ref}
Item: ${o.item}
Date: ${o.date}
${o.method}${o.postcode ? " – " + o.postcode : ""}

${business.owner} will confirm the total and availability shortly. Then pay by Revolut: ${business.revolut}
Please use ${o.ref} as the reference, then send a screenshot of your payment here 📸`;
  }
}