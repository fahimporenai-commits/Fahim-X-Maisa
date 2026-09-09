const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "alldown",
    aliases: ["vd", "download"],
    permission: 0,
    prefix: true,
    description: "Download video from a given URL and send the video file.",
    categorie: "Media",
    usages: [
      "<URL> - Download the video from the provided URL and send it.",
      "download on / download off - Enable or disable auto downloader.",
    ],
  },

  // 🔄 অটো লিঙ্ক ডিটেক্টর (Event Handler)
  event: async ({ event, api, body }) => {
    const { threadId, react } = event;

    // গ্রুপে Auto Download অন আছে কিনা চেক করা
    global.autoDownload = global.autoDownload || {};
    if (!global.autoDownload[threadId]) return;

    if (!body || !body.startsWith("https")) return;

    const url = body.trim();

    try {
      const data = await axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${url}`);

      if (!data.data || !data.data.data) {
        await react("❌");
        await api.sendMessage(threadId, { text: "Failed to fetch video details. Please check the URL and try again." });
        return;
      }

      const videoDetails = data.data.data;
      const lowQualityVideo = videoDetails.low;
      const videoFileName = path.join(__dirname, `temp_video_${Date.now()}.mp4`);

      const videoStream = await axios({
        url: lowQualityVideo,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(videoFileName);
      videoStream.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await react("✔️");
          
          // 🔥 ডায়নামিক টাইটেল এবং ডায়নামিক হ্যাসট্যাগ ডায়ালগ
          const hashtags = videoDetails.hashtag || videoDetails.tags || "#video #foryou";
          const customCaption = `╭━━━【 𝘍ᴀʜɪᴍ-ᴅᴏᴡɴʟᴏᴅᴇʀ-ʙᴏᴛ 】━━━┈⊷\n     _*╭ᴠɪᴅᴇᴏ ᴅᴇᴛᴀɪʟꜱ:*_\n_*╭ᴛɪᴛʟᴇ:*_ ${videoDetails.title || 'No Title'}\n\n*╭ʜᴀꜱᴛᴀɢ:* ${hashtags} \n┃ \n╰━━━━━━━━━━━━━━━━┈⊷\n> *_©Fahim Bbz_*`;

          await api.sendMessage(threadId, {
            video: { stream: fs.createReadStream(videoFileName) },
            caption: customCaption,
          });

          fs.unlink(videoFileName, (err) => {
            if (err) console.error(`Failed to delete file ${videoFileName}:`, err);
          });
        } catch (sendError) {
          console.error("Error sending video:", sendError);
        }
      });

      writer.on("error", async (error) => {
        console.error("Error writing video file:", error);
        await api.sendMessage(threadId, { text: "An error occurred while downloading the video. Please try again." });
      });
    } catch (error) {
      console.error("Error fetching video details:", error);
      await api.sendMessage(threadId, { text: "An error occurred while fetching the video. Please try again." });
    }
  },

  // ⚙️ ম্যানুয়াল কমান্ড ও অন/অফ সিস্টেম (Command Handler)
  start: async ({ api, event, args }) => {
    const { threadId, react } = event;
    global.autoDownload = global.autoDownload || {};

    const action = args[0]?.toLowerCase();

    // 🟢 ON System
    if (action === "on") {
      if (global.autoDownload[threadId]) {
        return api.sendMessage(threadId, { text: "⚠️ Auto Downloader আগে থেকেই চালু আছে!" });
      }
      global.autoDownload[threadId] = true;
      return api.sendMessage(threadId, { text: "🟢 *AUTO DOWNLOADER ACTIVATED*\n\nএখন লিঙ্ক পাঠালেই স্বয়ংক্রিয়ভাবে ভিডিও ডাউনলোড হয়ে যাবে।" });
    } 
    
    // 🔴 OFF System
    if (action === "off") {
      if (!global.autoDownload[threadId]) {
        return api.sendMessage(threadId, { text: "⚠️ Auto Downloader বন্ধই আছে!" });
      }
      global.autoDownload[threadId] = false;
      return api.sendMessage(threadId, { text: "🔴 *AUTO DOWNLOADER DEACTIVATED*\n\nঅটো ডাউনলোড সার্ভিস বন্ধ করা হয়েছে।" });
    }

    // 📥 ম্যানুয়াল লিঙ্ক দিয়ে ডাউনলোডের জন্য
    if (!args[0] || !args[0].startsWith("http")) {
      await api.sendMessage(threadId, { text: `Please provide a valid URL or option.\n\n👉 Usage:\n.alldown <URL>\n.alldown on\n.alldown off` });
      return;
    }

    const url = args[0];

    try {
      const data = await axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${url}`);

      if (!data.data || !data.data.data) {
        await react("❌");
        await api.sendMessage(threadId, { text: "Failed to fetch video details. Please check the URL and try again." });
        return;
      }

      const videoDetails = data.data.data;
      const lowQualityVideo = videoDetails.low;
      const videoFileName = path.join(__dirname, `temp_video_${Date.now()}.mp4`);

      const videoStream = await axios({
        url: lowQualityVideo,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(videoFileName);
      videoStream.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await react("✔️");
          
          // 🔥 ডায়নামিক টাইটেল এবং ডায়নামিক হ্যাসট্যাগ ডায়ালগ
          const hashtags = videoDetails.hashtag || videoDetails.tags || "#video #foryou";
          const customCaption = `╭━━━【 𝘍ᴀʜɪᴍ-ᴅᴏᴡɴʟᴏᴅᴇʀ-ʙᴏᴛ 】━━━┈⊷\n     _*╭ᴠɪᴅᴇᴏ ᴅᴇᴛᴀɪʟꜱ:*_\n_*╭ᴛɪᴛʟᴇ:*_ ${videoDetails.title || 'No Title'}\n\n*╭ʜᴀꜱᴛᴀɢ:* ${hashtags} \n┃ \n╰━━━━━━━━━━━━━━━━┈⊷\n> *_©Fahim Bbz_*`;

          await api.sendMessage(threadId, {
            video: { stream: fs.createReadStream(videoFileName) },
            caption: customCaption,
          });

          fs.unlink(videoFileName, (err) => {
            if (err) console.error(`Failed to delete file ${videoFileName}:`, err);
          });
        } catch (sendError) {
          console.error("Error sending video:", sendError);
        }
      });

      writer.on("error", async (error) => {
        console.error("Error writing video file:", error);
        await api.sendMessage(threadId, { text: "An error occurred while downloading the video. Please try again." });
      });
    } catch (error) {
      console.error("Error fetching video details:", error);
      await api.sendMessage(threadId, { text: "An error occurred while fetching the video. Please try again." });
    }
  },
};
