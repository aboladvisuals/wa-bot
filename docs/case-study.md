# Case study: WHOIAM WhatsApp bot

A WhatsApp ordering and bookings assistant for WHOIAM, Blessing's bakery, confectionery, Nigerian food and catering business in Hull. I built it so the chat stays warm, fast and useful when she cannot reply herself.

## Problem

Blessing runs WHOIAM from Hull — cakes, Nigerian food, small chops and catering for parties, weddings and owambe. Customers already message her on WhatsApp, often in English, Pidgin or Yoruba, and they expect a quick, human reply. When she is baking or delivering, the chat goes quiet, and informal back-and-forth is easy to drop. She needed a presence on WhatsApp that could answer everyday questions, take orders and event enquiries, and only bring her in when a human really had to step in.

## Solution

I built a WhatsApp Cloud API bot that sounds like the business, not like a call centre.

Rule-based flows handle the menu, prices, delivery, payments, orders and catering bookings, so figures and payment details can never be invented. A short-memory OpenAI assistant covers everything else: greetings, banter, and questions in English, Pidgin or Yoruba. Completed orders (`WHO-####`) and event requests (`EVT-####`) are written to a Google Sheet. Payment is upfront by Revolut or bank transfer; customers send a screenshot in the chat and Blessing confirms. If she wants to take over a conversation, she types `#me` to pause the bot and `#bot` to hand it back.

The bot is hosted on Render's free tier and kept awake by UptimeRobot pinging `GET /` every five minutes.

## My role

I designed, built and deployed the project end to end: the Express webhook, Meta Cloud API integration, order and booking flows, the AI voice and safety rules, Google Sheet storage, and production hosting. I also wrote the system prompt, tested real chats, and tightened the replies so they stay short, plain-text and suitable for WhatsApp.

## Build process and key decisions

I started with a thin Express webhook on the WhatsApp Cloud API, then added a numbered menu and the order flow before bringing in any model. That order mattered. Once prices and payment instructions lived in code (`business.js`, `replies.js`, `orders.js`, `bookings.js`), it was safe to let an AI handle the leftover conversation.

The split is deliberate. The model never sets a price, a date, a discount or a bank detail. It mirrors the customer's language, keeps replies to one or two sentences, and only hands off to Blessing for payment confirmation, complaints or a custom quote. Each number keeps the last ten messages, with `max_tokens` at 150 and temperature at 0.8, so the chat stays brief and a little more natural.

I first tried Google Gemini on the free tier. It was a poor fit: 503s and 404s, and stiff replies. I switched to OpenAI `gpt-4o-mini` through the official SDK, rewrote the system prompt around a warm Nigerian WhatsApp voice, and required plain-text URLs so Revolut links no longer arrived as Markdown.

For storage I used a Google Apps Script web app (`doPost` plus a shared secret) instead of a service-account key file. The bot POSTs each order and booking; Blessing can open the sheet like any other spreadsheet. Hosting stayed on Render's free tier, with UptimeRobot to stop the service spinning down.

## Challenges and fixes

**ES module `require` error.** The project is ES modules (`"type": "module"` in `package.json`). An early crash came from CommonJS `require` in that setup. I moved the app onto consistent `import` / `export` and the server started cleanly.

**Webhook signature verification.** Meta signs every `POST /webhook` with `X-Hub-Signature-256`. Express has to see the raw body, not a parsed JSON object, before the HMAC can be checked. I capture `req.rawBody`, sign it with `APP_SECRET`, and compare the hashes with `crypto.timingSafeEqual`, rejecting anything that does not match.

**Gemini 503s and 404s.** Free-tier Gemini was unreliable and the tone was off. Switching to `gpt-4o-mini`, tightening the prompt, and adding a safe fallback when the API errors (the bot sends a short default message instead of failing silently) made the chat stable enough for real testing.

Other smaller fixes followed from live chats: payment links had to be pasted as plain URLs, not Markdown, and image messages needed a dedicated “screenshot received” reply so a payment photo was not ignored.

## Results

I tested the bot with real WhatsApp chats on 27 November 2026 (Europe/London). It held Pidgin and Yoruba banter (including an owambe for 100 guests, with ofada and ata dindin), quoted small-chops prices from the menu rules rather than inventing them, sent the Revolut link as a plain URL, and wrote both a test order and a test booking as new rows in the Sheet. Replies arrived in about a second (logs showed roughly 0.5–1.1s).

I have not published revenue or volume metrics for this project.

## What's next

The bot still runs on a test number. Coexistence — the bot and Blessing's WhatsApp Business app sharing her real number — needs AboladLabs to become a Meta Tech Provider; business verification is pending.

I also want to tighten Yoruba replies (Yoruba in is sometimes answered in Pidgin), persist in-progress sessions so a restart does not reset a mid-flow order, then add automatic payment checks, owner alerts, and a white-label version for other businesses.

## Tech used

Node.js, Express (ES modules), Meta WhatsApp Cloud API, OpenAI `gpt-4o-mini`, Google Sheets with Apps Script, Render, UptimeRobot.

---

Abolade (AboladLabs) — [aboladlabs.com](https://aboladlabs.com) · [hello@aboladlabs.com](mailto:hello@aboladlabs.com)
