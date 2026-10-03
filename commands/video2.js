const axios = require("axios");

module.exports = {
    name: "video2",
    alias: ["album", "v2"],
    category: "Media",
    desc: "Fetch random category videos from API",

    exec: async (bad, m, { args, prefix }) => {
        try {
            const menuMsg = `====「 𝐕𝐈𝐃𝐄𝐎 𝐀𝐋𝐁𝐔𝐌 」====\n━━━━━━━━━━━━━
𝟙. 𝐋𝐎𝐕𝐄 𝐕𝐈𝐃𝐄𝐎 💞
𝟚. 𝐂𝐎𝐔𝐏𝐋𝐄 𝐕𝐈𝐃𝐄𝐎 💕
𝟛. 𝐒𝐇𝐎𝐑𝐓 𝐕𝐈𝐃𝐄𝐎 📽
𝟜. 𝐒𝐀𝐃 𝐕𝐈𝐃𝐄𝐎 😔
𝟝. 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐃𝐄𝐎 📝
𝟞. 𝐒𝐇𝐀𝐈𝐑𝐈
𝟟. 𝐁𝐀𝐁𝐘 𝐕𝐈𝐃𝐄𝐎 😻
𝟠. 𝐀𝐍𝐈𝐌𝐄 𝐕𝐈𝐃𝐄𝐎
𝟡. 𝐇𝐔𝐌𝐀𝐈𝐘𝐔𝐍 𝐅𝐎𝐑𝐈𝐃 𝐒𝐈𝐑 ❄
𝟙𝟘. 𝐈𝐒𝐋𝐀𝐌𝐈𝐊 𝐕𝐈𝐃𝐄𝐎 🤲

===「 𝟏𝟖+ 𝐕𝐈𝐃𝐄𝐎 」===
━━━━━━━━━━━━━
𝟙𝟙. 𝐇𝐎𝐑𝐍𝐘 𝐕𝐈𝐃𝐄𝐎 🥵
𝟙𝟚. 𝐇𝐎𝐓 🔞
𝟙𝟛. 𝐈𝐓𝐄𝐌

👉 Reply to this message with a category number (1-13).`;

            // Menu message
            return await bad.sendMessage(m.chat, { text: menuMsg }, { quoted: m });

        } catch (error) {
            console.error("Video2 Menu Error:", error);
            return await bad.sendMessage(m.chat, { text: "❌ Failed to open video menu!" }, { quoted: m });
        }
    },

    // Reply Handler for choice processing
    handleReply: async (bad, m, { prefix }) => {
        try {
            const choice = m.text ? m.text.trim() : "";
            
            if (!choice || isNaN(choice) || parseInt(choice) < 1 || parseInt(choice) > 13) {
                return await bad.sendMessage(m.chat, { 
                    text: "⚠️ Invalid choice! Please reply with a number between 1 and 13." 
                }, { quoted: m });
            }

            await bad.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

            // Fetch API URL
            const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json");
            const baseUrl = apis.data.api;

            const options = {
                "1": "/video/love",
                "2": "/video/cpl",
                "3": "/video/shortvideo",
                "4": "/video/sadvideo",
                "5": "/video/status",
                "6": "/video/shairi",
                "7": "/video/baby",
                "8": "/video/anime",
                "9": "/video/humaiyun",
                "10": "/video/islam",
                "11": "/video/horny",
                "12": "/video/hot",
                "13": "/video/item"
            };

            const targetUrl = `${baseUrl}${options[choice]}`;
            const res = await axios.get(targetUrl);

            const videoUrl = res.data.data;
            const categoryName = res.data.nayan || "Video Album";
            const totalCount = res.data.count || 0;

            if (!videoUrl) {
                return await bad.sendMessage(m.chat, { text: "❌ Could not fetch video link!" }, { quoted: m });
            }

            const captionText = `🎬 *Category:* ${categoryName}\n📊 *Total Videos:* ${totalCount}\n\n𝘍ᴀʜɪᴍ-𝘝ɪᴅᴇᴏ-ᴅᴏᴡɴʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ\n—͞𝐅𝐚𝐡𝐢𝐦 𝐁𝐛𝐳ᥫ᭡`;

            await bad.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: captionText,
                mimetype: "video/mp4"
            }, { quoted: m });

            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            console.error("Video2 Reply Error:", error);
            await bad.sendMessage(m.chat, { 
                text: "❌ Failed to download or send video. Try again later!" 
            }, { quoted: m });
        }
    }
};
