// Global memory store for cross-chat data access
const savedLinesDb = {};

module.exports = {
    name: 'saveline',
    alias: ['sl', 'savelines'],
    description: 'Save lines using user ID for cross-chat access',
    
    // Export object so setline.js can read this
    savedLinesDb,

    async exec(bad, m, { args, prefix }) {
        try {
            const sender = m.sender; // 🔑 m.chat er bodol-e user ID (m.sender) use kora hoise

            // 1. Text check
            const text = args.join(' ') || (m.quoted ? (m.quoted.text || m.quoted.caption) : '');

            if (!text) {
                return await bad.sendMessage(m.chat, {
                    text: `⚠️ *Please provide lines to save!*\n\n💡 *Example:*\n${prefix}saveline 1. KAHO HO MERY JAN\n2. TUMKO MISS KARTI HUU\n3. HEY BBY`
                }, { quoted: m });
            }

            // 2. Numbering format system spliting (1. 2. 3. format)
            let lines = text.split(/\d+\.\s*/).map(l => l.trim()).filter(l => l.length > 0);

            // Back-up split if no numbers used (line break split)
            if (lines.length <= 1 && text.includes('\n')) {
                lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            }

            if (lines.length === 0) {
                return await bad.sendMessage(m.chat, {
                    text: `⚠️ *No valid lines found!* Please use standard numbering (1. line 2. line).`
                }, { quoted: m });
            }

            // 3. Save array using Sender ID
            savedLinesDb[sender] = lines;

            // 4. Response Message Format
            let responseText = `✅ *Total ${lines.length} ti line successfully save hoyeche!*\n\n`;
            lines.forEach((line, index) => {
                responseText += `*Line ${index + 1}:* ${line}\n`;
            });

            responseText += `\n*Ekhon group-e poll-er reply diiye ${prefix}setline yes ba ${prefix}setline no likhun!*`;

            await bad.sendMessage(m.chat, { text: responseText }, { quoted: m });

        } catch (error) {
            console.error('Saveline Error:', error);
            await bad.sendMessage(m.chat, { text: `❌ Saveline error: ${error.message}` }, { quoted: m });
        }
    }
};

