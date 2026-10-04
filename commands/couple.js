module.exports = {
    name: "couple",
    alias: ["love", "jora", "💗"],
    category: "Fun",
    desc: "Generate a couple/love image with mentioned or random group member",

    exec: async (bad, m, { args, prefix }) => {
        try {
            // ১. গ্রুপের মেসেজ কিনা চেক
            if (!m.isGroup) {
                return await bad.sendMessage(m.chat, { 
                    text: "⚠️ এই কমান্ডটি শুধুমাত্র গ্রুপে কাজ করবে!" 
                }, { quoted: m });
            }

            await bad.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

            const groupMetadata = await bad.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id);

            // ২. জেনারেটর (Sender) এবং পার্টনার (Target) নির্ধারণ
            const user1 = m.sender;
            let user2;

            // মেনশন করা থাকলে সেটা নেবে
            if (m.mentionedJid && m.mentionedJid.length > 0) {
                user2 = m.mentionedJid[0];
            } else if (m.quoted) {
                user2 = m.quoted.sender;
            } else {
                // মেনশন না থাকলে গ্রুপ থেকে র্যান্ডম কাউকে বেছে নেবে (Sender ছাড়া)
                const availableTargets = participants.filter(jid => jid !== user1);
                if (availableTargets.length === 0) {
                    return await bad.sendMessage(m.chat, { text: "❌ জোড়া বানানোর মতো পর্যাপ্ত মেম্বার নেই!" }, { quoted: m });
                }
                user2 = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            }

            if (user1 === user2) {
                return await bad.sendMessage(m.chat, { text: "😜 নিজের সাথে নিজে জোড়া বানানো যাবে না ভাই!" }, { quoted: m });
            }

            // ৩. প্রফাইল পিকচার ফেচ করা
            let pfp1, pfp2;
            const defaultAvatar = "https://i.ibb.co/3S128fC/avatar.png";

            try {
                pfp1 = await bad.profilePictureUrl(user1, 'image');
            } catch {
                pfp1 = defaultAvatar;
            }

            try {
                pfp2 = await bad.profilePictureUrl(user2, 'image');
            } catch {
                pfp2 = defaultAvatar;
            }

            // 💡 Canvas/Ship API দিয়ে লাভ কাপল ইমেজ জেনারেট
            const coupleImgUrl = `https://api.popcat.xyz/ship?user1=${encodeURIComponent(pfp1)}&user2=${encodeURIComponent(pfp2)}`;

            const user1Tag = user1.split('@')[0];
            const user2Tag = user2.split('@')[0];

            const captionMsg = `👩‍❤️‍👨 *PERFECT COUPLE MATCH* 👩‍❤️‍👨\n\n` +
                `💖 *@${user1Tag}*  x  *@${user2Tag}*\n` +
                `✨ *Love Percentage:* ${Math.floor(Math.random() * 41) + 60}%\n\n` +
                `> 𝘍ᴀʜɪᴍ-ᴄᴏᴜᴩʟᴇ-ᴅᴩ-ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ / ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜰᴀʜɪᴍ ʙʙᴢ`;

            // ৪. কাপল ইমেজ সেন্ড করা
            await bad.sendMessage(m.chat, {
                image: { url: coupleImgUrl },
                caption: captionMsg,
                mentions: [user1, user2]
            }, { quoted: m });

            await bad.sendMessage(m.chat, { react: { text: '👩‍❤️‍👨', key: m.key } });

        } catch (error) {
            console.error("Couple Command Error:", error);
            await bad.sendMessage(m.chat, { 
                text: "❌ কাপল ছবি তৈরি করতে সমস্যা হয়েছে! পরে আবার চেষ্টা করুন।" 
            }, { quoted: m });
        }
    }
};
