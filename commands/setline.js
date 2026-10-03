module.exports = {
    name: "setline",
    alias: ["lineset", "distributeline"],
    category: "Group",
    desc: "Send saved lines to poll voters one by one with a 2-second delay",

    exec: async (bad, m, { args, prefix }) => {
        try {
            // ১. সেভ করা লাইন আছে কিনা চেক
            if (!global.savedLines || global.savedLines.length === 0) {
                return await bad.sendMessage(m.chat, { 
                    text: `❌ কোনো সেভ করা লাইন পাওয়া যায়নি!\n\n👉 বটের ইনবক্সে \`${prefix}saveline\` দিয়ে আগে লাইন সেভ করুন।` 
                }, { quoted: m });
            }

            // ২. পোলে রিপ্লাই করা হয়েছে কিনা চেক
            if (!m.quoted) {
                return await bad.sendMessage(m.chat, { 
                    text: `⚠️ দয়া করে পোলে (Poll Message) রিপ্লাই দিয়ে এই কমান্ডটি ব্যবহার করুন!` 
                }, { quoted: m });
            }

            const targetOption = args[0] ? args[0].toLowerCase() : 'yes';

            // ৩. পোল থেকে ভোটারদের বের করা
            const pollMessage = m.quoted;
            let voters = [];

            if (pollMessage.pollUpdates && pollMessage.pollUpdates.length > 0) {
                pollMessage.pollUpdates.forEach(vote => {
                    if (vote.voters && vote.voters.length > 0) {
                        voters.push(...vote.voters);
                    }
                });
            }

            // ডুপ্লিকেট বাদ দিয়ে ইউনিক ভোটার বের করা
            let uniqueVoters = [...new Set(voters)];

            if (uniqueVoters.length === 0 && m.quoted.sender) {
                uniqueVoters = [m.quoted.sender];
            }

            if (uniqueVoters.length === 0) {
                return await bad.sendMessage(m.chat, { 
                    text: `❌ এই পোলে কোনো ভোট পাওয়া যায়নি!` 
                }, { quoted: m });
            }

            // ৪. প্রথম মেসেজ: কতটি ভোট পড়েছে তা জানিয়ে দেওয়া
            await bad.sendMessage(m.chat, { 
                text: `📊 Total '${targetOption.toUpperCase()}' Votes: ${uniqueVoters.length} person(s)\n⏳ ২ সেকেন্ড পর পর সবাইকে লাইন পাঠানো শুরু হচ্ছে...` 
            }, { quoted: m });

            // ৫. ২ সেকেন্ড পর পর ১ জন ১ জন করে লাইন পাঠানো
            for (let i = 0; i < uniqueVoters.length; i++) {
                const voterJid = uniqueVoters[i];
                const lineIndex = i % global.savedLines.length;
                const assignedLine = global.savedLines[lineIndex];

                // ২ সেকেন্ড (২০০০ মিলিসেকেন্ড) বিরতি
                await new Promise(resolve => setTimeout(resolve, 2000));

                const sendText = `@${voterJid.split('@')[0]} Line ${i + 1}: ${assignedLine}`;

                await bad.sendMessage(m.chat, {
                    text: sendText,
                    mentions: [voterJid]
                });
            }

        } catch (error) {
            console.error("SetLine Delay Command Error:", error);
            await bad.sendMessage(m.chat, { 
                text: `❌ লাইন ডিস্ট্রিবিউট করতে সমস্যা হয়েছে!` 
            }, { quoted: m });
        }
    }
};
