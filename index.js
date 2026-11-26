import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import { sendText } from "./whatsapp.js";
import { getReply } from "./replies.js";

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const seen = new Set();
const paused = new Set();

app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

function validSignature(req) {
  const sig = req.get("x-hub-signature-256") || "";
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.APP_SECRET).update(req.rawBody).digest("hex");
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

app.get("/", (req, res) => res.send("OK"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  if (!validSignature(req)) return res.sendStatus(401);
  res.sendStatus(200);
  const change = req.body?.entry?.[0]?.changes?.[0];
  const value = change?.value;

  // Blessing typing in her phone app
  if (change?.field === "smb_message_echoes") {
    const echo = value?.message_echoes?.[0];
    const cmd = echo?.text?.body?.trim().toLowerCase();
    if (cmd === "#me") paused.add(echo.to);
    if (cmd === "#bot") paused.delete(echo.to);
    return;
  }

  const message = value?.messages?.[0];
  if (msg && seen.has(msg.id)) return res.sendStatus(200);
  if (msg) { seen.add(msg.id); if (seen.size > 1000) seen.clear(); }
  if (!message) return;
  const from = message.from;
  if (paused.has(from)) return;
  const text = message.text?.body;
  console.log(`Message from ${from}: ${text}`);

  if (message.type === "image") {
    sendText(from, "Thank you! 📸 Payment screenshot received. Blessing will check and confirm your order shortly ❤️");
  } else if (text) {
    sendText(from, await getReply(from, text));
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
