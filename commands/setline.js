const fs = require('fs');
const path = require('path');

// File path for storing lines data
const filePath = path.join(__dirname, '../database/lines.json');

// Helper function to read saved lines
function getSavedLines() {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

module.exports = {
    name: 'setline',
    alias: ['setline', 'giveline'],
    description: 'Poll vote uthaneoala oider ke line set kora',
    async exec(bad, m, { args, prefix, isAdmin, isCreator }) {
        try {
            // Check if user replied to a message
            if (!m.quoted) {
                return await bad.sendMessage(m.chat, { 
                    text: `⚠️ Konoprakar Poll (পোল) ba message-e reply diye **${prefix}setline** likhun!` 
                }, { quoted: m });
            }

            // Fetch saved lines from saveline database
            const savedLines = getSavedLines();
            if (savedLines.length === 0) {
                return await bad.sendMessage(m.chat, { 
                    text: `⚠️ Kono line save kora nei! Age **${prefix}saveline <line text>** diye line save korun.` 
                }, { quoted: m });
            }

            let targetUsers = [];

            // 1. Check if the quoted message is a Poll
            if (m.quoted.mtype === 'pollCreationMessage' || m.quoted.pollUpdates || m.quoted.message?.pollCreationMessage) {
                const pollVotes = m.quoted.pollUpdates || m.quoted.pollVotes || [];

                if (pollVotes.length === 0) {
                    return await bad.sendMessage(m.chat, { 
                        text: "⚠️ Ei pole akhono keu vote dey ni!" 
                    }, { quoted: m });
                }

                // Extract voters JID/number from poll
                pollVotes.forEach(vote => {
                    if (vote.voters && Array.isArray(vote.voters)) {
                        vote.voters.forEach(voter => {
                            if (!targetUsers.includes(voter)) {
                                targetUsers.push(voter);
                            }
                        });
                    } else if (typeof vote === 'string' && !targetUsers.includes(vote)) {
                        targetUsers.push(vote);
                    }
                });
            } else {
                // If replied to normal message, target the sender
                targetUsers.push(m.quoted.sender);
            }

            if (targetUsers.length === 0) {
                return await bad.sendMessage(m.chat, { 
                    text: "⚠️ Pole voter der list khunje paowa jayni!" 
                }, { quoted: m });
            }

            // 2. Assign saved lines to each target user sequentially
            let responseText = `📜 *SET LINE RESULT* 📜\n\n`;
            let mentions = [];

            targetUsers.forEach((userJid, index) => {
                // Pick line according to index (rotates if voters > lines)
                const assignedLine = savedLines[index % savedLines.length];
                const userTag = `@${userJid.split('@')[0]}`;
                
                responseText += `${index + 1}. ${userTag}\n➔ ${assignedLine}\n\n`;
                mentions.push(userJid);
            });

            // 3. Send final message with mentions
            await bad.sendMessage(m.chat, { 
                text: responseText.trim(), 
                mentions: mentions 
            }, { quoted: m });

        } catch (error) {
            console.error("Setline error:", error);
            await bad.sendMessage(m.chat, { 
                text: `❌ Setline execute korte problem hoise: ${error.message}` 
            }, { quoted: m });
        }
    }
};
