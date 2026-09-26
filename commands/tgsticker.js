const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ⏳ ৪ সেকেন্ড ডিলে
const delay = time => new Promise(res => setTimeout(res, time));

module.exports = {
    name: "tgsticker",
    alias: ["tg", "telegramsticker"],
    category: "Sticker",
    desc: "Telegram sticker pack to WhatsApp stickers downloader",

    exec: async (bad, m, { args, prefix }) => {
        if (!args[0]) {
            return await bad.sendMessage(m.chat, { 
                text: `⚠️ ওরে ভাই, টেলিগ্রাম স্টিকার প্যাকের লিংক তো দেন নাই!\n\n💡 *ব্যবহার:* \n*${prefix}tgsticker https://t.me/addstickers/PackName*` 
            }, { quoted: m });
        }

        if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
            return await bad.sendMessage(m.chat, { 
                text: '❌ ভাই, লিংকটা সঠিক নয়! এটা কোনো অফিশিয়াল টেলিগ্রাম স্টিকার লিংক না।' 
            }, { quoted: m });
        }

        const packName = args[0].replace("https://t.me/addstickers/", "").trim();
        const botToken = '8873471210:AAEWiafrCcGwuXBDuawa0HkgtHm-U7weL7k';

        try {
            await bad.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const response = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`);
            const stickerSet = response.data;
            
            if (!stickerSet.ok || !stickerSet.result) {
                await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return await bad.sendMessage(m.chat, { text: '❌ স্টিকার প্যাকটি পাওয়া যায়নি বা লিংকটি ভুল!' }, { quoted: m });
            }

            const totalStickers = stickerSet.result.stickers.length;

            const loadingBox = `╭═══ 💗 ═══╮\n    𝘍𝘢𝘩𝘪𝘮ᵇᵇᶻ𝘚𝘵𝘪𝘤𝘬𝘦𝘳 𝘋𝘰𝘸𝘯𝘭𝘰𝘥𝘦𝘳\n╰═══ 💗 ═══╯\n\n📦 *টেলিগ্রাম স্টিকার প্যাক পাওয়া গেছে!*\n✨ মোট স্টিকার: *${totalStickers}টি*\n\n⏳ _হোয়াটসঅ্যাপ সেফটি বজায় রেখে স্টিকার পাঠানো হচ্ছে, একটু সময় লাগবে..._`;

            await bad.sendMessage(m.chat, { text: loadingBox }, { quoted: m });

            const tmpDir = path.join(__dirname, '../cache');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            let successCount = 0;

            for (let i = 0; i < totalStickers; i++) {
                try {
                    const sticker = stickerSet.result.stickers[i];
                    const fileId = sticker.file_id;
                    
                    const fileInfoRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
                    const fileData = fileInfoRes.data;
                    if (!fileData.ok || !fileData.result.file_path) continue;

                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
                    const imageRes = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageRes.data);

                    const tempInput = path.join(tmpDir, `tg_in_${Date.now()}_${i}`);
                    const tempOutput = path.join(tmpDir, `tg_out_${Date.now()}_${i}.webp`);

                    fs.writeFileSync(tempInput, imageBuffer);

                    const isAnimated = sticker.is_animated || sticker.is_video;
                    
                    const ffmpegCommand = isAnimated
                        ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 65 -compression_level 6 "${tempOutput}"`
                        : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 65 -compression_level 6 "${tempOutput}"`;

                    await new Promise((resolve, reject) => {
                        exec(ffmpegCommand, (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                    });

                    const finalBuffer = fs.readFileSync(tempOutput);

                    await bad.sendMessage(m.chat, { sticker: finalBuffer }, { quoted: m });

                    successCount++;
                    
                    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

                    // ⚡ প্রতি স্টিকারের পর ৪ সেকেন্ড অপেক্ষা
                    await delay(4000);

                } catch (err) {
                    console.error(`Error processing sticker ${i}:`, err);
                    await delay(2000);
                    continue;
                }
            }

            const successBox = `╭═══ 🕊️ ═══╮\n    𝗙𝗔𝗛𝗜𝗠 ᵇᵇᶻ𝗦𝗧𝗜𝗖𝗞𝗘𝗥\n╰═══ 🕊️ ═══╯\n\n🌝 *𝗗𝗼𝘄𝗻𝗹𝗼𝗱𝗲 𝗖𝗼𝗺𝗽𝗹𝗮𝘁𝗲𝗱...*\n🦅 মোট ডাউনলোড: *${successCount}/${totalStickers}* টি স্টিকার।`;
            
            await bad.sendMessage(m.chat, { text: successBox }, { quoted: m });
            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            console.error("TGSticker Command Error:", error);
            await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await bad.sendMessage(m.chat, { text: '❌ দুঃখিত ভাই, কোনো টেকনিক্যাল ব্লকের কারণে প্রসেস থেমে গেছে। কিছুক্ষণ পর আবার চেষ্টা করুন!' }, { quoted: m });
        }
    }
};
