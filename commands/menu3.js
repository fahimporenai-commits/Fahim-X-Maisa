const fs = require("fs");
const path = require("path");
const os = require("os");

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

// আপটাইম ফরম্যাটিং
const runtime = (secs) => {
  const pad = (s) => s.toString().padStart(2, "0");
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
};

const readMore = String.fromCharCode(8206).repeat(4001);

function getAliases(cmd) {
  const raw = cmd.alias || cmd.aliases || [];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

// ✅ Location + buttons menu sender (CTA URL Direct Redirect Buttons)
async function sendMenuLocationButtons(bad, from, botPic, botName, menuText) {
  let thumb = Buffer.alloc(0);
  try {
    const response = await fetch(botPic);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    thumb = Buffer.from(arrayBuffer);
  } catch (e) {
    console.error("[Menu Loc] thumbnail error:", e.message);
  }

  await bad.relayMessage(
    from,
    {
      buttonsMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "☺️ Owner",
              url: "https://wa.me/8801719298647",
              merchant_url: "https://wa.me/8801719298647"
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "📢 Channel",
              url: "https://whatsapp.com/channel/0029VbDLv0h1dAw6SRSiPr30",
              merchant_url: "https://whatsapp.com/channel/0029VbDLv0h1dAw6SRSiPr30"
            })
          }
        ],
        contentText: menuText,
        footerText: "Made with love by Fahim Bbz",
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          statusAttributions: [],
        },
        headerType: 6,
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0,
          name: `${botName} • Active`,
          address: "Type .menu3 [cmd] for details",
          jpegThumbnail: thumb,
        },
        viewOnce: true,
      },
    },
    {
      additionalNodes: [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: { type: "native_flow", v: "1" },
              content: [
                { tag: "native_flow", attrs: { v: "9", name: "mixed" } },
              ],
            },
          ],
        },
      ],
    },
  );
}

module.exports = {
  name: "menu3",
  alias: ["help3", "menu", "help"],
  category: "Utility",
  desc: "Displays all available commands with a thin stylish border layout.",

  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;
    const usedPrefix = prefix || '.';
    const userName = m.pushName || "User";
    const botName = "╳-♡ Fahim Bot ♡🫶🏻❤️‍🩹";
    const BOT_PIC_URL = "https://i.postimg.cc/nhhkfckZ/IMG-6279.jpg";

    const usedGB = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
    const totGB = (os.totalmem() / 1073741824).toFixed(2);
    const ram = `${usedGB} / ${totGB} GB`;
    const uptime = runtime(process.uptime());

    const currentTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true
    });
    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric"
    });

    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const loadedCommands = [];

    for (const file of commandFiles) {
      try {
        delete require.cache[require.resolve(path.join(commandsDir, file))];
        const cmd = require(path.join(commandsDir, file));
        if (cmd && cmd.name) {
          loadedCommands.push({
            command: cmd.name,
            aliases: getAliases(cmd),
            description: cmd.desc || cmd.description || "",
            category: cmd.category || "Uncategorized"
          });
        }
      } catch (err) {
        console.error(`Error loading command file ${file}:`, err);
      }
    }

    const categories = {};
    loadedCommands.forEach((cmd) => {
      let cat = cmd.category || "Uncategorized";
      if (!cat.includes(" ")) {
        if (cat.toLowerCase() === "moderation") cat = "👥 𝗚𝗥𝗢𝗨𝗣 𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡";
        else if (cat.toLowerCase() === "downloader" || cat.toLowerCase() === "media") cat = "🎬 𝗠𝗘𝗗𝗜𝗔 & 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗";
        else if (cat.toLowerCase() === "utility" || cat.toLowerCase() === "utilities") cat = "🧰 𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦";
        else cat = `📦 ${cat.toUpperCase()}`;
      }

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    });

    if (args[0]) {
      const searchCmd = args[0].toLowerCase();
      const command = loadedCommands.find(cmd => 
        cmd.command.toLowerCase() === searchCmd || 
        (cmd.aliases && cmd.aliases.includes(searchCmd))
      );

      if (command) {
        const infoText = `╭───────────────╮
│  ✨ COMMAND INFO ✨
├───────────────┤
│ ◈ Name: ${command.command}
│ ◈ Aliases: ${command.aliases.length ? command.aliases.join(", ") : "None"}
│ ◈ Desc: ${command.description || "No description"}
│ ◈ Category: ${command.category}
╰───────────────╯`;
        return await bad.sendMessage(chatId, { text: infoText }, { quoted: m });
      } else {
        return await bad.sendMessage(chatId, { text: `⚠️ Command not found: "${args[0]}"` }, { quoted: m });
      }
    }

    // ───── THIN & SLEEK BORDER DESIGN ─────
    let _cmd_st = `╭────────𝄟 💗 𝄟────────╮
     ✨ ${botName} ✨
╰────────𝄟 💗 𝄟────────╯
╭───────────────────────╮
│ 💋 𝐔ꜱᴇʀ     : ${userName}
│ 🐍 𝐏ʀᴇꜰɪx  : \`${usedPrefix}\`
│ 😎 𝐔ᴩᴛɪᴍᴇ  : ${uptime}
│ 😒 𝐑ᴀᴍ     : ${ram}
│ 🚫 𝐓ɪᴍᴇ    : ${currentTime}
│ 🥳 𝐓ᴏᴛᴀ𝙡 ᴄᴍᴅ : ${loadedCommands.length}
│ ♨️ 𝐏ᴀɪʀ     : https://t.me/xmd_fahim_bot
╰───────────────────────╯
${readMore}`;

    const sortedCategories = Object.keys(categories).sort();
    for (const category of sortedCategories) {
      const cmdList = categories[category]
        .map(cmd => `│ ➥ ${usedPrefix}${stylishFont(cmd.command)}`)
        .join("\n");

      _cmd_st += `\n\n╭───❖ ${category} ❖───╮\n${cmdList}\n╰───────────────────────╯`;
    }

    _cmd_st += `\n\n╭───────────────────────╮\n  💡 *Type ${usedPrefix}menu3 [cmd] for info* \n╰───────────────────────╯\n\n_⚡ Powered by Fahim Bbz_`;

    await sendMenuLocationButtons(
      bad,
      chatId,
      BOT_PIC_URL,
      botName,
      _cmd_st,
    );
  }
};
