import "dotenv/config";
import express from "express";
import { sendText } from "./whatsapp.js";
import { getReply } from "./replies.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

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

app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;
  const from = message.from;
  const text = message.text?.body;
  console.log(`Message from ${from}: ${text}`);
  if (text) sendText(from, getReply(text));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));