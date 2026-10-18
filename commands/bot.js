// commands/bot.js
const axios = require("axios");

const greetings = [
  "🙂 ⎯͢✧ জান বাল ফালাইবা নাকি হুম? 🐱",
  "😵 ⎯͢✧ আমাকে এত ডাকো কেনো... বস ফাহিম রাগ করবে! 🌸",
  "👑 ⎯͢✧ আমাকে বেশি ডাকবেন না, আমি VIP বট বুঝছেন! 🐱",
  "🍛 ⎯͢✧ ডাকলেন আসলাম... এখন কি ভাত-মাংস খাওয়াবেন নাকি? 🤭",
  "💫 ⎯͢✧ বস ফাহিম BBZ এর বট হাজির ꫝᥫ᭡ 🐱",
  "🌷 ⎯͢✧ এতো ডাকলে কিন্তু আমি অভিমান করবো হুম 😒",
  "🐱 ⎯͢✧ আমাকে ডাকলে আমি চলে আসি... এটাই তো ভালোবাসা ꫝᥫ᭡ 🌸",
  "⚡ ⎯͢✧ বস ফাহিম BBZ এর পাওয়ারফুল বট উপস্থিত 😎",
  "🤖 ⎯͢✧ আমি অনলাইনে আছি, বলেন কি করতে হবে 🌷",
  "😌 ⎯͢✧ আহা, আবার আমাকে মনে পড়ছে নাকি? 🐱",
  "🌺 ⎯͢✧ এতো কিউট করে ডাকলে না এসে পারি নাকি 😫💖",
  "🔥 ⎯͢✧ সিস্টেম ফুল স্মুথ চলছে বস 😎⚡",
  "🫣 ⎯͢✧ চুপচাপ ডাকলেন কেনো... ভয় পাইছি তো 🐱",
  "💝 ⎯͢✧ আমাকে ডাকলে মনের মধ্যে আলাদা শান্তি লাগে 🌸",
  "🎧 ⎯͢✧ ব্যাকগ্রাউন্ডে sad song বাজতাছে আর আপনি আমাকে ডাকতাছেন 😔",
  "🌙 ⎯͢✧ রাত জাগা মানুষদের জন্য আমি সবসময় অনলাইনে 🐱",
  "🚀 ⎯͢✧ FAHIM BBZ Bot always ready to chat ꫝᥫ᭡ 🌷",
  "😎 ⎯͢✧ বস ফাহিম অন ফায়ার 🔥",
  "🥺 ⎯͢✧ আমাকে এতো ভালোবাসেন কেনো বলেন তো 🐱",
  "🌸 ⎯͢✧ আপনার ডাকে হাজির হয়ে গেলাম ꫝᥫ᭡",
  "🤍 ⎯͢✧ আমি কিন্তু শুধু স্পেশাল মানুষদের রিপ্লাই দেই 😌"
];

// এই process চলাকালীন বটের পাঠানো message ID-গুলো মনে রাখে।
// এতে group-এ নিজের greeting/AI উত্তরের reply নির্ভুলভাবে চেনা যায়।
const botMessageIds = new Map();
const MAX_REMEMBERED_MESSAGES = 5000;

function rememberBotMessage(chatId, messageId) {
  if (!chatId || !messageId) return;
  botMessageIds.set(`${chatId}:${messageId}`, true);
  if (botMessageIds.size > MAX_REMEMBERED_MESSAGES) {
    botMessageIds.delete(botMessageIds.keys().next().value);
  }
}

function getContextInfo(m) {
  return m?.message?.extendedTextMessage?.contextInfo ||
    m?.message?.imageMessage?.contextInfo ||
    m?.message?.videoMessage?.contextInfo ||
    m?.message?.documentMessage?.contextInfo ||
    m?.message?.quotedMessage?.contextInfo ||
    m?.quoted?.key ||
    m?.quoted ||
    null;
}

function getQuotedMessageId(contextInfo) {
  return contextInfo?.stanzaId || contextInfo?.id || contextInfo?.key?.id || null;
}

function isReplyToThisBot(bad, m, contextInfo) {
  if (!contextInfo) return false;

  const chatId = m.chat || m.key?.remoteJid;
  const quotedId = getQuotedMessageId(contextInfo);
  if (quotedId && botMessageIds.has(`${chatId}:${quotedId}`)) return true;

  // Restart-এর পরেও group reply শনাক্ত করার fallback: quoted message-এর author bot কি না।
  const quotedAuthor = contextInfo.participant || contextInfo.remoteJid || contextInfo.key?.participant;
  const botJid = bad?.user?.id || bad?.user?.jid || bad?.authState?.creds?.me?.id;
  if (quotedAuthor && botJid) {
    return quotedAuthor.split(":")[0] === botJid.split(":")[0];
  }

  // Private chat-এ participant অনেক সময় থাকে না; শুধু fromMe তথ্য থাকলে সেটি গ্রহণ করি।
  return contextInfo.fromMe === true || contextInfo.key?.fromMe === true;
}

async function askAI(text, sender) {
  const apiConfig = await axios.get(
    "https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json",
    { timeout: 15000 }
  );
  const apiBase = apiConfig.data?.api;
  if (!apiBase) throw new Error("AI API URL পাওয়া যায়নি");

  const response = await axios.get(
    `${apiBase}/sim?type=ask&ask=${encodeURIComponent(text)}&number=${encodeURIComponent((sender || "").split("@")[0])}`,
    { timeout: 30000 }
  );
  return response.data?.data?.msg || "🤖 বুঝতে পারিনি!";
}

async function sendAndRemember(bad, chatId, payload, options = {}) {
  const sent = await bad.sendMessage(chatId, payload, options);
  rememberBotMessage(chatId, sent?.key?.id);
  return sent;
}

module.exports = {
  name: "bot",
  alias: ["sim"],
  category: "AI Chat",
  desc: "Reply-based AI chatbot",

  // Command হিসেবে .bot লিখলে greeting, আর .bot <কথা> লিখলে সরাসরি AI উত্তর।
  exec: async (bad, m, { args }) => {
    const chatId = m.chat || m.key?.remoteJid;
    const sender = m.sender || m.key?.participant || m.key?.remoteJid;
    const usermsg = (args || []).join(" ").trim();

    if (!usermsg) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      return sendAndRemember(bad, chatId, {
        text: `${sender ? `@${sender.split("@")[0]}, ` : ""}${greeting}`,
        ...(sender ? { mentions: [sender] } : {})
      }, { quoted: m });
    }

    try {
      const replyText = await askAI(usermsg, sender);
      return sendAndRemember(bad, chatId, { text: replyText }, { quoted: m });
    } catch (err) {
      console.error("Bot command error:", err);
      return bad.sendMessage(chatId, { text: "❌ AI-তে যোগাযোগ করা যায়নি, পরে চেষ্টা করুন।" }, { quoted: m });
    }
  },

  handleEvent: async (bad, m) => {
    try {
      if (!m || m.isBaileys || m.key?.fromMe) return;

      const chatId = m.chat || m.key?.remoteJid;
      const sender = m.sender || m.key?.participant || m.key?.remoteJid;
      const text = String(m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim();
      if (!text || !chatId) return;

      const normalized = text.toLowerCase();
      const singleTriggers = ["bot", "বট", "jan", "জান", "sona", "সোনা"];

      // কেবল সরাসরি ডাকলে greeting; সাধারণ hi/hello-তে কোনো স্বয়ংক্রিয় reply নয়।
      if (singleTriggers.includes(normalized)) {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        return sendAndRemember(bad, chatId, {
          text: `${sender ? `@${sender.split("@")[0]}, ` : ""}${greeting}`,
          ...(sender ? { mentions: [sender] } : {})
        }, { quoted: m });
      }

      // greeting বা আগের AI উত্তরের reply হলেই AI-তে পাঠাবে। অন্য কারও message-এর reply উপেক্ষা করবে।
      const contextInfo = getContextInfo(m);
      if (!isReplyToThisBot(bad, m, contextInfo)) return;

      const replyText = await askAI(text, sender);
      return sendAndRemember(bad, chatId, { text: replyText }, { quoted: m });
    } catch (err) {
      console.error("Bot Event Error:", err);
    }
  }
};
