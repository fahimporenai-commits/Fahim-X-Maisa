// commands/play.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nayan = require("nayan-media-downloaders");
const Youtube = require("youtube-search-api");

module.exports = {
  name: "play",
  alias: ["sing", "song"],
  category: "Media",
  desc: "Play audio directly from YouTube using Nayan API.",

  exec: async (bad, m, { args, prefix }) => {
    const chatId = m.chat;
    const keyword = args.join(" ");

    if (!keyword) {
      return await bad.sendMessage(chatId, {
        text: `⚠️ *গান লেখার নিয়ম:*\nযেমন: *${prefix || '.'}play pal pal*`,
      }, { quoted: m });
    }

    let waitingMsg;
    try {
      // 🔍 ১. গান সার্চ করা
      waitingMsg = await bad.sendMessage(chatId, { text: "🔍 *ইউটিউব থেকে গান খোজা হচ্ছে...*" }, { quoted: m });

      const results = await Youtube.GetListByKeyword(keyword, false, 1);
      if (!results.items || !results.items.length) {
        return await bad.sendMessage(chatId, { edit: waitingMsg.key, text: "❌ কোনো গান পাওয়া যায়নি!" });
      }

      const video = results.items[0];
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      // 🔄 status মেসেজ আপডেট
      await bad.sendMessage(chatId, { edit: waitingMsg.key, text: `🎵 *গান পাওয়া গেছে:* _${video.title}_\n⏳ *নয়ন API থেকে ডাউনলোড করা হচ্ছে...*` });

      // 📥 ২. নয়ন API দিয়ে লিঙ্ক নিয়ে আসা
      const data = await nayan.ytdown(videoUrl);
      const audioUrl = data?.data?.audio || data?.audio;

      if (!audioUrl) throw new Error("Audio link not found in API response");

      // 📂 ৩. সাময়িক ফাইল সেভ
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `play_${Date.now()}.mp3`);

      const response = await axios({
        method: "get",
        url: audioUrl,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 🗑️ ওয়েটিং মেসেজ ডিলিট
      try {
        await bad.sendMessage(chatId, { delete: waitingMsg.key });
      } catch (e) {}

      // 🎶 ৪. অডিও সরাসরি পাঠানো
      await bad.sendMessage(
        chatId,
        {
          audio: fs.readFileSync(filePath),
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`,
          ptt: false,
        },
        { quoted: m }
      );

      // 🧹 টেম্পোরারি ফাইল ক্লিনআপ
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (error) {
      console.error("❌ Play error:", error);
      const errText = "❌ গানটি ডাউনলোড করা সম্ভব হয়নি! আবার চেষ্টা করুন।";
      if (waitingMsg) {
        await bad.sendMessage(chatId, { edit: waitingMsg.key, text: errText });
      } else {
        await bad.sendMessage(chatId, { text: errText }, { quoted: m });
      }
    }
  }
};
