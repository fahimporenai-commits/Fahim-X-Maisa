const fs = require("fs");
const path = require("path");

// ─── কিউট স্মল-ক্যাপস ফন্ট কনভার্টার ───
function stylishFont(text) {
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ',
    'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
    'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
    'y': 'ʏ', 'z': 'ᴢ',
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return text.toLowerCase().split('').map(char => fonts[char] || char).join('');
}

module.exports = {
  name: "menu3",
  alias: ["help3", "menu", "help"],
  category: "Utility",
  desc: "Displays all available commands.",

  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;
    const usedPrefix = prefix || '.';

    // ───── `commands` ফোল্ডার থেকে অটোমেটিক সব ফাইল/কমান্ড রিড করা ─────
    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const loadedCommands = [];

    for (const file of commandFiles) {
      try {
        // ক্যাশ ক্লিয়ার করা যাতে লাইভ আপডেট হয়
        delete require.cache[require.resolve(path.join(commandsDir, file))];
        const cmd = require(path.join(commandsDir, file));
        if (cmd && cmd.name) {
          loadedCommands.push(cmd);
        }
      } catch (err) {
        console.error(`Error loading command file ${file}:`, err);
      }
    }

    // ───── SINGLE COMMAND INFO ─────
    if (args[0]) {
      const searchCmd = args[0].toLowerCase();
      const command = loadedCommands.find(cmd => 
        cmd.name.toLowerCase() === searchCmd || 
        (cmd.alias && cmd.alias.includes(searchCmd))
      );

      if (command) {
        const infoText = `╭══──────══╮
  ✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ✨
╰══──────══╯
 🦋 *𝗡𝗮𝗺𝗲:* ${command.name}
 🦋 *𝗔𝗹𝗶𝗮𝘀𝗲𝘀:* ${command.alias ? command.alias.join(", ") : "None"}
 🦋 *𝗗𝗲𝘀𝗰??𝗶𝗽𝘁𝗶𝗼𝗻:* ${command.desc || "No description provided"}
 🦋 *𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆:* ${command.category || "Uncategorized"}
 🦋 *𝗖??𝗲𝗱𝗶𝘁𝘀:* Fahim Bbz
╭══──────══╮`;
        return await bad.sendMessage(chatId, { text: infoText }, { quoted: m });
      } else {
        return await bad.sendMessage(chatId, { text: `⚠️ No command found named "${args[0]}".` }, { quoted: m });
      }
    }

    // টাইম এবং ডেট ফরম্যাটিং (Dhaka Timezone)
    const currentTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true
    });

    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric"
    });

    // ক্যাটাগরি অনুযায়ী অটো সাজানো
    const categories = {};
    loadedCommands.forEach((cmd) => {
      let cat = cmd.category || "Uncategorized";
      if (!cat.includes(" ")) {
        // ইমোজি না থাকলে অটো ক্যাটাগরি স্টাইলিং
        if (cat.toLowerCase() === "moderation") cat = "👥 𝗚𝗥??𝗨𝗣 𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡";
        else if (cat.toLowerCase() === "downloader") cat = "🎬 𝗠𝗘??𝗜𝗔 & 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗";
        else if (cat.toLowerCase() === "utility" || cat.toLowerCase() === "utilities") cat = "🧰 𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦";
        else cat = `📦 ${cat.toUpperCase()}`;
      }

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    });

    // ───── MAIN HELP MENU DESIGN ─────
    let responseText = `╭════════𝄟 💗 𝄟════════╮
       ✨ 𝗙𝗔𝗛𝗜𝗠 𝗕𝗢𝗧 ✨
╰════════𝄟 💗 𝄟════════╯
│ 🕊️ *𝙊𝙬𝙣𝙚𝙧:* Fahim Bbz
│ 🔪 *𝙋𝙧𝙚𝙛𝙞𝙭:* \`${usedPrefix}\`
│ 🐝 *𝙏𝙤𝙩𝙖𝙡 𝘾𝙢𝙙𝙨:* ${loadedCommands.length}
│ 🕒 *𝙏𝙞𝙢𝙚:* ${currentTime}
│ 📅 *𝘿𝙖𝙩𝙚:* ${currentDate}
╰═══════════════════════╯`;

    for (const category in categories) {
      const cmdList = categories[category]
        .map(cmd => `> ⎯͢✧ ${usedPrefix}${stylishFont(cmd.name)}`)
        .join("\n");

      responseText += `\n\n*╭──❒ ${category} ❒*\n${cmdList}\n*╰───────────────────❒*`;
    }

    responseText += `\n\n╭═══════════════════════╮\n  💡 *Type ${usedPrefix}menu3 [cmd] for details* \n╰═══════════════════════╯\n\n_Made with ©ꜰᴀʜɪᴍ ʙʙᴢ_`;

    const menuImgUrl = "https://i.postimg.cc/nhhkfckZ/IMG-6279.jpg";

    try {
      await bad.sendMessage(chatId, {
        image: { url: menuImgUrl },
        caption: responseText
      }, { quoted: m });
    } catch (e) {
      console.error("Menu Image Error:", e);
      await bad.sendMessage(chatId, { text: responseText }, { quoted: m });
    }
  }
};
