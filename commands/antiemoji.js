global.antiEmojiGroups = global.antiEmojiGroups || {}; // { chatId: { all: false, set: null } }

module.exports = {
  name: "antiemoji",
  alias: ["aemoji"],
  category: "Moderation",
  desc: "Delete messages containing emojis.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    const chatId = m.chat;
    const sub = args[0]?.toLowerCase();
    const target = args[1];

    if (!isAdmins && !isCreator) {
      return await bad.sendMessage(chatId, { text: "⚠️ এই কমান্ডটি শুধুমাত্র এডমিনদের জন্য!" }, { quoted: m });
    }

    if (!global.antiEmojiGroups[chatId]) {
      global.antiEmojiGroups[chatId] = { all: false, set: null };
    }

    if (sub === "all") {
      if (target === "on") {
        global.antiEmojiGroups[chatId].all = true;
        return await bad.sendMessage(chatId, { text: "✅ AntiEmoji All চালু করা হয়েছে!" }, { quoted: m });
      } else if (target === "off") {
        global.antiEmojiGroups[chatId].all = false;
        return await bad.sendMessage(chatId, { text: "❌ AntiEmoji All বন্ধ করা হয়েছে!" }, { quoted: m });
      }
    }

    if (sub === "set") {
      if (!target) return await bad.sendMessage(chatId, { text: "⚠️ একটি নির্দিষ্ট ইমোজি দিন! যেমন: `.antiemoji set 🙂`" }, { quoted: m });
      global.antiEmojiGroups[chatId].set = target;
      return await bad.sendMessage(chatId, { text: `✅ নির্দিষ্ট AntiEmoji [ ${target} ] সেট করা হয়েছে!` }, { quoted: m });
    }

    if (sub === "unset") {
      global.antiEmojiGroups[chatId].set = null;
      return await bad.sendMessage(chatId, { text: "❌ নির্দিষ্ট AntiEmoji মুছে ফেলা হয়েছে!" }, { quoted: m });
    }

    return await bad.sendMessage(
      chatId,
      {
        text: `📌 *AntiEmoji ব্যবহারের নিয়ম:*\n\n👉 সব ইমোজি বন্ধ: *${prefix}antiemoji all on / off*\n👉 নির্দিষ্ট ইমোজি বন্ধ: *${prefix}antiemoji set 🙂*\n👉 সেট বন্ধ করা: *${prefix}antiemoji unset*`,
      },
      { quoted: m }
    );
  },

  handleEvent: async (bad, m, { isAdmins, isCreator }) => {
    try {
      if (!m.isGroup || m.key.fromMe || isAdmins || isCreator) return;

      const chatId = m.chat;
      const settings = global.antiEmojiGroups[chatId];
      if (!settings) return;

      const bodyText = m.text || "";
      if (!bodyText) return;

      // ১০০% নিখুঁত ইউনিভার্সাল ইমোজি ডিটেক্টর (Extended Unicode Support)
      const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Component})/gu;

      const hasEmoji = emojiRegex.test(bodyText);
      const hasSpecificEmoji = settings.set && bodyText.includes(settings.set);

      if ((settings.all && hasEmoji) || hasSpecificEmoji) {
        await bad.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || m.sender,
          },
        });
      }
    } catch (e) {
      console.log("AntiEmoji Delete Error:", e);
    }
  },
};
