module.exports = {
    name: 'couple',
    alias: ['ship', 'pair'],
    description: 'Specific ba random member er sate couple banano',
    async exec(bad, m, { prefix, isGroup }) {
        try {
            if (!m.isGroup) {
                return await bad.sendMessage(m.chat, { text: "⚠️ Ei command ti shudhu group-e bebohar kora jabe!" }, { quoted: m });
            }

            const groupMetadata = await bad.groupMetadata(m.chat);
            const participants = groupMetadata.participants;

            let user1, user2;

            // 1. Tag/Mention kora target user ache kina dekha
            const mentioned = m.mentionedJid || [];
            
            if (mentioned.length > 0) {
                // Command dewa user ebong mention kora user
                user1 = m.sender;
                user2 = mentioned[0];

                if (user1 === user2) {
                    return await bad.sendMessage(m.chat, { text: "⚠️ Apni nijer satei nijeke ship korte parben na!" }, { quoted: m });
                }
            } else {
                // Mention na thakle random 2 jon ke bachbe
                if (participants.length < 2) {
                    return await bad.sendMessage(m.chat, { text: "⚠️ Group-e ontoto 2 jon member thaktek hobe!" }, { quoted: m });
                }

                const first = participants[Math.floor(Math.random() * participants.length)];
                let second = participants[Math.floor(Math.random() * participants.length)];

                while (first.id === second.id) {
                    second = participants[Math.floor(Math.random() * participants.length)];
                }

                user1 = first.id;
                user2 = second.id;
            }

            // 2. Profile picture ana
            let pfp;
            try {
                pfp = await bad.profilePictureUrl(user1, 'image');
            } catch {
                pfp = 'https://i.ibb.co/6P6X2Ck/avatar.png';
            }

            // 3. Random love percentage
            const lovePercentage = Math.floor(Math.random() * 51) + 50;

            const captionText = `❤️ *TODAY'S PERFECT COUPLE* ❤️\n\n` +
                                `👩‍❤️‍👨 *@${user1.split('@')[0]}*  💖  *@${user2.split('@')[0]}*\n\n` +
                                `✨ *Match Score:* ${lovePercentage}%\n` +
                                `💬 *Status:* ${lovePercentage > 85 ? 'Soulmates! 💞' : 'Great Match! 💕'}\n\n` +
                                `╭──◆「 *FAHIM BBZ* 」◆\n` +
                                `╰───★─☆─♪♪─◆`;

            await bad.sendMessage(m.chat, {
                image: { url: pfp },
                caption: captionText,
                mentions: [user1, user2]
            }, { quoted: m });

        } catch (error) {
            console.error("Couple Command Error:", error);
            await bad.sendMessage(m.chat, { 
                text: `❌ Couple command execute korte problem hoise: ${error.message}` 
            }, { quoted: m });
        }
    }
};
