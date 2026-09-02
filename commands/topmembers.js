const fs = require('fs');
const path = require('path');

// মেসেজ কাউন্ট সেভ রাখার ফাইল পাথ
const dataFilePath = path.join(__dirname, '..', 'messageCount.json');

function loadMessageCounts() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading message count JSON:", e);
  }
  return {};
}

function saveMessageCounts(messageCounts) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
  } catch (e) {
    console.error("Error saving message count JSON:", e);
  }
}

function incrementMessageCount(groupId, userId) {
  const messageCounts = loadMessageCounts();

  if (!messageCounts[groupId]) messageCounts[groupId] = {};
  if (!messageCounts[groupId][userId]) messageCounts[groupId][userId] = 0;

  messageCounts[groupId][userId] += 1;
  saveMessageCounts(messageCounts);
}

module.exports = {
  name: "topmembers",
  alias: ["top", "leaderboard"],
  category: "Utility",
  desc: "Shows top members based on message count.",

  // 🔄 প্রতি মেসেজে কাউন্ট বাড়ানোর ইভেন্ট
  handleEvent: async (bad, m) => {
    try {
      if (!m.isGroup || !m.chat || !m.sender) return;
      incrementMessageCount(m.chat, m.sender);
    } catch (e) {
      console.log("TopMembers Counter Error:", e);
    }
  },

  // 🏆 লিডারবোর্ড দেখানোর কমান্ড
  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;

    if (!m.isGroup) {
      return await bad.sendMessage(chatId, { text: '⚠️ এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!' }, { quoted: m });
    }

    const cn = parseInt(args[0]) || 5;
    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};

    const sortedMembers = Object.entries(groupCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, cn);

    if (sortedMembers.length === 0) {
      return await bad.sendMessage(chatId, { text: '⚠️ এখনো কোনো মেসেজ রেকর্ড করা হয়নি!' }, { quoted: m });
    }

    let response = `🏆 *TOP ${sortedMembers.length} ACTIVE MEMBERS*\n\n`;
    sortedMembers.forEach(([userId, count], index) => {
      response += `*${index + 1}.* @${userId.split('@')[0]} ━ 💬 *${count}* msgs\n`;
    });

    response += `\n> *ᥫ᭡⃝—͞𝐅𝐚𝐡𝐢𝐦 𝐁𝐛𝐳ᥫ᭡..࿐🌼⃠*`;

    await bad.sendMessage(
      chatId,
      {
        text: response,
        mentions: sortedMembers.map(([userId]) => userId),
      },
      { quoted: m }
    );
  }
};
