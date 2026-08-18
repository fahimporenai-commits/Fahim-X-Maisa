// commands/antistatus.js

// AntiStatus অন থাকা গ্রুপগুলোর আইডি সেভ রাখার অ্যারে
global.antiStatusGroups = global.antiStatusGroups || [];
global.statusWarnings = global.statusWarnings || {};

module.exports = {
  name: "antistatus",
  alias: ["astatus"],
  category: "Moderation",
  desc: "Delete status mentions automatically with warnings and auto-kick.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    const chatId = m.chat;
    const sub = args[0]?.toLowerCase();

    // শুধুমাত্র এডমিন বা বটের ওনার অন/অফ করতে পারবে
    if (!isAdmins && !isCreator) {
      return await bad.sendMessage(chatId, { text: "⚠️ এই কমান্ডটি শুধুমাত্র এডমিনদের জন্য!" }, { quoted: m });
    }

    if (sub === "on") {
      if (global.antiStatusGroups.includes(chatId)) {
        return await bad.sendMessage(chatId, { text: "⚠️ AntiStatus অলরেডি চালু (ON) আছে!" }, { quoted: m });
      }
      global.antiStatusGroups.push(chatId);
      return await bad.sendMessage(chatId, { text: "✅ AntiStatus সফলভাবে চালু (ON) করা হয়েছে!" }, { quoted: m });
    }

    if (sub === "off") {
      if (!global.antiStatusGroups.includes(chatId)) {
        return await bad.sendMessage(chatId, { text: "⚠️ AntiStatus অলরেডি বন্ধ (OFF) আছে!" }, { quoted: m });
      }
      global.antiStatusGroups = global.antiStatusGroups.filter((g) => g !== chatId);
      delete global.statusWarnings[chatId]; // বন্ধ করলে গ্রুপ ওয়ার্নিং ক্লিয়ার হবে
      return await bad.sendMessage(chatId, { text: "❌ AntiStatus বন্ধ (OFF) করা হয়েছে!" }, { quoted: m });
    }

    return await bad.sendMessage(
      chatId,
      {
        text: `📌 *AntiStatus ব্যবহার পদ্ধতি:*\n\n👉 চালু করতে: *${prefix}antistatus on*\n👉 বন্ধ করতে: *${prefix}antistatus off*`,
      },
      { quoted: m }
    );
  },

  // 🔄 ইভেন্ট হ্যান্ডেলার (মেসেজ ফিল্টার করার জন্য)
  handleEvent: async (bad, m, { isAdmins, isCreator }) => {
    try {
      if (!m.isGroup) return;

      const chatId = m.chat;

      // গ্রুপে AntiStatus চালু আছে কি না চেক করা
      if (!global.antiStatusGroups.includes(chatId)) return;

      // নয়ন বটের অরিজিনাল স্ট্যাটাস মেনশন ধরার স্ট্রাকচার
      const eventString = JSON.stringify(m);
      const isStatus = eventString.includes("status@broadcast");

      if (isStatus) {
        // এডমিন, ওনার বা বটের নিজের পাঠানো মেসেজে কিছু করবে না
        if (m.key.fromMe || isAdmins || isCreator) return;

        const msgKey = m.key;
        const sender = m.sender || msgKey?.participant;

        // ১. স্ট্যাটাস মেনশন মেসেজটি সাথে সাথে ডিলিট করা
        if (msgKey && msgKey.id) {
          try {
            await bad.sendMessage(chatId, {
              delete: {
                remoteJid: chatId,
                fromMe: false,
                id: msgKey.id,
                participant: msgKey.participant || sender,
              },
            });
          } catch (e) {
            console.log("AntiStatus delete error:", e);
          }
        }

        // ২. ওয়ার্নিং কাউন্ট করা
        if (!global.statusWarnings[chatId]) global.statusWarnings[chatId] = {};
        let warnings = (global.statusWarnings[chatId][sender] || 0) + 1;
        global.statusWarnings[chatId][sender] = warnings;

        // ৩. ৩ নম্বর ওয়ার্নিং এ কিক (Kick) দেওয়া
        if (warnings >= 3) {
          await bad.sendMessage(chatId, {
            text: `🚫 *ANTI-STATUS SYSTEM*\n\n@${sender.split("@")[0]} কে বারবার স্ট্যাটাস মেনশন দেওয়ায় ৩টি ওয়ার্নিং শেষে গ্রুপ থেকে বের করে দেওয়া হলো! ❌`,
            mentions: [sender],
          });

          try {
            await bad.groupParticipantsUpdate(chatId, [sender], "remove");
            delete global.statusWarnings[chatId][sender]; // ওয়ার্নিং রিসেট
          } catch (err) {
            console.log("Kick error:", err);
          }
        } else {
          // ১ বা ২ নম্বর ওয়ার্নিং মেসেজ
          await bad.sendMessage(chatId, {
            text: `⚠️ *STATUS MENTION DETECTED!*\n\n❌ @${sender.split("@")[0]} গ্রুপে স্ট্যাটাস মেনশন দেওয়া নিষেধ!\n\n📌 *Warning:* [ ${warnings} / 3 ]\n👉 ৩ নম্বর ওয়ার্নিং খেলে আপনাকে অটো-কিক দেওয়া হবে!`,
            mentions: [sender],
          });
        }
      }
    } catch (e) {
      console.log("AntiStatus Event Error:", e);
    }
  },
};
