// commands/antisticker.js

global.antiStickerGroups = global.antiStickerGroups || [];
global.stickerWarnings = global.stickerWarnings || {};

module.exports = {
  name: "antisticker",
  alias: ["asticker"],
  category: "Moderation",
  desc: "Delete stickers automatically with warnings and auto-kick.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    const chatId = m.chat;
    const sub = args[0]?.toLowerCase();

    if (!isAdmins && !isCreator) {
      return await bad.sendMessage(chatId, { text: "⚠️ এই কমান্ডটি শুধুমাত্র এডমিনদের জন্য!" }, { quoted: m });
    }

    if (sub === "on") {
      if (global.antiStickerGroups.includes(chatId)) {
        return await bad.sendMessage(chatId, { text: "⚠️ AntiSticker অলরেডি চালু (ON) আছে!" }, { quoted: m });
      }
      global.antiStickerGroups.push(chatId);
      return await bad.sendMessage(chatId, { text: "✅ AntiSticker সফলভাবে চালু (ON) করা হয়েছে!" }, { quoted: m });
    }

    if (sub === "off") {
      if (!global.antiStickerGroups.includes(chatId)) {
        return await bad.sendMessage(chatId, { text: "⚠️ AntiSticker অলরেডি বন্ধ (OFF) আছে!" }, { quoted: m });
      }
      global.antiStickerGroups = global.antiStickerGroups = global.antiStickerGroups.filter((g) => g !== chatId);
      delete global.stickerWarnings[chatId];
      return await bad.sendMessage(chatId, { text: "❌ AntiSticker বন্ধ (OFF) করা হয়েছে!" }, { quoted: m });
    }

    return await bad.sendMessage(
      chatId,
      {
        text: `📌 *AntiSticker ব্যবহার পদ্ধতি:*\n\n👉 চালু করতে: *${prefix}antisticker on*\n👉 বন্ধ করতে: *${prefix}antisticker off*`,
      },
      { quoted: m }
    );
  },

  handleEvent: async (bad, m, { isAdmins, isCreator }) => {
    try {
      if (!m.isGroup) return;

      const chatId = m.chat;
      if (!global.antiStickerGroups.includes(chatId)) return;

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

        // ২. ওয়ার্নিং হিসাব করা
        if (!global.stickerWarnings[chatId]) global.stickerWarnings[chatId] = {};
        let warnings = (global.stickerWarnings[chatId][sender] || 0) + 1;
        global.stickerWarnings[chatId][sender] = warnings;

        // ৩. ৩ নম্বর ওয়ার্নিং এ কিক (Kick)
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
    } catch (e) {
      console.log("AntiSticker Event Error:", e);
    }
  },
};