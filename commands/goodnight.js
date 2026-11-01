// commands/goodnight.js - FAHIM BBZ

module.exports = {
  name: "goodnight",
  alias: ["gn", "gcof", "groupclose", "close"],
  category: "Moderation",
  desc: "Send custom refresh message and auto-close group with Normal or Funny Good Night card.",

  exec: async (bad, m, { args, prefix, isAdmins, isCreator }) => {
    try {
      if (!m.isGroup) return await bad.sendMessage(m.chat, { text: "❌ Ei command shudhu group-er jonno proyojjo!" }, { quoted: m });
      if (!isAdmins && !isCreator) return await bad.sendMessage(m.chat, { text: "⚠️ Ei command use korte hole admin hote hobe!" }, { quoted: m });

      const mode = args[0]?.toLowerCase();
      const isFunny = mode === "funny" || mode === "fun";

      // ───── Refresh Spacing Messages ─────
      const refreshFunny = `🤪 𝗙𝗨𝗡𝗡𝗬 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 🤪











💥 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 💥











😴 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 😴


















💤 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 💤













🐕 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 🐕











👀 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 👀 











💤 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 💤                \n\n🔄 *Refreshing funny group messages...*`;

      const refreshNormal = `𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 











𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 











𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛


















𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 













𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 











𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛 











𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗙𝗥𝗘𝗦𝗛                \n\n🔄 *Refreshing group messages...*`;

      // ───── Main Cards Design ─────
      const funnyCard = `🔒 *Group Closed*

╭─────────────────╮
│ ✮͢⃟≛⃝≛⃝𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭 𝐈𝐧𝐭𝐫𝐨⃟≛⃝ ⃟≛⃝✮
│╭─────── ♡ ───────
││♡ ➤ *কুত্তার চোখে জ্বল* 🐕💦
││
││♡ ➤ *𝙶𝚘𝚘𝚍 𝚗𝚒𝚐𝚑𝚝 𝚊𝚕𝚕* 😴
││
││♡ ➤ *বউ থাকলে চুমাও* 😘
││
││♡ ➤ *𝙽𝚊 𝚝𝚑𝚊𝚔𝚕𝚎 𝚐𝚑𝚞𝚖𝚊𝚠* 😴
││
││♡ ➤ *জামাই থাকলে চুমাও* 💋
││
││♡ ➤ *𝙽𝚊 𝚝𝚑𝚊𝚔𝚕𝚎 𝚐𝚑𝚞𝚖𝚊𝚠* 😂
││
││♡ ➤ *গাইস বউ নাই কপালে* 🤦‍♂️
││
││♡ ➤ *𝚔𝚘𝚝𝚑𝚊 𝚑𝚘𝚋𝚎 𝚜𝚘𝚔𝚊𝚕𝚎* 🥰
│╰────────────────
│╰➤ 𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 🥰
│╰➤ 𝐆𝐫𝐨𝐮𝐩 : 𝐎𝐟𝐟 ❌
│╰➤ 𝐆𝐫𝐨𝐮𝐩 : 𝐎𝐧 ✅
│╰➤ 𝐎𝐩𝐞𝐧 𝐓𝐢𝐦𝐞 : 𝐀𝐝𝐦𝐢𝐧 𝐚𝐬𝐥𝐞
│
│🥰 𝐓𝐡𝐚𝐧𝐤𝐬 𝐘𝐨𝐮 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 🥰
♡─────────────────♡`;

      const normalCard = `🔒 *Group Closed*

🕋 — 𝐀ꜱꜱᴀʟᴀᴍᴜ 𝐀ʟᴀɪᴋᴜᴍ 𝐄ᴠᴇʀʏᴏ𝐧ᴇ 🤍✨
 
🌚 𝐆ʀᴏᴜ 𝐏𝐎ꜰꜰ 𝐅ᴏʀ 𝐍ɪɢʜᴛ 🚫
 
🕰️ — 𝐎ᴩᴇɴ 𝐓ɪᴍᴇ: 𝐌ᴏʀɴɪɢ -𝟷𝟶:𝟶𝟶 🤍

💫 𝐀ʟʟᴀʜ 𝐇ᴀꜰᴇᴢ 𝐄ᴠᴇʀʏᴏ𝐧ᴇ 🤲🏻🫧
 
— 𝘎ᴏᴏᴅ ɴɪɢʜᴛ ᴇᴠʀʏᴏɴᴇ 
 
* ᴩᴏᴡᴇʀᴅ ʙʏ ꜰᴀʜɪᴍ ʙᴏᴛ`;

      // 1. Prothome Refresh Message Send
      await bad.sendMessage(m.chat, { text: isFunny ? refreshFunny : refreshNormal }, { quoted: m });

      // 2. 1.5 Second Wait Kora
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Group Close Kora
      try {
        await bad.groupSettingUpdate(m.chat, 'announcement');
      } catch (err) {
        console.log("Group settings update error:", err);
      }

      // 4. Main Announcement Card Send
      await bad.sendMessage(m.chat, { text: isFunny ? funnyCard : normalCard });

    } catch (e) {
      console.error("Goodnight Command Error:", e);
      await bad.sendMessage(m.chat, { text: "❌ Kono ekta error hoyeche!" }, { quoted: m });
    }
  },
};
