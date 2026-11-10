const fs = require("fs");
const path = require("path");
const os = require("os");

// আপটাইম ফরম্যাটিং
const runtime = (secs) => {
  const pad = (s) => s.toString().padStart(2, "0");
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
};

const readMore = String.fromCharCode(8206).repeat(4001);

// Aliases ক্লিন করার জন্য
function getAliases(cmd) {
  const raw = cmd.alias || cmd.aliases || [];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

// ✅ Location + buttons menu sender (Owner & Bot buttons)
async function sendMenuLocationButtons(bad, from, botPic, botName, menuText) {
  let thumb = Buffer.alloc(0);
  try {
    const response = await fetch(botPic);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    thumb = buffer;
  } catch (e) {
    console.error("[Menu Loc] thumbnail error:", e.message);
  }

  await bad.relayMessage(
    from,
    {
      buttonsMessage: {
        buttons: [
          {
            buttonId: ".owner",
            buttonText: { displayText: "Owner" },
            type: 1,
          },
          {
            buttonId: ".bot",
            buttonText: { displayText: "Bot" },
            type: 1,
          },
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
          name: `${botName} • Online`,
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
  desc: "Displays all available commands with bottom buttons style.",

  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;
    const usedPrefix = prefix || '.';
    const userName = m.pushName || "User";
    const botName = "╳-♡ Fahim Bot ♡🫶🏻❤️‍🩹";
    const BOT_PIC_URL = "https://i.postimg.cc/nhhkfckZ/IMG-6279.jpg";

    // সিস্টেম ইনফো
    const usedGB = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
    const totGB = (os.totalmem() / 1073741824).toFixed(2);
    const ram = `${usedGB} / ${totGB} GB`;
    const uptime = runtime(process.uptime());

    // টাইম এবং ডেট
    const currentTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true
    });
    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric"
    });

    // ───── `commands` ফোল্ডার থেকে অটোমেটিক কমান্ড রিড করা ─────
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

    // ক্যাটাগরি অনুযায়ী সাজানো
    const grouped = {};
    loadedCommands.forEach((cmd) => {
      let pkg = (cmd.category || "Uncategorized").toLowerCase();
      if (pkg === "moderation") pkg = "👥 𝗚𝗥𝗢𝗨𝗣 𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡";
      else if (pkg === "downloader" || pkg === "media") pkg = "🎬 𝗠𝗘𝗗𝗜𝗔 & 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗";
      else if (pkg === "utility" || pkg === "utilities") pkg = "🧰 𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦";
      else pkg = `📦 ${pkg.toUpperCase()}`;

      if (!grouped[pkg]) grouped[pkg] = [];
      grouped[pkg].push(cmd);
    });

    // ───── SINGLE COMMAND INFO ─────
    if (args[0]) {
      const searchCmd = args[0].toLowerCase();
      const command = loadedCommands.find(cmd => 
        cmd.command.toLowerCase() === searchCmd || 
        (cmd.aliases && cmd.aliases.includes(searchCmd))
      );

      if (command) {
        const infoText = `╭═════════════════════╮
  ✨ *𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢* ✨
╰═════════════════════╯
 ◈ *𝗡𝗮𝗺𝗲:* ${command.command}
 ◈ *𝗔𝗹𝗶𝗮𝘀𝗲𝘀:* ${command.aliases.length ? command.aliases.join(", ") : "None"}
 ◈ *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:* ${command.description || "No description provided"}
 ◈ *𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆:* ${command.category}
 ◈ *𝗖𝗿𝗲𝗱𝗶𝘁𝘀:* Fahim Bbz
╰═════════════════════╯`;
        return await bad.sendMessage(chatId, { text: infoText }, { quoted: m });
      } else {
        return await bad.sendMessage(chatId, { text: `⚠️ No command found named "${args[0]}".` }, { quoted: m });
      }
    }

    // ───── MAIN MENU TEXT (Bottom mode design) ─────
    let _cmd_st = `*╭══ ${botName}*
*┃🫢 🆁︎ᴜɴ     :* ${uptime}
*┃🫀 ᵐᴏᴅᴇ    :* PUBLIC ❤️‍🩹
*┃😒 𝘗ʀᴇғɪx  :* ${usedPrefix}
*┃😀 𝗥ᴀᴍ     :* ${ram}
*┃🌿 𝘛ɪᴍᴇ    :* ${currentTime}
*┃🫦 𝐔sᴇʀ    :* ${userName}
*┃💗 ραιʀ   :* https://t.me/fahim_md_bot1
*╰════════════⊷*
${readMore}
*♡︎•━━━Fahim Bbz━━━•♡*`;

    const categories = Object.keys(grouped).sort();
    for (const cat of categories) {
      _cmd_st += `\n\n*╭────❒ ${cat} ❒*\n`;
      grouped[cat]
        .sort((a, b) => a.command.localeCompare(b.command))
        .forEach((entry) => {
          _cmd_st += ` *├◈ ${usedPrefix}${entry.command}*\n`;
        });
      _cmd_st += ` *┕─────────────❒*`;
    }

    _cmd_st += `\n\n*♡︎•━━━Powered by Fahim━━━•♡*`;

    // ✅ Send Location + Bottom Buttons Menu (Only Owner & Bot)
    await sendMenuLocationButtons(
      bad,
      chatId,
      BOT_PIC_URL,
      botName,
      _cmd_st,
    );
  }
};
