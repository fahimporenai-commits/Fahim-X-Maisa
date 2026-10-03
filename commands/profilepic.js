module.exports = {
    name: "profilepic",
    alias: ["pp", "avatar", "getpp"],
    category: "Media",
    desc: "Send profile picture of yourself, mentioned user, or replied user",

    exec: async (bad, m, { args, prefix }) => {
        try {
            await bad.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });

            // ১. কাঙ্ক্ষিত ইউজারের JID (ID) বের করা (Mentioned, Replied, or Sender)
            let targets = [];

            if (m.mentionedJid && m.mentionedJid.length > 0) {
                targets = m.mentionedJid;
            } else if (m.quoted && m.quoted.sender) {
                targets = [m.quoted.sender];
            } else {
                targets = [m.sender];
            }

            for (let jid of targets) {
                try {
                    // Baileys-এর profilePictureUrl ফানশন দিয়ে ছবি সংগ্রহ করা
                    const ppUrl = await bad.profilePictureUrl(jid, 'image');

                    const isSelf = jid === m.sender;
                    const caption = isSelf 
                        ? `🖼️ *Here is your profile picture!*` 
                        : `🖼️ *Profile picture of @${jid.split('@')[0]}*`;

                    await bad.sendMessage(m.chat, {
                        image: { url: ppUrl },
                        caption: caption,
                        mentions: [jid]
                    }, { quoted: m });

                } catch (e) {
                    // প্রাইভেসি সেটিংস বা ছবি না থাকলে এই মেসেজ যাবে
                    const userName = jid.split('@')[0];
                    await bad.sendMessage(m.chat, { 
                        text: `❌ *@${userName}*-সখ কত মানুষের পিক দেখবি সালা লুচ্চা!`,
                        mentions: [jid]
                    }, { quoted: m });
                }
            }

            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            console.error("ProfilePic Command Error:", error);
            await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await bad.sendMessage(m.chat, { 
                text: "❌ দুঃখিত ভাই, প্রোফাইল পিকচার লোড করতে সমস্যা হচ্ছে!" 
            }, { quoted: m });
        }
    }
};
