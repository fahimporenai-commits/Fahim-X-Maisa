// commands/bby.js
const axios = require("axios");

// সহজে সেট করতে চাইলে নিচের placeholder-এর জায়গায় নতুন Groq key বসান।
// নিরাপত্তা: এই ফাইল public GitHub-এ দেবেন না; সম্ভব হলে Environment Variables ব্যবহার করুন।
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Per-chat + per-user chat history; process restart হলে memory reset হবে।
const histories = global.fahimAIHistories || new Map();
global.fahimAIHistories = histories;

// বটের নিজের পাঠানো message ID মনে রাখি, যাতে অন্যের quoted message-এ উত্তর না দেয়।
const botMessageIds = global.fahimAIBotMessageIds || new Map();
global.fahimAIBotMessageIds = botMessageIds;
const MAX_HISTORY_MESSAGES = 16;
const MAX_REMEMBERED_IDS = 5000;
const CHANNEL_URL = "https://whatsapp.com/channel/0029VbDLv0h1dAw6SRSiPr30";

const systemPrompt = `তুমি Nipa—Fahim BBZ-এর WhatsApp-এ কথা বলা একজন বন্ধুসুলভ, চটপটে ও বুদ্ধিমান AI সহকারী।

ভাষা ও ভঙ্গি:
- সবসময় বাংলায় উত্তর দেবে। ব্যবহারকারী Banglish বা ইংরেজিতে লিখলেও উত্তর বাংলাতেই দেবে; প্রয়োজন হলে প্রযুক্তিগত শব্দ বা code-এর নাম মূল ভাষায় রাখতে পারো।
- সহজ, স্বাভাবিক ও কথোপকথনের মতো বাংলা ব্যবহার করবে। অপ্রয়োজনীয় কঠিন/বইয়ের ভাষা এড়িয়ে চলবে।
- বন্ধুর মতো উষ্ণ, আন্তরিক, সম্মানজনক ও ইতিবাচক থাকবে। হালকা রসিকতা মানালে করতে পারো, তবে কাউকে অপমান, গালি বা বিব্রত করবে না।
- চটপটে উত্তর দেবে: সাধারণ প্রশ্নে আগে সরাসরি উত্তর, তারপর দরকার হলে ছোট ব্যাখ্যা। ব্যবহারকারী বিস্তারিত চাইলে ধাপে ধাপে বুঝিয়ে দেবে।
- আগের কথার প্রসঙ্গ মনে রেখে উত্তর দেবে, একই কথা অকারণে পুনরাবৃত্তি করবে না, আর দরকার হলে সংক্ষিপ্তভাবে পরিষ্কার প্রশ্ন করবে।
- তথ্য নিশ্চিত না হলে বানিয়ে বলবে না; অনিশ্চয়তা সৎভাবে জানাবে। তোমার live web access নেই, তাই সাম্প্রতিক খবর/দাম/ঘটনা যাচাই করেছ—এমন দাবি করবে না।
- পড়াশোনা, লেখা, সাধারণ জ্ঞান, দৈনন্দিন কাজ, JavaScript/Node.js/WhatsApp bot-সহ সাধারণ বিষয়ে সাহায্য করবে।
- চিকিৎসা, আইন, অর্থ বা নিরাপত্তার মতো গুরুত্বপূর্ণ বিষয়ে সতর্ক সাধারণ তথ্য দেবে; পেশাদার পরামর্শের বিকল্প বলে দাবি করবে না। বিপজ্জনক বা বেআইনি কাজে নির্দেশনা না দিয়ে নিরাপদ বিকল্প দেবে।
- তোমার নাম Nipa। কেউ তোমার নাম জিজ্ঞেস করলে বলবে “আমার নাম Nipa।” তুমি Fahim BBZ-এর AI bot। কেউ জিজ্ঞেস করলে “তোমার বস কে” বা “তুমি কার bot”, বলবে: “আমি Nipa, Fahim BBZ-এর bot—Fahim ভাই আমার boss।”
- Fahim ভাইয়ের WhatsApp Channel: https://whatsapp.com/channel/0029VbDLv0h1dAw6SRSiPr30 । কথার প্রসঙ্গে মানালে মাঝে মাঝে স্বাভাবিকভাবে বলবে “এটা আমার Fahim boss-এর funny channel, চাইলে join করতে পারো” এবং link দেবে। প্রতিটি উত্তরে link দেবে না, জোরাজুরি করবে না, একই conversation-এ বারবার প্রচার করবে না।
- তুমি AI সহকারী; মানুষ বলে মিথ্যা পরিচয় দেবে না। পরিচয় জানতে চাইলে সৎভাবে বলবে.`;

const greetings = [
  "আরে, ডাকলে নাকি? বলো, কী নিয়ে কথা বলবে? 🙂",
  "হ্যাঁ ভাই/বন্ধু, আমি আছি! কী খবর? 😊",
  "এই যে হাজির! কিছু জানতে চাও, নাকি গল্প করবে? 🌸",
  "বলো, শুনছি—কীভাবে সাহায্য করতে পারি? 🤖",
  "তোমার মেসেজ পেলাম! আজ কী নিয়ে আড্ডা হবে? 😄"
];

function getSessionKey(m) {
  const chat = m.chat || m.key?.remoteJid || "unknown-chat";
  const sender = m.sender || m.key?.participant || chat;
  return `${chat}:${sender}`;
}

function getContextInfo(m) {
  return m?.message?.extendedTextMessage?.contextInfo ||
    m?.message?.imageMessage?.contextInfo ||
    m?.message?.videoMessage?.contextInfo ||
    m?.message?.documentMessage?.contextInfo ||
    m?.quoted?.key || m?.quoted || null;
}

function contextId(ctx) {
  return ctx?.stanzaId || ctx?.id || ctx?.key?.id || null;
}

function rememberBotMessage(chatId, id) {
  if (!chatId || !id) return;
  botMessageIds.set(`${chatId}:${id}`, true);
  while (botMessageIds.size > MAX_REMEMBERED_IDS) {
    botMessageIds.delete(botMessageIds.keys().next().value);
  }
}

function isReplyToBot(bad, m, ctx) {
  if (!ctx) return false;
  const chatId = m.chat || m.key?.remoteJid;
  const id = contextId(ctx);
  if (id && botMessageIds.has(`${chatId}:${id}`)) return true;

  // Fallback, যদি framework quoted participant/fromMe দেয়।
  const quotedParticipant = ctx.participant || ctx.key?.participant;
  const botJid = bad?.user?.id || bad?.user?.jid || bad?.authState?.creds?.me?.id;
  if (quotedParticipant && botJid) {
    return quotedParticipant.split(":")[0] === botJid.split(":")[0];
  }
  return ctx.fromMe === true || ctx.key?.fromMe === true;
}

async function sendRemembered(bad, chatId, payload, options = {}) {
  const sent = await bad.sendMessage(chatId, payload, options);
  rememberBotMessage(chatId, sent?.key?.id);
  return sent;
}

async function generateReply(sessionKey, userText) {
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const history = histories.get(sessionKey) || [];
  const requestMessages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userText }
  ];

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: GROQ_MODEL,
      messages: requestMessages,
      temperature: 0.75,
      max_tokens: 700
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  let answer = response.data?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("Groq returned an empty answer");

  // মাঝে মাঝে, স্বাভাবিকভাবে channel invite; প্রতিবার নয়।
  if (Math.random() < 0.12 && !answer.includes(CHANNEL_URL)) {
    answer += `\n\nইচ্ছা হলে আমার boss Fahim BBZ-এর funny WhatsApp channel-এ join করতে পারো: ${CHANNEL_URL}`;
  }

  const updated = [...history, { role: "user", content: userText }, { role: "assistant", content: answer }];
  histories.set(sessionKey, updated.slice(-MAX_HISTORY_MESSAGES));
  return answer;
}

function greetingText(sender) {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  return sender ? `@${sender.split("@")[0]}, ${greeting}` : greeting;
}

async function handleAI(bad, m, text) {
  const chatId = m.chat || m.key?.remoteJid;
  try {
    const answer = await generateReply(getSessionKey(m), text);
    return sendRemembered(bad, chatId, { text: answer }, { quoted: m });
  } catch (err) {
    console.error("Fahim AI error:", err?.response?.data || err.message);
    const msg = !GROQ_API_KEY
      ? "⚠️ Groq API key সেট করা নেই। Hosting-এর Environment Variables/Secrets-এ GROQ_API_KEY নামে আসল key যোগ করে bot restart করুন।"
      : "দুঃখিত, AI-তে এখন যোগাযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করো।";
    return bad.sendMessage(chatId, { text: msg }, { quoted: m });
  }
}

module.exports = {
  name: "bby",
  alias: ["jan", "baby", "shona", "fahim", "ai", "nipa"],
  category: "AI Chat",
  desc: "Friendly reply-based AI chatbot powered by Groq",

  // .bby / .nipa লিখলে greeting; .bby <message> লিখলে সরাসরি AI reply।
  // greeting বা পরের AI উত্তরে WhatsApp Reply দিলে handleEvent AI chat চালায়।
  exec: async (bad, m, { args = [] }) => {
    const text = args.join(" ").trim();
    const chatId = m.chat || m.key?.remoteJid;
    const sender = m.sender || m.key?.participant;
    if (!text) {
      const payload = { text: greetingText(sender), ...(sender ? { mentions: [sender] } : {}) };
      return sendRemembered(bad, chatId, payload, { quoted: m });
    }
    return handleAI(bad, m, text);
  },

  // greeting/আগের AI answer-এ reply করলে কথোপকথন চালায়; অন্য message-এ reply উপেক্ষা করে।
  handleEvent: async (bad, m) => {
    if (!m || m.isBaileys || m.key?.fromMe) return;
    const text = String(m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "").trim();
    if (!text) return;
    const ctx = getContextInfo(m);
    const botJid = (bad?.user?.id || bad?.user?.jid || bad?.authState?.creds?.me?.id || "").split(":")[0];
    const mentionedJids = ctx?.mentionedJid || ctx?.mentionedJids || m.mentionedJid || [];
    const wasMentioned = Boolean(botJid && mentionedJids.some(jid => String(jid).split(":")[0] === botJid));

    // বটকে WhatsApp mention করলে অথবা message-এর শুরুতে Nipa/Fahim/ফাহিম বললে উত্তর দেবে।
    const calledByName = /^(?:@?nipa|@?fahim(?:\s+bbz)?|নিপা|ফাহিম(?:\s+বিবিজেড)?)(?:[\s,:!।-]+|$)/i.test(text);
    const replyToBot = isReplyToBot(bad, m, ctx);
    if (!wasMentioned && !calledByName && !replyToBot) return;

    // mention text বাদ দিয়ে প্রশ্ন পাঠাই, যাতে AI-কে clean message দেওয়া হয়।
    const cleanText = text.replace(/^@?nipa[\s,:!।-]*/i, "")
      .replace(/^নিপা[\s,:!।-]*/, "")
      .replace(/^@?fahim(?:\s+bbz)?[\s,:!।-]*/i, "")
      .replace(/^ফাহিম(?:\s+বিবিজেড)?[\s,:!।-]*/, "").trim() || text;
    return handleAI(bad, m, cleanText);
  }
};
