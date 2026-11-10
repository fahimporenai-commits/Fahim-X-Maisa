const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/voices.json");

function loadVoices() {
  try {
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveVoices(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "voice",
  alias: ["f", "audiocmd", "autovoice"],

  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;
    const action = args[0]?.toLowerCase();
    const keyword = args[1]?.toLowerCase();
    const voices = loadVoices();

    if (action === "add") {
      const quoted = m.quoted ? m.quoted : m;
      const mime = quoted.msg?.mimetype || quoted.mimetype || "";
      
      if (!mime.includes("audio") && !mime.includes("video")) {
        return await bad.sendMessage(chatId, { text: `⚠️ Kono audio ba voice file-e reply korun!\n\n👉 *Usage:* \`${prefix}voice add [keyword]\`` }, { quoted: m });
      }

      if (!keyword) {
        return await bad.sendMessage(chatId, { text: `⚠️ Ekti keyword ba name din!\n👉 *Example:* \`${prefix}voice add vaiya\`` }, { quoted: m });
      }

      try {
        const mediaBuffer = await quoted.download();
        const fileName = `${keyword}.mp3`;
        const audioDir = path.join(__dirname, "../database/media_voices/");
        
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        const filePath = path.join(audioDir, fileName);
        fs.writeFileSync(filePath, mediaBuffer);

        // Save relative or absolute safe path
        voices[keyword] = `database/media_voices/${fileName}`;
        saveVoices(voices);

        return await bad.sendMessage(chatId, { text: `✅ Success! "${keyword}" voice-ti successfully save hoyeche! 🎉` }, { quoted: m });
      } catch (e) {
        console.error("Voice Add Error:", e);
        return await bad.sendMessage(chatId, { text: "❌ Audio save korte giye somossa hoyeche!" }, { quoted: m });
      }
    } 
    
    else if (action === "delete" || action === "del") {
      if (!keyword) return await bad.sendMessage(chatId, { text: `⚠️ Je keyword-ti delete korte chan ta likhun!` }, { quoted: m });

      if (!voices[keyword]) {
        return await bad.sendMessage(chatId, { text: `⚠️ "${keyword}" namer kono voice nei!` }, { quoted: m });
      }

      try {
        const storedPath = path.join(__dirname, "../", voices[keyword]);
        if (fs.existsSync(storedPath)) {
          fs.unlinkSync(storedPath);
        }
        delete voices[keyword];
        saveVoices(voices);
        return await bad.sendMessage(chatId, { text: `🗑️ "${keyword}" voice-ti delete kora hoyeche!` }, { quoted: m });
      } catch (e) {
        return await bad.sendMessage(chatId, { text: "❌ Delete korte problem hoyeche!" }, { quoted: m });
      }
    } 
    
    else if (action === "list") {
      const keys = Object.keys(voices);
      if (keys.length === 0) {
        return await bad.sendMessage(chatId, { text: "📂 Ekhono kono voice save kora hoyni!" }, { quoted: m });
      }

      let listText = `🎙️ *SAVED VOICE LIST* 🎙️\n\n`;
      keys.forEach((k, index) => {
        listText += `*${index + 1}.* \`${k}\`\n`;
      });

      return await bad.sendMessage(chatId, { text: listText }, { quoted: m });
    } 
    
    else {
      return await bad.sendMessage(
        chatId,
        {
          text: `📌 *VOICE MENU:*\n👉 \`${prefix}voice add [keyword]\`\n👉 \`${prefix}voice delete [keyword]\`\n👉 \`${prefix}voice list\``,
        },
        { quoted: m }
      );
    }
  },

  handleEvent: async (bad, m) => {
    try {
      if (!m.text) return;
      const text = m.text.toLowerCase().trim();
      const voices = loadVoices();
      const keys = Object.keys(voices);

      if (keys.length === 0) return;

      for (const key of keys) {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (text === key || regex.test(text)) {
          const relativePath = voices[key];
          // Correct absolute path mapping for container
          const absolutePath = path.join(__dirname, "../", relativePath);

          if (fs.existsSync(absolutePath)) {
            const audioBuffer = fs.readFileSync(absolutePath);
            await bad.sendMessage(
              m.chat,
              {
                audio: audioBuffer,
                mimetype: "audio/mp4",
                ptt: true,
              },
              { quoted: m }
            );
            break;
          }
        }
      }
    } catch (e) {
      console.error("Voice Event Error:", e);
    }
  },
};
