const activeIntervals = {};
const groupStates = {};

module.exports = {
    name: "namazauto",
    alias: ["namaz", "namaztime"],
    
    // ব্যাকগ্রাউন্ড অটো চেকিং (Event Handler)
    async handleEvent(bad, m, { isAdmins, isCreator }) {
        if (!m.isGroup) return;

        // 🕌 updated namaz schedule (Fajr excluded, Jummah added)
        const schedule = [
            { name: "Juhor", start: "13:10", end: "13:45" },
            { name: "Asor", start: "15:45", end: "16:15" },
            { name: "Magrib", start: "17:15", end: "17:35" },
            { name: "Esha", start: "19:00", end: "19:45" },
            { name: "Jummah", start: "13:10", end: "14:15" } // শুক্রবার জুম্মার সময়
        ];

        if (global.namazActive && global.namazActive[m.chat] && !activeIntervals[m.chat]) {
            activeIntervals[m.chat] = setInterval(async () => {
                const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
                const current = now.getHours() * 60 + now.getMinutes();
                const day = now.getDay(); // 5 = Friday

                let shouldLock = false;
                let activeWaqt = "";

                for (const p of schedule) {
                    if (p.name === "Jummah" && day !== 5) continue;
                    if (p.name === "Juhor" && day === 5) continue;

                    const [sh, sm] = p.start.split(":").map(Number);
                    const [eh, em] = p.end.split(":").map(Number);
                    
                    if (current >= (sh * 60 + sm) && current < (eh * 60 + em)) {
                        shouldLock = true;
                        activeWaqt = p.name;
                        break;
                    }
                }

                // 🔒 LOCK LOGIC
                if (shouldLock && groupStates[m.chat] !== "locked") {
                    try {
                        await bad.groupSettingUpdate(m.chat, "announcement");
                        groupStates[m.chat] = "locked";
                        let offMsg = `𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 😌🤍\n\n— *𝐆𝐫𝐨𝐮𝐩 𝐎𝐟𝐟!* 🚫 (🕌 ${activeWaqt} Namaz Time)\n— 𝐎𝐩𝐞𝐧 𝐓𝐢𝐦𝐞: 𝐍𝐚𝐦𝐚𝐣𝐞𝐫 𝐏𝐨𝐫 🕋☉\n\n— 𝐀𝐥𝐥𝐚𝐡 𝐇𝐚𝐟𝐞𝐳 :) 🫧🧷\n    — *𝐅ꫝнιм 𝐁𝐨𝐭*🩶`;
                        await bad.sendMessage(m.chat, { text: offMsg });
                    } catch (e) {}
                } 
                // 🔓 UNLOCK LOGIC
                else if (!shouldLock && groupStates[m.chat] === "locked") {
                    try {
                        await bad.groupSettingUpdate(m.chat, "not_announcement");
                        groupStates[m.chat] = "unlocked";
                        let onMsg = `– 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 😌🌷\n\n– 𝐍𝐚𝐦𝐚𝐳 𝐓𝐢𝐦𝐞 𝐎𝐯𝐞𝐫. 𝐆𝐫𝐨𝐮𝐩 𝐎𝐩𝐞𝐧 🌸🍒\n\n– 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐅αнιм вσт⚡`;
                        await bad.sendMessage(m.chat, { text: onMsg });
                    } catch (e) {}
                }
            }, 20000);
        }
    },

    // অন/অফ হ্যান্ডলার (Command Handler)
    async exec(bad, m, { args, prefix, isAdmins, isCreator }) {
        if (!m.isGroup) return m.reply("🚫 Ei command-ti shudhu group-e byabohar kora jabe!");
        if (!isAdmins && !isCreator) return m.reply("🚫 Shudhu group admin-ra byabohar korte parben!");

        const action = args[0]?.toLowerCase();
        global.namazActive = global.namazActive || {};

        if (action === "on") {
            if (global.namazActive[m.chat]) return m.reply("⚠️ Namaz Auto System age thekei chalu ache!");
            global.namazActive[m.chat] = true;
            return m.reply("🟢 *𝘕ᴀᴍᴀᴢ 𝘈ᴜᴛᴏ 𝘚ʏꜱᴛᴇᴍ 𝐀ᴄᴛɪᴠᴀᴛᴇᴅ.. (🤍)*\n\n🕌 * _নামায টাইমে গুরুপ on-of_/hobe.");
        } else if (action === "off") {
            if (!global.namazActive[m.chat]) return m.reply("⚠️ System-ti bondh-i ache!");
            global.namazActive[m.chat] = false;
            if (activeIntervals[m.chat]) {
                clearInterval(activeIntervals[m.chat]);
                delete activeIntervals[m.chat];
            }
            try {
                await bad.groupSettingUpdate(m.chat, "not_announcement");
            } catch (e) {}
            return m.reply("🔴 Namaz Auto System bondho kora hoyeche ebong group khule dewa hoyeche.");
        } else {
            return m.reply(`📌 *Usage:*\n👉 ${prefix}namaz on\n👉 ${prefix}namaz off`);
        }
    }
};
