// Global Map to track active clocks
const activeClocks = new Map();

module.exports = {
    name: "clock",
    alias: ["livetime", "timer"],
    category: "Fun",
    desc: "Group-e live clock chalanor jonno",

    exec: async (bad, m, { args, prefix }) => {
        const action = args[0] ? args[0].toLowerCase() : '';

        // 1. Clock ON Command
        if (action === 'on') {
            if (activeClocks.has(m.chat)) {
                return await bad.sendMessage(m.chat, { text: "⚠️ Bhai, ei group-e already clock cholche!" }, { quoted: m });
            }

            // Shuru te ekta message pathaiya key dhorlam
            let sentMsg = await bad.sendMessage(m.chat, { text: "⏰ Live clock chalu hocche... obekkha korun!" }, { quoted: m });

            // Proti 5 second por por edit hobe (WhatsApp Block Safety Risk avoid korar jonno)
            const intervalId = setInterval(async () => {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' });
                
                const clockText = `╭━━━❖━━━╮\n  ⏳ *LIVE CLOCK* ⏳\n╰━━━❖━━━╯\n\n⏰ Somoy: *${timeString}*\n\n_ꜰᴀʜɪᴍ ʙʙᴢ ʟɪᴠᴇ ᴛɪᴍᴇ..._`;

                try {
                    await bad.sendMessage(m.chat, { text: clockText, edit: sentMsg.key });
                } catch (e) {
                    clearInterval(intervalId);
                    activeClocks.delete(m.chat);
                }
            }, 5000); // 5 seconds interval for safety

            activeClocks.set(m.chat, intervalId);
            return await bad.sendMessage(m.chat, { text: "✅ Live clock successfully chalu hoyeche! ⏰" }, { quoted: m });

        } 
        
        // 2. Clock OFF Command
        else if (action === 'off') {
            if (!activeClocks.has(m.chat)) {
                return await bad.sendMessage(m.chat, { text: "❌ Bhai, ei group-e to kono clock cholche na!" }, { quoted: m });
            }

            clearInterval(activeClocks.get(m.chat));
            activeClocks.delete(m.chat);
            return await bad.sendMessage(m.chat, { text: "🛑 Live clock bondho kora hoyeche. 💤" }, { quoted: m });
        } 
        
        else {
            return await bad.sendMessage(m.chat, { text: `💡 Usage:\n👉 *${prefix}clock on*\n👉 *${prefix}clock off*` }, { quoted: m });
        }
    }
};
