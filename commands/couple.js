module.exports = {
    name: 'couple',
    alias: ['ship', 'pair'],
    description: 'Specific ba random member er sate couple banano',
    async exec(bad, m, { prefix, isGroup }) {
        try {
            if (!m.isGroup) {
                return await bad.sendMessage(m.chat, { text: "⚠️ এই কমান্ডটি শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!" }, { quoted: m });
            }

            const groupMetadata = await bad.groupMetadata(m.chat);
            const participants = groupMetadata.participants;

            let user1, user2;

            // ১. Mention করা user আছে কি না চেক করা
            const mentioned = m.mentionedJid || [];
            
            if (mentioned.length > 0) {
                user1 = m.sender;
                user2 = mentioned[0];

                if (user1 === user2) {
                    return await bad.sendMessage(m.chat, { text: "⚠️ আপনি নিজের সাথে নিজেকে শিপ/কাপল করতে পারবেন না!" }, { quoted: m });
                }
            } else {
                if (participants.length < 2) {
                    return await bad.sendMessage(m.chat, { text: "⚠️ গ্রুপে অন্তত ২ জন সদস্য থাকতে হবে!" }, { quoted: m });
                }

                const first = participants[Math.floor(Math.random() * participants.length)];
                let second = participants[Math.floor(Math.random() * participants.length)];

                while (first.id === second.id) {
                    second = participants[Math.floor(Math.random() * participants.length)];
                }

                user1 = first.id;
                user2 = second.id;
            }

            // ২. প্রোফাইল পিকচার ফেচ করা (ফেল মারলে ব্যাকআপ ওয়ার্কিং ইমেজ ব্যবহার হবে)
            let pfp;
            try {
                pfp = await bad.profilePictureUrl(user2, 'image');
            } catch {
                try {
                    pfp = await bad.profilePictureUrl(user1, 'image');
                } catch {
                    // ডাইরেক্ট ওয়ার্কিং ব্যাকআপ ইমেজ URL
                    pfp = 'https://raw.githubusercontent.com/images/avatar.jpg';
                }
            }

            // ৩. লাভ পারসেন্টেজ
            const lovePercentage = Math.floor(Math.random() * 51) + 50;

            const captionText = `❤️ *TODAY'S PERFECT COUPLE* ❤️\n\n` +
                                `👩‍❤️‍👨 *@${user1.split('@')[0]}*  💖  *@${user2.split('@')[0]}*\n\n` +
                                `✨ *Match Score:* ${lovePercentage}%\n` +
                                `💬 *Status:* ${lovePercentage > 85 ? 'Soulmates! 💞' : 'Great Match! 💕'}\n\n` +
                                `╭──◆「 *FAHIM BBZ* 」◆\n` +
                                `╰───★─☆─♪♪─◆`;

            // ৪. মেসেজ সেন্ড
            await bad.sendMessage(m.chat, {
                image: { url: pfp },
                caption: captionText,
                mentions: [user1, user2]
            }, { quoted: m });

        } catch (error) {
            console.error("Couple Command Error:", error);
            
            // ছবি ছাড়া শুধু টেক্সট দিয়ে ব্যাকআপ সেন্ড (যদি ইমেজ স্ট্রিমে কোনো কারণে ঝামেলা হয়)
            try {
                const lovePercentage = Math.floor(Math.random() * 51) + 50;
                const user1 = m.sender;
                const user2 = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0] : m.sender;
                
                await bad.sendMessage(m.chat, {
                    text: `❤️ *TODAY'S PERFECT COUPLE* ❤️\n\n` +
                          `👩‍❤️‍👨 *@${user1.split('@')[0]}*  💖  *@${user2.split('@')[0]}*\n\n` +
                          `✨ *Match Score:* ${lovePercentage}%\n\n` +
                          `╭──◆「 *FAHIM BBZ* 」◆\n` +
                          `╰───★─☆─♪♪─◆`,
                    mentions: [user1, user2]
                }, { quoted: m });
            } catch (e) {
                await bad.sendMessage(m.chat, { text: `❌ error: ${error.message}` }, { quoted: m });
            }
        }
    }
};
