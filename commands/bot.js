// commands/bot.js
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

module.exports = {
  name: "bot",
  alias: ["sim"],
  category: "AI Chat",
  desc: "Nayan Bot AI Chatbot",

  exec: async (bad, m, { args }) => {
    const chatId = m.chat;
    const sender = m.sender || m.key.participant;
    const usermsg = args.join(" ");

    if (!usermsg) {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      return await bad.sendMessage(chatId, {
        text: `@${sender.split('@')[0]}, ${randomGreeting}`,
        mentions: [sender],
      }, { quoted: m });
    }

    try {
      const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json");
      const apiss = apis.data.api;

      const response = await axios.get(
        `${apiss}/sim?type=ask&ask=${encodeURIComponent(usermsg)}&number=${sender.split('@')[0]}`
      );

      const replyText = response.data?.data?.msg || "🤖 বুঝতে পারিনি!";
      return await bad.sendMessage(chatId, { text: replyText }, { quoted: m });

    } catch (err) {
      console.error("❌ Bot command error:", err);
      return await bad.sendMessage(chatId, { text: "❌ এরর হয়েছে, পরে চেষ্টা করুন।" }, { quoted: m });
    }
  },

  handleEvent: async (bad, m) => {
    try {
      if (!m || !m.text || m.isBaileys || m.key.fromMe) return;

      const text = m.text.toLowerCase().trim();
      const chatId = m.chat;
      const sender = m.sender || m.key.participant;

      // ১. রিপ্লাই ডিটেক্ট করার জন্য গভীর থেকে অবজেক্ট চেক (Baileys compatible)
      const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.quoted;
      const isReplyToBot = contextInfo && (
        contextInfo.participant || 
        contextInfo.stanzaId || 
        contextInfo.quotedMessage
      );

      const startsWithTrigger = text.startsWith("bot ") || text.startsWith("বট ");

      // ২. বটের মেসেজে রিপ্লাই দিলে অথবা 'bot [মেসেজ]' বললে AI উত্তর দেবে
      if (isReplyToBot && text !== "bot" && text !== "বট") {
        const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json");
        const apiss = apis.data.api;

        const response = await axios.get(
          `${apiss}/sim?type=ask&ask=${encodeURIComponent(m.text)}&number=${sender.split('@')[0]}`
        );

        const replyText = response.data?.data?.msg || "🤖 বুঝতে পারিনি!";
        return await bad.sendMessage(chatId, { text: replyText }, { quoted: m });
      }

      // ৩. শুধু 'bot' বা 'বট' লিখলে র্যান্ডম গ্রিটিং দেবে
      const singleTriggers = ["bot", "বট", "jan", "জান", "sona", "সোনা"];
      if (singleTriggers.includes(text)) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        return await bad.sendMessage(chatId, {
          text: `@${sender.split('@')[0]}, ${randomGreeting}`,
          mentions: [sender],
        }, { quoted: m });
      }

    } catch (e) {
      console.log("Bot Event Error:", e);
    }
  }
};
