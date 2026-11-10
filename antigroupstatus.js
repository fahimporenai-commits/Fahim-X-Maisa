const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../database/antigroupstatus.json');

// ডাটাবেস লোড
function loadConfig() {
    try {
        if (!fs.existsSync(path.dirname(configPath))) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        return {};
    }
}

// ডাটাবেস সেভ
function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

// গ্রুপ স্ট্যাটাস ডিটেক্ট করার হেল্পার
function isGroupStatusMessage(msg) {
    if (!msg) return false;

    const ctxList = [
        msg.extendedTextMessage?.contextInfo,
        msg.imageMessage?.contextInfo,
        msg.videoMessage?.contextInfo,
        msg.audioMessage?.contextInfo,
        msg.documentMessage?.contextInfo,
        msg.stickerMessage?.contextInfo
    ];
    
    for (const ctx of ctxList) {
        if (ctx && ctx.isGroupStatus === true) return true;
    }

    if (msg.groupStatusMessageV2) return true;
    if (msg.groupStatusMessage) return true;

    return false;
}

module.exports = {
  name: "antigroupstatus",
  alias: ["antigroupstatus", "antigruopstatus", "antigcstatus", "ags", "nogroupstatus"],

  exec: async (bad, m, { args, prefix, isAdmins, isCreator, reply }) => {
    const chatId = m.chat;

    if (!m.isGroup) {
      return reply("❌ Ei command-ti shudhu group-er vitor use kora jabe!");
    }

    if (!isAdmins && !isCreator) {
      return reply("❌ Ei command-ti use korar jonno group admin hote hobe!");
    }

    const val = (args[0] || '').toLowerCase();
    const db = loadConfig();
    const current = db[chatId]?.mode || 'off';

    // এখানে || ঠিক করা হয়েছে
    const normalised = 
      (val === 'on' || val === 'enable' || val === 'enabled' || val === 'activate') ? 'warn' :
      (val === 'disable' || val === 'disabled' || val === 'deactivate' || val === 'false' || val === '0' || val === 'no' || val === 'stop') ? 'off' :
      val;

    const validModes = ['off', 'warn', 'kick', 'delete'];

    if (!normalised || !validModes.includes(normalised)) {
      const modeLabel =
        current === 'warn'   ? 'WARN ⚠️'   :
        current === 'kick'   ? 'KICK 🚫'   :
        current === 'delete' ? 'DELETE 🗑️' : 'OFF ❌';

      return reply(
        `╭─❏ 「 ANTIGROUPSTATUS 」\n` +
        `│ Status: *${modeLabel}*\n` +
        `│ \n` +
        `│ Detects messages posted as a group status/story\n` +
        `│ and punishes non-admins who post one.\n` +
        `│ \n` +
        `│ Usage:\n` +
        `│ *${prefix}antigroupstatus warn*   → delete + warn\n` +
        `│ *${prefix}antigroupstatus kick*   → delete + instant kick\n` +
        `│ *${prefix}antigroupstatus delete* → delete only\n` +
        `│ *${prefix}antigroupstatus off*    → disable\n` +
        `╰───────────────\n` +
        `> © Powered by Fahim Bot`
      );
    }

    db[chatId] = { status: normalised !== 'off', mode: normalised };
    saveConfig(db);

    const desc =
      normalised === 'off'  ? 'Anti-Group Status *DISABLED ❌*\n│ Group statuses are now allowed.' :
      normalised === 'warn' ? 'Anti-Group Status set to *WARN ⚠️*\n│ Message deleted + sender warned.' :
      normalised === 'kick' ? 'Anti-Group Status set to *KICK 🚫*\n│ Non-admins posting = Instant kick.' :
                              'Anti-Group Status set to *DELETE 🗑️*\n│ Message deleted, no warning or kick.';

    return reply(
      `╭─❏ 「 ANTIGROUPSTATUS 」\n` +
      `│ ${desc}\n` +
      `╰───────────────`
    );
  },

  handleEvent: async (bad, m) => {
    try {
      if (!m.isGroup || m.fromMe) return;

      const db = loadConfig();
      const groupConfig = db[m.chat];
      
      // এখানেও || ঠিক করা হয়েছে
      if (!groupConfig || !groupConfig.status || groupConfig.mode === 'off') return;

      const msg = m.message || {};
      if (!isGroupStatusMessage(msg)) return;

      // অ্যাডমিন/মালিক চেক (তাদের স্ট্যাটাস ডিলিট হবে না)
      const groupMetadata = await bad.groupMetadata(m.chat).catch(() => null);
      const participants = groupMetadata?.participants || [];
      const senderParticipant = participants.find(p => p.id === m.sender);
      const isSenderAdmin =
        senderParticipant?.admin === 'admin' ||
        senderParticipant?.admin === 'superadmin';

      if (isSenderAdmin) return;

      const mode = groupConfig.mode;
      const senderNum = m.sender.split('@')[0];

      // ===== তাৎক্ষণিক ডিলিট (সঠিক key দিয়ে) =====
      const deleteKey = {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      };

      try {
        await bad.sendMessage(m.chat, { delete: deleteKey });
        console.log(`[AntiGroupStatus] ✅ Deleted GC status from ${m.sender} in ${m.chat} (mode: ${mode})`);
      } catch (err) {
        console.error(`[AntiGroupStatus] ❌ Delete failed with deleteKey:`, err.message);
        // ব্যাকআপ: পুরো m.key দিয়ে চেষ্টা
        try {
          await bad.sendMessage(m.chat, { delete: m.key });
          console.log(`[AntiGroupStatus] ✅ Deleted (fallback) from ${m.sender}`);
        } catch (err2) {
          console.error(`[AntiGroupStatus] ❌ Fallback delete also failed:`, err2.message);
        }
      }

      // ===== মোড অনুযায়ী অ্যাকশন =====
      if (mode === 'delete') {
        await bad.sendMessage(m.chat, {
          text: `🚫 @${senderNum}, group-e status/story post kora nishiddho!`,
          mentions: [m.sender]
        }).catch(() => {});
      }
      else if (mode === 'warn') {
        db[m.chat].lockUntil = Date.now() + 60 * 1000;
        saveConfig(db);
        await bad.sendMessage(m.chat, {
          text: `⚠️ @${senderNum}, group-e status/story post korben na! (Warned)`,
          mentions: [m.sender]
        }).catch(() => {});
      }
      else if (mode === 'kick') {
        await bad.sendMessage(m.chat, {
          text: `🚫 @${senderNum}, group-e status deyar karone kick kora holo!`,
          mentions: [m.sender]
        }).catch(() => {});
        await bad.groupParticipantsUpdate(m.chat, [m.sender], "remove").catch(() => {});
      }

    } catch (e) {
      console.error("AntiGroupStatus Event Error:", e);
    }
  }
};
