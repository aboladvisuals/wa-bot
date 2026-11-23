export function getReply(text) {
  const msg = text.trim().toLowerCase();

  if (["hi", "hello", "hey"].includes(msg)) {
    return "Hello! 👋 Thanks for messaging. Reply MENU to see options.";
  }
  if (msg === "menu") {
    return "1. Opening hours\n2. Prices\n3. Talk to a person";
  }
  if (msg === "1") return "We're open Mon–Sat, 9am–6pm.";
  if (msg === "2") return "Prices list coming soon.";
  if (msg === "3") return "Thanks, someone will reply to you shortly.";

  return "Sorry, I didn't get that. Reply MENU to see options.";
}