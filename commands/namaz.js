const activeIntervals = {};
const groupStates = {};

// 🌍 গ্লোবাল গ্যারান্টিড ব্যাকগ্রাউন্ড চেকার (গ্রুপে মেসেজ আসার দরকার নেই)
const startGlobalNamazChecker = (bad) => {
    if (global.globalNamazIntervalRunning) return;
    global.globalNamazIntervalRunning = true;

    setInterval(async () => {
        try {
            if (!global.namazActive) return;

            // সিলেটের নতুন আপডেটকৃত সময়সূচী
            const schedule = [
                { name: "Fajr", start: "04:20", end: "05:10" },
                { name: "Dhuhr", start: "13:00", end: "13:50" },
                { name: "Asr", start: "16:45", end: "17:25" },
                { name: "Maghrib", start: "18:12", end: "18:45" },
                { name: "Isha", start: "19:55", end: "20:45" },
                { name: "Jummah", start: "13:00", end: "14:15" } // শুক্রবার জুম্মার সময়
            ];

            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
            const current = now.getHours() * 60 + now.getMinutes();
            const day = now.getDay(); // 5 = Friday

            let shouldLock = false;
            let activeWaqt = "";

            for (const p of schedule) {
                if (p.name === "Jummah" && day !== 5) continue;
                if (p.name === "Dhuhr" && day === 5) continue;

                const [sh, sm] = p.start.split(":").map(Number);
                const [eh, em] = p.end.split(":").map(Number);
                
                if (current >= (sh * 60 + sm) && current < (eh * 60 + em)) {
                    shouldLock = true;
                    activeWaqt = p.name;
                    break;
                }
            }

            // যেসকল গ্রুপে অন করা আছে তাদের লুপ চালিয়ে চেক করা
            for (const chatId in global.namazActive) {
                if (!global.namazActive[chatId]) continue;

                // 🔒 LOCK LOGIC
                if (shouldLock && groupStates[chatId] !== "locked") {
                    try {
                        await bad.groupSettingUpdate(chatId, "announcement");
                        groupStates[chatId] = "locked";
                        let offMsg = `𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 😌🤍\n\n— *𝐆𝐫𝐨𝐮𝐩 𝐎𝐟𝐟!* 🚫 (🕌 ${activeWaqt} Namaz Time)\n— 𝐎𝐩𝐞𝐧 𝐓𝐢𝐦𝐞: 𝐍𝐚𝐦𝐚𝐣𝐞𝐫 𝐏𝐨𝐫 🕋☉\n\n— 𝐀𝐥𝐥𝐚𝐡 𝐇𝐚𝐟𝐞𝐳 :) 🫧🧷\n    — *𝐅ꫝнιм 𝐁𝐨𝐭*🩶`;
                        await bad.sendMessage(chatId, { text: offMsg });
                    } catch (e) {
                        console.log(`Namaz Lock Error in ${chatId}:`, e.message);
                    }
                } 
                // 🔓 UNLOCK LOGIC
                else if (!shouldLock && groupStates[chatId] === "locked") {
                    try {
                        await bad.groupSettingUpdate(chatId, "not_announcement");
                        groupStates[chatId] = "unlocked";
                        let onMsg = `– 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 😌🌷\n\n– 𝐍𝐚𝐦𝐚𝐳 𝐓𝐢𝐦𝐞 𝐎𝐯𝐞𝐫. 𝐆𝐫𝐨𝐮𝐩 𝐎𝐩𝐞𝐧 🌸🍒\n\n– 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐅αнιм вσт⚡`;
                        await bad.sendMessage(chatId, { text: onMsg });
                    } catch (e) {
                        console.log(`Namaz Unlock Error in ${chatId}:`, e.message);
                    }
                }
            }
        } catch (err) {
            console.log("Global Namaz Error:", err);
        }
    }, 20000); // প্রতি ২০ সেকেন্ড পর পর ব্যাকগ্রাউন্ডে চেক করবে
};

module.exports = {
    name: "namazauto",
    alias: ["namaz", "namaztime"],
    
    // ইভেন্ট হ্যান্ডলার শুধু গ্লোবাল চেকার স্টার্ট করার জন্য কাজ করবে
    async handleEvent(bad, m, { isAdmins, isCreator }) {
        global.namazActive = global.namazActive || {};
        startGlobalNamazChecker(bad);
    },

    // অন/অফ হ্যান্ডলার (Command Handler)
    async exec(bad, m, { args, prefix, isAdmins, isCreator }) {
        if (!m.isGroup) return m.reply("🚫 এই কমান্ডটি শুধু গ্রুপে ব্যবহার করা যাবে!");
        if (!isAdmins && !isCreator) return m.reply("🚫 শুধু গ্রুপ এডমিনরা ব্যবহার করতে পারবেন!");

        const action = args[0]?.toLowerCase();
        global.namazActive = global.namazActive || {};

        // কমান্ড দেওয়ার সাথেই গ্লোবাল চেকার অন করে দেওয়া হলো
        startGlobalNamazChecker(bad);

        if (action === "on") {
            if (global.namazActive[m.chat]) return m.reply("⚠️ Namaz Auto System আগে থেকেই চালু আছে!");
            global.namazActive[m.chat] = true;
            groupStates[m.chat] = "unlocked";
            return m.reply("🟢 *NAMAZ AUTO SYSTEM ACTIVATED (🤍)*\n\n🕌 নির্দিষ্ট ওয়াক্তে গ্রুপ স্বয়ংক্রিয়ভাবে অন/অফ হবে।");
        } else if (action === "off") {
            if (!global.namazActive[m.chat]) return m.reply("⚠️ system টি বন্ধই আছে!");
            global.namazActive[m.chat] = false;
            groupStates[m.chat] = "unlocked";
            try {
                await bad.groupSettingUpdate(m.chat, "not_announcement");
            } catch (e) {}
            return m.reply("🔴 Namaz Auto System বন্ধ করা হয়েছে এবং গ্রুপ খুলে দেওয়া হয়েছে।");
        } else {
            return m.reply(`📌 *Usage:*\n👉 ${prefix}namaz on\n👉 ${prefix}namaz off`);
        }
    }
};
