import { business } from "./business.js";
import { saveOrder } from "./sheet.js";

const bookings = new Map();
const newRef = () => "EVT-" + Math.floor(1000 + Math.random() * 9000);

export function inBooking(from) { return bookings.has(from); }

export function startBooking(from) {
  bookings.set(from, { step: "type", b: {} });
  return "Yay, let's plan it 🎉 What's the event? (birthday, wedding, owambe, corporate...)\nType CANCEL any time to stop.";
}

export function handleBooking(from, text) {
  const s = bookings.get(from);
  const t = text.trim();
  if (t.toLowerCase() === "cancel") { bookings.delete(from); return "No wahala, booking cancelled. Reply MENU anytime 😊"; }

  if (s.step === "type")   { s.b.type = t;   s.step = "date";   return "Lovely! What date is the event?"; }
  if (s.step === "date")   { s.b.date = t;   s.step = "guests"; return "How many guests are you expecting?"; }
  if (s.step === "guests") { s.b.guests = t; s.step = "food";   return "What food would you like? (jollof, ofada, small chops, cake... anything)"; }
  if (s.step === "food")   { s.b.food = t;   s.step = "place";  return "Where is the event? (postcode or venue)"; }
  if (s.step === "place")  { s.b.place = t;  s.step = "name";   return "And your name, please?"; }
  if (s.step === "name") {
    s.b.name = t; s.b.ref = newRef();
    const b = s.b;
    bookings.delete(from);
    saveOrder({ phone: from, ref: b.ref, name: b.name, item: `EVENT: ${b.type} | ${b.guests} guests | ${b.food}`, date: b.date, method: "Catering", postcode: b.place });
    return `Thank you ${b.name}! ❤️ Booking request received:

Ref: ${b.ref}
Event: ${b.type}
Date: ${b.date}
Guests: ${b.guests}
Food: ${b.food}
Venue: ${b.place}

${business.owner} will message you with a quote shortly 🙏`;
  }
}