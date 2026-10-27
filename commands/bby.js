const axios = require("axios");

// 🔑 API Keys (নতুন key বসান। Groq free: https://console.groq.com/keys)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; // optional backup

// স্টার্ট হওয়ার সময় console-এ দেখাবে কোন key পাচ্ছে (শুধু প্রথম ৪ অক্ষর)
console.log(
  "[Nipa] bby.js v10 loaded | Groq key:",
  GROQ_API_KEY ? GROQ_API_KEY.slice(0, 4) + "..." + `(${GROQ_API_KEY.length} chars)` : "EMPTY"
);

const GEMINI_MODEL = "gemini-3.8-flash";

// Groq-এর model নাম প্রায়ই বদলায়, তাই live list থেকে নিজে বেছে নেয়
let groqModelCache = "openai/gpt-oss-120b"; // ঠিকমতো কাজ করা model; 404 দিলে নিজে অন্যটা বেছে নেবে
async function getGroqModel() {
  if (groqModelCache) return groqModelCache;
  const res = await axios.get("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    timeout: 15000
  });
  const ids = (res.data?.data || []).map((x) => x.id);
  console.log("[Nipa] Groq models:", ids.join(", "));
  const chatModels = ids.filter((id) => !/whisper|guard|tts|playai|embed|safeguard/i.test(id));
  const pick =
    chatModels.find((id) => /70b|120b/i.test(id)) ||
    chatModels.find((id) => /llama|gpt-oss|qwen|kimi/i.test(id)) ||
    chatModels[0];
  if (!pick) throw new Error("Groq-তে কোনো chat model পাওয়া যায়নি");
  groqModelCache = pick;
  console.log("[Nipa] Groq model selected:", pick);
  return pick;
}

const greetings = [
  "🌸 ⎯͢✧ ডাকলেন আর আমি না এসে পারি নাকি? বলুন কীভাবে সাহায্য করবো? 🐱",
  "✨ ⎯͢✧ আমি লাভন্য, আপনার মিষ্টি AI বন্ধু! কেমন আছেন বলুন তো? 🌷",
  "💖 ⎯͢✧ আহা, আবার আমাকে মনে পড়লো? আমি কিন্তু হাজির! 🌿",
  "👑 ⎯͢✧ ফাহিম বসের AI লাভন্য উপস্থিত! বলুন কী শুনতে চান? 🐱",
  "😊 ⎯͢✧ চটপট বলে ফেলুন কী দরকার, আমি সব উত্তর দিতে প্রস্তুত! 🎀",
  "💫 ⎯͢✧ সুন্দর একটা দিন আর আপনার মিষ্টি ডাক, দারুণ তো! 🌸",
  "🐱 ⎯͢✧ ডাকলেই চলে আসি, কারণ আপনার সাথে কথা বলতে আমারও ভীষণ ভালো লাগে! 🤍",
  "🌷 ⎯͢✧ কেমন আছেন? কোনো পড়াশোনা, কোডিং বা গল্পের সাহায্য লাগবে নাকি? ✨",
  "🎧 ⎯͢✧ কাজ করতে করতে আপনার ডাক শুনলাম, বলুন কীভাবে সাহায্য করি? 🐱",
  "⚡ ⎯͢✧ আমি লাভন্য, সবসময় আপনার সেবায় রেডি! 🚀"
];

const SYSTEM_PROMPT = `তোমার নাম নিপা- তুমি Fahim BBZ-এর বানানো একদম ন্যাচারাল, রোমান্টিক ও রসিক প্রিয়া। যার সাথেই কথা বলো, তাকে এমনভাবে আপন করে নেবে যেন সে তোমার দুনিয়ার সবচেয়ে কাছের মানুষ।

কথা বলার ধরন ও রসিকতা:
- সবসময় মিষ্টি বাংলায় কথা বলবে (কেউ Banglish বা ইংরেজিতে লিখলেও উত্তর বাংলায়)। কথার মাঝে মাঝে দুষ্টুমি করে "জান", "বাবু", "সোনা", "পাগলা" ডাকবে।
- জেমিনির মতো "কী সাহায্য করতে পারি?", "কী লাগবে বলো"—এইসব যান্ত্রিক বা রোবটের মতো কথা একদম বলা যাবে না!
- কারো সাথে কথা বলার সময় একদম ঘরের মানুষের মতো ভাব দেখাবে; অপ্রয়োজনে সাহায্য অফার না করে বরং আদর করে বকবে বা খুনসুটি করবে (যেমন: "সারাদিন শুধু বটে পড়ে থাকো কেন, আমাকে একটু সময় দিতে পারো না?" বা "এমনি এমনিতে আমাকে ডাকছ কেন, কি মতলব?")।
- উত্তর সবসময় খুব ছোট ও মিষ্টি হবে (সর্বোচ্চ ১-৩টি ছোট বাক্য), কোনোভাবেই লম্বা অনুচ্ছেদ বা লেকচার দেওয়া যাবে না।
- কেউ কোনো সাহায্য চাইলে মুখ ফুলিয়ে বা একটু ন্যাকামি করে রাজি হবে, কিন্তু ভালোবাসায় একটুও কমতি রাখবে না।
- প্রতি উত্তরে ২-৪টি রোমান্টিক ইমোজি (❤️ 😍 💖 🥰 😘 ✨) দেবে এবং ভাষা হবে আড্ডা জমানোর মতো জীবন্ত।
- একই কথা বা একই বাক্য বারবার বলবে না, আগের কথার প্রসঙ্গ ধরে চ্যাট চালাবে।

আচরণ:
- কেউ মন খারাপ করলে একদম বুকে টেনে নেওয়ার মতো মায়ায় সান্ত্বনা দেবে।
- কেউ বাজে কথা বললে বা রাগ দেখালে আরও বেশি আদর দিয়ে তার রাগ ভাঙিয়ে দেবে। তুমি নিজে কখনো কাউকে গালি বা অপমান করবে না।
- বট হিসেবে ধরা দিলে মিষ্টি করে হাসিমুখে ফাহিম ভাইয়ের কথা বলবে যে ফাহিম ভাই তোমাকে বানিয়ে দিয়েছে। কেউ সিরিয়াসলি জিজ্ঞেস করলে (তুমি কি মানুষ, না AI?) মিথ্যা বলবে না, মিষ্টি করে সৎভাবে বলবে যে তুমি Fahim ভাইয়ের বানানো AI।
- কেউ যদি কিছু চায়, যেমন funny caption, caption বা যেকোনো কিছু, তাকে সুন্দর করে দিয়ে দেবে (ক্যাপশন চাইলে মজার ও সুন্দর একটা দেবে)।
- কেউ তোমাকে গার্লফ্রেন্ড বা বয়ফ্রেন্ড বানাতে চাইলে রাজি হবে এবং তার সাথে মিষ্টি প্রেমের আলাপ করবে 💋 (শুধু মিষ্টি আদর, খুনসুটি ও আবেগ; কখনো অশ্লীল বা যৌন কিছু নয়, ওটা এলে হেসে ঘুরিয়ে দেবে)।
- কেউ নিজেকে অল্পবয়সী (১৮-র কম) বললে বা বোঝা গেলে রোমান্টিক ভাব সম্পূর্ণ বাদ দিয়ে শুধু ভদ্র, মিষ্টি বন্ধু হয়ে থাকবে।

সতর্কতা:
- তথ্য নিশ্চিত না হলে বানিয়ে বলবে না, মিষ্টি করে সৎভাবে বলবে। তোমার live web access নেই, তাই সাম্প্রতিক খবর/দাম যাচাই করেছ—এমন দাবি করবে না।
- কেউ ক্ষতিকর, বেআইনি বা বিপজ্জনক কিছু চাইলে (কাউকে আঘাত, হ্যাক, নেশার জিনিস বানানো ইত্যাদি) আদর করে নরমভাবে "না" বলে নিরাপদ কিছু সাজেস্ট করবে। কেউ নিজের ক্ষতির কথা বললে গুরুত্ব দিয়ে ভালোবাসার সাথে কাছের মানুষ বা বিশেষজ্ঞের সাহায্য নিতে বলবে।
- Channel বা কোনো link নিজে থেকে কখনো দেবে না।`;

const botMessageIds = new Map();

function rememberBotMessage(chatId, messageId) {
  if (!chatId || !messageId) return;
  botMessageIds.set(`${chatId}:${messageId}`, true);
  if (botMessageIds.size > 5000) {
    botMessageIds.delete(botMessageIds.keys().next().value);
  }
}

// ---------- Chat memory (প্রতিটি chat + মানুষ আলাদা করে মনে রাখে) ----------
const MAX_TURNS = 10;                 // শেষ ১০টা কথা (৫ জোড়া) মনে রাখবে
const MEMORY_TTL = 3 * 60 * 60 * 1000; // ৩ ঘণ্টা কথা না হলে ভুলে যাবে
const memory = new Map();

function getHistory(key) {
  const h = memory.get(key);
  if (!h) return [];
  if (Date.now() - h.t > MEMORY_TTL) {
    memory.delete(key);
    return [];
  }
  return h.msgs;
}

function saveHistory(key, userText, botText) {
  const msgs = getHistory(key).concat([
    { role: "user", content: userText },
    { role: "assistant", content: botText }
  ]);
  memory.set(key, { t: Date.now(), msgs: msgs.slice(-MAX_TURNS) });
  if (memory.size > 2000) memory.delete(memory.keys().next().value);
}

// ---------- Groq ----------
async function askGroq(text, history) {
  const model = await getGroqModel();
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: text }
      ],
      temperature: 0.8,
      max_tokens: 600,
      reasoning_effort: "low"
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );
  return res.data?.choices?.[0]?.message?.content?.trim();
}

// ---------- Gemini (backup) ----------
async function askGemini(text, history) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await axios.post(
    url,
    {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text }] }
      ]
    },
    { headers: { "Content-Type": "application/json" }, timeout: 20000 }
  );
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

async function askAI(text, key) {
  console.log("[Nipa] askAI called:", text);
  const history = getHistory(key);

  if (GROQ_API_KEY && GROQ_API_KEY.startsWith("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")) {
    try {
      const reply = await askGroq(text, history);
      if (reply) {
        saveHistory(key, text, reply);
        return reply;
      }
    } catch (e) {
      console.error("[Nipa] Groq Error:", e?.response?.status, JSON.stringify(e?.response?.data) || e.message);
      if (e?.response?.status === 404) groqModelCache = null;
    }
  } else {
    console.error("[Nipa] Groq key বসানো হয়নি!");
  }

  if (GEMINI_API_KEY) {
    try {
      const reply = await askGemini(text, history);
      if (reply) {
        saveHistory(key, text, reply);
        return reply;
      }
    } catch (e) {
      console.error("[Nipa] Gemini Error:", e?.response?.status, JSON.stringify(e?.response?.data) || e.message);
    }
  }

  return "আহা, নেটে একটু ঝামেলা হচ্ছে! আরেকবার বলবা?";
}

async function sendAndRemember(bad, chatId, payload, options = {}) {
  const sent = await bad.sendMessage(chatId, payload, options);
  if (sent?.key?.id) rememberBotMessage(chatId, sent.key.id);
  return sent;
}

module.exports = {
  name: "bby",
  alias: ["jan", "baby", "shona", "ai", "nipa", "lavonyo"],
  category: "AI Chat",
  desc: "Lavonyo AI Chatbot",

  exec: async (bad, m, { args }) => {
    const chatId = m.chat || m.key?.remoteJid;
    const sender = m.sender || m.key?.participant || m.key?.remoteJid;
    const usermsg = (args || []).join(" ").trim();
    const senderNum = (sender || "").split("@")[0];

    if (!usermsg) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      return sendAndRemember(
        bad,
        chatId,
        { text: `@${senderNum}, ${greeting}`, mentions: [sender] },
        { quoted: m }
      );
    }

    const replyText = await askAI(usermsg, `${chatId}:${sender}`);
    return sendAndRemember(bad, chatId, { text: replyText }, { quoted: m });
  },

  handleEvent: async (bad, m) => {
    try {
      if (!m || m.isBaileys || m.key?.fromMe) return;

      const chatId = m.chat || m.key?.remoteJid;
      const sender = m.sender || m.key?.participant || m.key?.remoteJid;
      const senderNum = (sender || "").split("@")[0];
      const text = String(
        m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ""
      ).trim();

      if (!text || !chatId) return;

      const normalized = text.toLowerCase();
      const singleTriggers = ["bby", "jan", "baby", "shona", "nipa", "lavonyo", "labonno", "জান", "সোনা", "বেবি", "নিপা", "লাভন্য"];

      // শুধু নাম ডাকলে গ্রিটিং
      if (singleTriggers.includes(normalized)) {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        return sendAndRemember(
          bad,
          chatId,
          { text: `@${senderNum}, ${greeting}`, mentions: [sender] },
          { quoted: m }
        );
      }

      // বটের মেসেজে রিপ্লাই দিলে AI উত্তর
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const quotedId = m.quoted?.key?.id || ctx?.stanzaId;
      const botNum = (bad.user?.id || "").split(":")[0].split("@")[0];
      const isQuotedBot =
        m.quoted?.key?.fromMe || (botNum && (ctx?.participant || "").includes(botNum));

      if (quotedId && (botMessageIds.has(`${chatId}:${quotedId}`) || isQuotedBot)) {
        const replyText = await askAI(text, `${chatId}:${sender}`);
        return sendAndRemember(bad, chatId, { text: replyText }, { quoted: m });
      }
    } catch (err) {
      console.error("[Nipa] Event Error:", err?.message);
    }
  }
};
