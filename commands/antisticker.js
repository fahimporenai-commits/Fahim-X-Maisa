// commands/antisticker.js

global.antiStickerMode = global.antiStickerMode || {}; // 'delete', 'kick', 'off'
global.stickerWarnings = global.stickerWarnings || {};

module.exports = {
  name: "antisticker",
  alias: ["asticker"],
  category: "Moderation",
  desc: "Delete stickers automatically with warnings and auto-kick option.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    const chatId = m.chat;
    const sub = args[0]?.toLowerCase();

    if (!isAdmins && !isCreator) {
      return await bad.sendMessage(chatId, { text: "⚠️ এই কমান্ডটি শুধুমাত্র এডমিনদের জন্য!" }, { quoted: m });
    }

    // ১. ওয়ার্নিং ও কিক মোড অন
    if (sub === "on" || sub === "kick" || sub === "warn") {
      global.antiStickerMode[chatId] = "kick";
      return await bad.sendMessage(chatId, { text: "⚠️ AntiSticker সফলভাবে চালু করা হয়েছে: *3 Warn & Auto-Kick Mode*" }, { quoted: m });
    }

    // ২. শুধুমাত্র ডিলিট মোড অন
    if (sub === "delete") {
      global.antiStickerMode[chatId] = "delete";
      return await bad.sendMessage(chatId, { text: "✅ AntiSticker সফলভাবে চালু করা হয়েছে: *Only Delete Mode*" }, { quoted: m });
    }

    // ৩. বন্ধ (OFF) করা
    if (sub === "off") {
      delete global.antiStickerMode[chatId];
      delete global.stickerWarnings[chatId];
      return await bad.sendMessage(chatId, { text: "❌ AntiSticker সম্পূর্ণ বন্ধ (OFF) করা হয়েছে!" }, { quoted: m });
    }

    return await bad.sendMessage(
      chatId,
      {
        text: `📌 *AntiSticker ব্যবহার পদ্ধতি:*\n\n👉 শুধু ডিলিট করতে: *${prefix}antisticker delete*\n👉 কিক ও ওয়ার্নিং চালু করতে: *${prefix}antisticker on*\n👉 বন্ধ করতে: *${prefix}antisticker off*`,
      },
      { quoted: m }
    );
  },

  handleEvent: async (bad, m, { isAdmins, isCreator }) => {
    try {
      if (!m.isGroup) return;

      const chatId = m.chat;
      const currentMode = global.antiStickerMode[chatId];

      // গ্রুপে AntiSticker বন্ধ থাকলে কিছু করবে না
      if (!currentMode) return;

      // স্টিকার মেসেজ ডিটেক্ট করা
      const isSticker = m.mtype === 'stickerMessage' || m.message?.stickerMessage;

      if (isSticker) {
        if (m.key.fromMe || isAdmins || isCreator) return;

        const msgKey = m.key;
        const sender = m.sender || msgKey?.participant;

        // ১. স্টিকার সাথে সাথে ডিলিট করা
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
            console.log("AntiSticker delete error:", e);
          }
        }

        // ২. কিক মোড অন থাকলে ওয়ার্নিং ও কিক কাউন্ট করা
        if (currentMode === "kick") {
          if (!global.stickerWarnings[chatId]) global.stickerWarnings[chatId] = {};
          let warnings = (global.stickerWarnings[chatId][sender] || 0) + 1;
          global.stickerWarnings[chatId][sender] = warnings;

          // ৩ নম্বর ওয়ার্নিং এ কিক (Kick)
          if (warnings >= 3) {
            await bad.sendMessage(chatId, {
              text: `🚫 *ANTI-STICKER SYSTEM*\n\n@${sender.split("@")[0]} কে বারবার স্টিকার পাঠানোয় ৩টি ওয়ার্নিং শেষে গ্রুপ থেকে বের করে দেওয়া হলো! ❌`,
              mentions: [sender],
            });

            try {
              await bad.groupParticipantsUpdate(chatId, [sender], "remove");
              delete global.stickerWarnings[chatId][sender];
            } catch (err) {
              console.log("Kick error:", err);
            }
          } else {
            // ১ বা ২ নম্বর ওয়ার্নিং মেসেজ
            await bad.sendMessage(chatId, {
              text: `⚠️ *STICKER DETECTED!*\n\n❌ @${sender.split("@")[0]} গ্রুপে স্টিকার পাঠানো নিষেধ!\n\n📌 *Warning:* [ ${warnings} / 3 ]\n👉 ৩ নম্বর ওয়ার্নিং খেলে আপনাকে অটো-কিক দেওয়া হবে!`,
              mentions: [sender],
            });
          }
        }
      }
    } catch (e) {
      console.log("AntiSticker Event Error:", e);
    }
  },
};
