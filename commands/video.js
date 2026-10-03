const fs = require('fs');
const axios = require('axios');
const path = require('path');
const nayan = require('nayan-media-downloaders');
const Youtube = require('youtube-search-api');

async function downloadVideoFromYoutube(link, filePath) {
  if (!link) throw new Error('Link Not Found');
  const timestart = Date.now();

  try {
    const data = await nayan.ytdown(link);
    const videoUrl = data.data.video;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
      })
        .then((response) => {
          const writer = fs.createWriteStream(filePath);
          response.data
            .pipe(writer)
            .on('finish', () => {
              resolve({
                title: data.data.title,
                timestart,
              });
            })
            .on('error', reject);
        })
        .catch(reject);
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
    name: "video",
    alias: ["v", "ytdl"],
    category: "Media",
    desc: "Search and download video from YouTube",

    exec: async (bad, m, { args, prefix }) => {
        try {
            if (!args.length) {
                return await bad.sendMessage(m.chat, { 
                    text: `» উফফ আবাল কি ভিডিও দেখতে চাস তার ২/১ লাইন তো লেখবি নাকি 🥵\n\n💡 *Example:* ${prefix}video <keyword>` 
                }, { quoted: m });
            }

            const keyword = args.join(' ');
            await bad.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

            // ১. যদি সরাসরি ইউটিউব লিংক দেওয়া হয়
            if (keyword.startsWith('http://') || keyword.startsWith('https://')) {
                const tmpDir = path.join(__dirname, '../cache');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

                const filePath = path.join(tmpDir, `video_${Date.now()}.mp4`);
                const downloadMsg = await bad.sendMessage(m.chat, { text: '⏳ *ডাউনলোড হচ্ছে, একটু অপেক্ষা করুন...*' }, { quoted: m });

                try {
                    const result = await downloadVideoFromYoutube(keyword, filePath);

                    const captionText = `🎬 *Title:* ${result.title}\n⏱️ *Processing Time:* ${Math.floor((Date.now() - result.timestart) / 1000)}s\n\n> 𝘍ᴀʜɪᴍ-𝘝ɪᴅᴇᴏ-ᴅᴏᴡɴʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ`;

                    await bad.sendMessage(m.chat, {
                        video: fs.readFileSync(filePath),
                        caption: captionText,
                        mimetype: 'video/mp4'
                    }, { quoted: m });

                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

                } catch (err) {
                    console.error('Download Error:', err);
                    await bad.sendMessage(m.chat, { text: '❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!' }, { quoted: m });
                }
                return;
            }

            // ২. কিউওয়ার্ড দিয়ে সার্চ করা
            const results = await Youtube.GetListByKeyword(keyword, false, 6);
            if (!results.items || results.items.length === 0) {
                return await bad.sendMessage(m.chat, { text: '❌ কোনো ভিডিও পাওয়া যায়নি!' }, { quoted: m });
            }

            const videoItem = results.items[0]; // প্রথম রেজাল্টটি অটোমেটিক ডাউনলোড করবে
            const selectedLink = `https://www.youtube.com/watch?v=${videoItem.id}`;

            const tmpDir = path.join(__dirname, '../cache');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const filePath = path.join(tmpDir, `video_${Date.now()}.mp4`);
            await bad.sendMessage(m.chat, { text: `🔎 *ভিডিও পাওয়া গেছে:* ${videoItem.title}\n⏳ *ডাউনলোড শুরু হচ্ছে...*` }, { quoted: m });

            const result = await downloadVideoFromYoutube(selectedLink, filePath);

            const captionText = `🎬 *Title:* ${result.title}\n⏱️ *Processing Time:* ${Math.floor((Date.now() - result.timestart) / 1000)}s\n\n> 𝘍ᴀʜɪᴍ-𝘝ɪᴅᴇᴏ-ᴅᴏᴡɴʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ`;

            await bad.sendMessage(m.chat, {
                video: fs.readFileSync(filePath),
                caption: captionText,
                mimetype: 'video/mp4'
            }, { quoted: m });

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            console.error('Video Command Error:', error);
            await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await bad.sendMessage(m.chat, { text: '❌ দুঃখিত, ভিডিও প্রসেস করতে টেকনিক্যাল সমস্যা হয়েছে!' }, { quoted: m });
        }
    }
};
