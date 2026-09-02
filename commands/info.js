module.exports = {
  name: "info",
  alias: ["about", "owner", "admininfo"],
  category: "Utilities",
  desc: "Show owner and bot info.",

  exec: async (bad, m, { prefix }) => {
    const chatId = m.chat;

    try {
      // রিয়্যাকশন দেওয়া
      await bad.sendMessage(chatId, { react: { text: '📇', key: m.key } });

      const infoMessage = `
☞𓋜𝐍ꫝ𝐦𝐞: —͞𝐅𝐚𝐡𝐢𝐦 𝐁𝐛𝐳ᥫ𓂃 ࣪˖ ִֶָ
𓋜𝐀𝐠𝐞: 𝟏𝟕+✮⃝🖤
𓋜𝐂𝐥𝐚𝐬𝐬: 𝐇ɪᴅᴇ 𓂃 ࣪˖ ִֶָ✨🌊
𓋜𝐟𝐯𝐭 𝐢𝐦𝐨𝐣𝐢: 🎀🕊️💗 𓂃 ࣪˖ ִֶָ
𓋜𝐅𝐫𝐨𝐦: 𝐒ʏʟʜᴇᴛ𓂃 ࣪˖ ִֶָ📍
𓋜𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧: 𝐈𝐬𝐥𝐚𝐦 𓂃 ࣪˖ ִֶ
╰═════════════╯
╭══──────══╮
  𓋜𝐑𝐥𝐬: 𝘏𝘪𝘥𝘦𓂃
╰══──────══╯
\`\`\`
╭══──────══╮
   ʙᴏᴛ ᴏᴡɴᴇʀ 
  𝐅ꫝнιм ᗷᗷᘔ
╰══──────══╯
\`\`\``;

      // ছবিসহ মেসেজ পাঠানো
      await bad.sendMessage(
        chatId,
        {
          image: { url: "https://i.ibb.co/DHRLgkrY/temp-1783620227039.jpg" },
          caption: infoMessage
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Info Command Error:", error);
      await bad.sendMessage(chatId, { text: '❌ An error occurred while fetching info.' }, { quoted: m });
    }
  }
};
