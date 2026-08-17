// commands/bot.js
const axios = require("axios");

module.exports = {
  name: "bot",
  alias: ["sim"],
  category: "AI Chat",
  desc: "Nayan Bot AI Chatbot with custom greetings",

  exec: async (bad, m, { args }) => {
    const chatId = m.chat;
    const sender = m.sender || m.key.participant;
    const usermsg = args.join(" ");

    // ১. কোনো মেসেজ না দিলে কাস্টম র‍্যান্ডম গ্রিটিং দেবে
    if (!usermsg) {
      const greetings = [
        "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
        "কি গো সোনা আমাকে ডাকছ কেনো",
        "বার বার আমাকে ডাকস কেন😡",
        "আহ শোনা আবার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
        "ফাহিম স্যরকে সালাম দাও",
        "ফাহিমের একটা বউ আছে নাম নিহা",
        "হুম জান তোমার অইখানে উম্মমাহ😷😘",
        "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
        "আমাকে এতো না ডেকে বস ফাহিমকে একটা গফ দে 🙄",
        "ভাই কমা কর এত ডাক দিস না",
        "দুর বাল খালি ডাক দিয়ে ফাহিমের মাতা গরম করে",
        "jang hanga korba",
        "jang bal falaba🙂",
      ];

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      return await bad.sendMessage(chatId, {
        text: `@${sender.split('@')[0]}, ${randomGreeting}`,
        mentions: [sender],
      }, { quoted: m });
    }

    // ২. মেসেজ দিলে নয়ন বটের API দিয়ে উত্তর দেবে
    try {
      const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json");
      const apiss = apis.data.api;

      const response = await axios.get(
        `${apiss}/sim?type=ask&ask=${encodeURIComponent(usermsg)}&number=${sender.split('@')[0]}`
      );

      const replyText = response.data?.data?.msg || "🤖 I'm not sure how to respond to that.";
      return await bad.sendMessage(chatId, { text: replyText }, { quoted: m });

    } catch (err) {
      console.error("❌ Bot command error:", err);
      return await bad.sendMessage(chatId, { text: "❌ Something went wrong while talking with bot." }, { quoted: m });
    }
  },

  // ৩. প্রফিক্স ছাড়া ট্রিগার ওয়ার্ড ও মেসেজ রিপ্লাই হ্যান্ডলার
  handleEvent: async (bad, m) => {
    try {
      if (!m.text || m.isBaileys || m.key.fromMe) return;

      const text = m.text.toLowerCase().trim();
      const chatId = m.chat;
      const sender = m.sender || m.key.participant;

      // প্রফিক্স ছাড়া ট্রিগার ওয়ার্ড (bot, জান, সোনা ইত্যাদি)
      const triggerWords = ["bot", "বট", "jan", "জান", "sona", "সোনা"];
      const isTriggered = triggerWords.some(word => text.includes(word));
      
      // বটের দেওয়া মেসেজে কেউ রিপ্লাই দিলে
      const isReplyToBot = m.quoted && m.quoted.fromMe;

      if (isTriggered && text === "bot") {
        // শুধু 'bot' লিখলে কাস্টম গ্রিটিং রিপ্লাই দেবে
        const greetings = [
          "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
          "কি গো সোনা আমাকে ডাকছ কেনো",
          "বার বার আমাকে ডাকস কেন😡",
          "আহ শোনা আবার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
          "ফাহিম স্যরকে সালাম দাও",
          "ফাহিমের একটা বউ আছে নাম নিহা",
          "হুম জান তোমার অইখানে উম্মমাহ😷😘",
          "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
          "আমাকে এতো না ডেকে বস ফাহিমকে একটা গফ দে 🙄",
          "ভাই কমা কর এত ডাক দিস না",
          "দুর বাল খালি ডাক দিয়ে ফাহিমের মাতা গরম করে",
          "jang hanga korba",
          "jang bal falaba🙂",
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        return await bad.sendMessage(chatId, {
          text: `@${sender.split('@')[0]}, ${randomGreeting}`,
          mentions: [sender],
        }, { quoted: m });
      }

      if ((isTriggered && text !== "bot") || isReplyToBot) {
        const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json");
        const apiss = apis.data.api;

        const response = await axios.get(
          `${apiss}/sim?type=ask&ask=${encodeURIComponent(m.text)}&number=${sender.split('@')[0]}`
        );

        const replyText = response.data?.data?.msg || "🤖 I'm not sure how to respond to that.";
        return await bad.sendMessage(chatId, { text: replyText }, { quoted: m });
      }
    } catch (e) {
      console.log("Bot Event Error:", e);
    }
  }
};
