global.antiMediaGroups = global.antiMediaGroups || {}; // { chatId: { image: true, voice: true, all: false } }

module.exports = {
  name: "antimedia",
  alias: ["antiimage", "antivoice"],
  category: "Moderation",
  desc: "Auto delete media files in group.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    const chatId = m.chat;
    const sub = args[0]?.toLowerCase();
    const cmd = m.text?.slice(1).split(" ")[0].toLowerCase();

    if (!isAdmins && !isCreator) {
      return await bad.sendMessage(chatId, { text: "⚠️ এই কমান্ডটি শুধুমাত্র এডমিনদের জন্য!" }, { quoted: m });
    }

    if (!global.antiMediaGroups[chatId]) {
      global.antiMediaGroups[chatId] = { image: false, voice: false, all: false };
    }

    // antimedia all on / off
    if (cmd === "antimedia") {
      if (sub === "on") {
        global.antiMediaGroups[chatId].all = true;
        return await bad.sendMessage(chatId, { text: "✅ AntiMedia (All) চালু করা হয়েছে!" }, { quoted: m });
      } else if (sub === "off") {
        global.antiMediaGroups[chatId].all = false;
        return await bad.sendMessage(chatId, { text: "❌ AntiMedia (All) বন্ধ করা হয়েছে!" }, { quoted: m });
      }
    }

    // antiimage on / off
    if (cmd === "antiimage") {
      if (sub === "on") {
        global.antiMediaGroups[chatId].image = true;
        return await bad.sendMessage(chatId, { text: "✅ AntiImage চালু করা হয়েছে!" }, { quoted: m });
      } else if (sub === "off") {
        global.antiMediaGroups[chatId].image = false;
        return await bad.sendMessage(chatId, { text: "❌ AntiImage বন্ধ করা হয়েছে!" }, { quoted: m });
      }
    }

    // antivoice on / off
    if (cmd === "antivoice") {
      if (sub === "on") {
        global.antiMediaGroups[chatId].voice = true;
        return await bad.sendMessage(chatId, { text: "✅ AntiVoice চালু করা হয়েছে!" }, { quoted: m });
      } else if (sub === "off") {
        global.antiMediaGroups[chatId].voice = false;
        return await bad.sendMessage(chatId, { text: "❌ AntiVoice বন্ধ করা হয়েছে!" }, { quoted: m });
      }
    }

    return await bad.sendMessage(
      chatId,
      {
        text: `📌 *AntiMedia ব্যবহারের নিয়ম:*\n\n👉 All Media: *${prefix}antimedia on / off*\n👉 Image/Video: *${prefix}antiimage on / off*\n👉 Voice/Audio: *${prefix}antivoice on / off*`,
      },
      { quoted: m }
    );
  },

  handleEvent: async (bad, m, { isAdmins, isCreator }) => {
    try {
      if (!m.isGroup || m.key.fromMe || isAdmins || isCreator) return;

      const chatId = m.chat;
      const settings = global.antiMediaGroups[chatId];
      if (!settings) return;

      const isImage = m.mtype === "imageMessage" || m.mtype === "videoMessage";
      const isVoice = m.mtype === "audioMessage";
      const isGif = m.mtype === "videoMessage" && m.message?.videoMessage?.gifPlayback;

      if (
        (settings.all && (isImage || isVoice || isGif)) ||
        (settings.image && isImage) ||
        (settings.voice && isVoice)
      ) {
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
      console.log("AntiMedia Delete Error:", e);
    }
  },
};
