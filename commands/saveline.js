// Saved lines store korar global storage
global.savedLines = global.savedLines || [];

module.exports = {
    name: "saveline",
    alias: ["linesave", "addlines"],
    category: "Utility",
    desc: "Song line-gulo bot-er inbox-e save korar jonno",

    exec: async (bad, m, { args, prefix }) => {
        try {
            const text = args.join(" ");
            if (!text) {
                return await bad.sendMessage(m.chat, { 
                    text: `⚠️ *Line format bhul hoyeche!*\n\n💡 *Example:*
${prefix}saveline
1. Ami tomake bhalobashi
2. Tumi amar moner manush
3. Ekta Shundor Shondha` 
                }, { quoted: m });
            }

            // Line gulo split kore array te neowa (New line ba 1. 2. diye split)
            const rawLines = text.split('\n').filter(line => line.trim() !== '');
            
            global.savedLines = rawLines.map(line => {
                // Line er shuru te thaka number (e.g. "1. ", "2) ") muche dewya
                return line.replace(/^\d+[\.\)\-]\s*/, '').trim();
            });

            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            
            let confirmationMsg = `✅ *Total ${global.savedLines.length} ti line successfully save hoyeche!*\n\n`;
            global.savedLines.forEach((l, index) => {
                confirmationMsg += `*Line ${index + 1}:* ${l}\n`;
            });
            confirmationMsg += `\n> Ekhon group-e poll-er reply diiye \`${prefix}setline yes\` ba \`${prefix}setline no\` likhun!`;

            return await bad.sendMessage(m.chat, { text: confirmationMsg }, { quoted: m });

        } catch (error) {
            console.error("SaveLine Command Error:", error);
            return await bad.sendMessage(m.chat, { text: "❌ Line save korte kono somossha hoyeche!" }, { quoted: m });
        }
    }
};
