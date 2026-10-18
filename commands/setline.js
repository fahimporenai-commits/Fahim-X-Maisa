const { savedLinesDb } = require('./saveline');

module.exports = {
    name: 'setline',
    alias: ['stl'],
    description: 'Poll voters ke mention kore line set kora',
    async exec(bad, m, { args, prefix }) {
        try {
            const sender = m.sender; // User ID match for cross-chat lines

            // 1. Line check
            if (!savedLinesDb[sender] || savedLinesDb[sender].length === 0) {
                return await bad.sendMessage(m.chat, {
                    text: `⚠️ *Kono line save kora nei!*\n\nAge DM-e ba group-e **${prefix}saveline <text>** diye line save korun.`
                }, { quoted: m });
            }

            // 2. Reply check
            const quotedMsg = m.quoted;
            if (!quotedMsg) {
                return await bad.sendMessage(m.chat, {
                    text: `⚠️ *Poll message-e reply din!*`
                }, { quoted: m });
            }

            const optionChoice = args[0]?.toLowerCase(); // 'yes' ba 'no' / option name

            await bad.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            // 3. Poll voters extraction from Baileys message object
            const pollUpdates = quotedMsg.pollUpdates || quotedMsg.message?.pollCreationMessage || [];
            let voters = [];

            if (quotedMsg.voters) {
                voters = quotedMsg.voters;
            } else if (quotedMsg.pollUpdates) {
                for (let update of quotedMsg.pollUpdates) {
                    if (update.voter) voters.push(update.voter);
                }
            }

            // Duplicate voter remove
            voters = [...new Set(voters)];

            if (voters.length === 0) {
                await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return await bad.sendMessage(m.chat, {
                    text: `⚠️ *Ei poll-e ekhono keu vote dey ni ba voter list paowa jayni!*`
                }, { quoted: m });
            }

            const lines = savedLinesDb[sender];
            let responseText = `📊 *POLL VOTERS LINE DISTRIBUTION*\n\n`;
            let mentionsList = [];

            // 4. Poll voter-der ek ek kore mention kore line assign kora
            voters.forEach((voterJid, index) => {
                const assignedLine = lines[index % lines.length]; // Voter count line-er cheye beshi hole loop hobe
                responseText += `👤 *@${voterJid.split('@')[0]}*\n💬 _${assignedLine}_\n\n`;
                mentionsList.push(voterJid);
            });

            responseText += `╭──◆「 *FAHIM BBZ* 」◆\n╰───★─☆─♪♪─◆`;

            // 5. Output message with mentions
            await bad.sendMessage(m.chat, {
                text: responseText,
                mentions: mentionsList
            }, { quoted: m });

            await bad.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            console.error('Setline Error:', error);
            await bad.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await bad.sendMessage(m.chat, { text: `❌ Setline error: ${error.message}` }, { quoted: m });
        }
    }
};
