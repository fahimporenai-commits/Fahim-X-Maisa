require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const fs2 = require("fs")
const path = require('path');
const chalk = require('chalk');
const { sleep } = require('./utils');
const { BOT_TOKEN } = require('./token');
const { autoLoadPairs } = require('./autoload');
const axios = require("axios")

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const PAIR_IMAGE_URL = "https://i.postimg.cc/7Y51cVdh/IMG-20260430-022431.jpg";
const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VbDLv0h1dAw6SRSiPr30";
const OWNER_WA_URL = "https://wa.me/8801719298647?s=t";
const ALLOWED_GROUP_ID = "-1003729697262";
const OWNER_TELEGRAM_ID = "8141633843";
const adminFilePath = path.join(__dirname, 'kingbadboitimewisher', 'admin.json');
let adminIDs = [];

const isGroupChat = (msg) => msg?.chat?.type === 'group' || msg?.chat?.type === 'supergroup';
const isOfficialGroup = (msg) => isGroupChat(msg) && String(msg.chat.id) === ALLOWED_GROUP_ID;
const isOwner = (msg) => String(msg?.from?.id || '') === OWNER_TELEGRAM_ID;

async function isOfficialGroupAdmin(msg) {
  if (!isOfficialGroup(msg)) return false;
  if (isOwner(msg)) return true;
  try {
    const member = await bot.getChatMember(msg.chat.id, msg.from.id);
    return member.status === 'creator' || member.status === 'administrator';
  } catch {
    return false;
  }
}

async function canUseSessionCommands(msg) {
  return isOwner(msg) || await isOfficialGroupAdmin(msg);
}

// Store user states for pairing flow
const userStates = new Map();
// pair.js writes a single shared pairing.json, so allow only one code generation at a time.
let pairingInProgress = false;

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// pair.js writes one shared pairing.json asynchronously. Wait for the requested
// number's fresh code rather than accidentally returning an older user's code.
const waitForPairingCode = async (pairingFolder, expectedNumber, timeoutMs = 20000) => {
  const pairingFile = path.join(pairingFolder, 'pairing.json');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const raw = await fs.readFile(pairingFile, 'utf8');
      const data = JSON.parse(raw);
      const fresh = data.timestamp && Date.now() - Date.parse(data.timestamp) < 60000;
      if (data.number === expectedNumber && data.code && fresh) return data;
    } catch {}
    await sleep(500);
  }
  throw new Error('Timed out waiting for this number’s pairing code');
};

const loadAdminIDs = async () => {
  const ownerID = '8141633843';
  const defaultAdmins = [ownerID];

  if (!(await exists(adminFilePath))) {
    await fs.mkdir(path.dirname(adminFilePath), { recursive: true });
    await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
    adminIDs = defaultAdmins;
    console.log('✅ Created admin.json with default owner ID');
  } else {
    try {
      const raw = await fs.readFile(adminFilePath, 'utf8');
      adminIDs = JSON.parse(raw);
    } catch (err) {
      console.error('Error loading admin.json:', err);
      adminIDs = defaultAdmins;
    }
  }
  console.log('📥 Loaded Admin IDs:', adminIDs);
};

let isShuttingDown = false;
let isAutoLoadRunning = false;

const runAutoLoad = async () => {
  if (isAutoLoadRunning || isShuttingDown) return;
  isAutoLoadRunning = true;

  try {
    console.log('⏱️ INITIATING AUTO-LOAD');
    await autoLoadPairs();
    console.log('✅ AUTO-LOAD COMPLETED');
  } catch (e) {
    console.error('❌ AUTO-LOAD FAILED:', e);
  } finally {
    isAutoLoadRunning = false;
  }
};

const startAutoLoadLoop = () => {
  runAutoLoad();
  setInterval(runAutoLoad, 60 * 60 * 1000);
};
startAutoLoadLoop();

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  bot.stopPolling();
  console.log('✅ Bot stopped successfully');
  process.exit(0);
};

// ========== CHECK CHANNELS FUNCTION ==========
 

// ========== SEND CHANNELS REQUIRED MESSAGE ==========

        
// ========== SEND GROUP MESSAGE (STYLISH) ==========


const COUNTRY_CALLING_CODES = [
  ['880', '🇧🇩', 'Bangladesh'], ['971', '🇦🇪', 'United Arab Emirates'],
  ['966', '🇸🇦', 'Saudi Arabia'], ['974', '🇶🇦', 'Qatar'], ['965', '🇰🇼', 'Kuwait'],
  ['968', '🇴🇲', 'Oman'], ['973', '🇧🇭', 'Bahrain'], ['977', '🇳🇵', 'Nepal'],
  ['94', '🇱🇰', 'Sri Lanka'], ['91', '🇮🇳', 'India'], ['92', '🇵🇰', 'Pakistan'],
  ['93', '🇦🇫', 'Afghanistan'], ['44', '🇬🇧', 'United Kingdom'], ['1', '🇺🇸', 'US/Canada'],
  ['60', '🇲🇾', 'Malaysia'], ['65', '🇸🇬', 'Singapore'], ['62', '🇮🇩', 'Indonesia'],
  ['63', '🇵🇭', 'Philippines'], ['61', '🇦🇺', 'Australia'], ['49', '🇩🇪', 'Germany'],
  ['33', '🇫🇷', 'France'], ['39', '🇮🇹', 'Italy'], ['81', '🇯🇵', 'Japan'],
  ['86', '🇨🇳', 'China'], ['90', '🇹🇷', 'Turkey'], ['20', '🇪🇬', 'Egypt'],
  ['27', '🇿🇦', 'South Africa'], ['234', '🇳🇬', 'Nigeria'], ['233', '🇬🇭', 'Ghana'],
  ['254', '🇰🇪', 'Kenya'], ['55', '🇧🇷', 'Brazil'], ['7', '🇷🇺', 'Russia/Kazakhstan']
].sort((a, b) => b[0].length - a[0].length);

function getPhoneCountry(phoneJid) {
  const digits = String(phoneJid).replace(/\D/g, '');
  const match = COUNTRY_CALLING_CODES.find(([callingCode]) => digits.startsWith(callingCode));
  return match
    ? { digits, callingCode: match[0], flag: match[1], name: match[2] }
    : { digits, callingCode: '', flag: '🌐', name: 'International' };
}

const htmlEscape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const tableGraphemeSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const tableTextWidth = value => {
  let width = 0;
  for (const { segment } of tableGraphemeSegmenter.segment(String(value))) {
    width += /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(segment)
      ? 2
      : Array.from(segment).length;
  }
  return width;
};
const padTableCell = (value, width) => `${value}${' '.repeat(Math.max(0, width - tableTextWidth(value)))}`;

function makeTelegramTable(rows) {
  const labelWidth = Math.max(10, ...rows.map(([label]) => tableTextWidth(label)));
  const valueWidth = Math.max(18, ...rows.map(([, value]) => tableTextWidth(value)));
  const top = `┌${'─'.repeat(labelWidth + 2)}┬${'─'.repeat(valueWidth + 2)}┐`;
  const divider = `├${'─'.repeat(labelWidth + 2)}┼${'─'.repeat(valueWidth + 2)}┤`;
  const bottom = `└${'─'.repeat(labelWidth + 2)}┴${'─'.repeat(valueWidth + 2)}┘`;
  const body = rows.map(([label, value]) =>
    `│ ${htmlEscape(padTableCell(label, labelWidth))} │ ${htmlEscape(padTableCell(value, valueWidth))} │`
  );
  return `<code>${[top, ...body.flatMap((line, index) => index < body.length - 1 ? [line, divider] : [line]), bottom].join('\n')}</code>`;
}

async function sendPairCard(chatId, phoneJid, code, replyToMessageId) {
  const phone = getPhoneCountry(phoneJid);
  const country = `${phone.flag} ${phone.name}${phone.callingCode ? ` (+${phone.callingCode})` : ''}`;
  const pairingCode = code || '';
  const caption = [
    `🔐 <b>PAIR CODE READY</b>`,
    '',
    makeTelegramTable([
      ['Number', `+${phone.digits}`],
      ['Country', country],
      ['Code', pairingCode]
    ]),
    '',
    `📌 <b>HOW TO LINK</b>`,
    `1. WhatsApp → Settings → Linked Devices`,
    `2. Link a Device → Link with phone number instead`,
    `3. Enter the code shown above`,
    '',
    `⏳ <i>Code is temporary. If it expires, request a new one. Keep it private.</i>`
  ].join('\n');
  const reply_markup = {
    inline_keyboard: [
      [{ text: '📋 Copy Code', copy_text: { text: pairingCode } }],
      [{ text: '💋 WA Channel', url: WA_CHANNEL_URL }],
      [{ text: '🌚 Owner', url: OWNER_WA_URL }]
    ]
  };
  try {
    return await bot.sendPhoto(chatId, PAIR_IMAGE_URL, {
      caption,
      parse_mode: 'HTML',
      reply_to_message_id: replyToMessageId,
      reply_markup
    });
  } catch (error) {
    console.error('Pair image send failed; sending text fallback:', error.message);
    return bot.sendMessage(chatId, caption, {
      parse_mode: 'HTML',
      reply_to_message_id: replyToMessageId,
      reply_markup
    });
  }
}

// Send a Telegram update when the newly paired WhatsApp session opens.
function watchPairConnection(waSocket, chatId, pairMessage, phoneJid) {
  if (!waSocket?.ev || !pairMessage?.message_id) return;
  let finished = false;
  let poller;
  let timer;
  let pollCheckRunning = false;
  const phoneDigits = String(phoneJid).replace(/\D/g, '');
  const credsPath = path.join(__dirname, 'kingbadboitimewisher', 'pairing', `${phoneDigits}@s.whatsapp.net`, 'creds.json');

  const finish = () => {
    if (finished) return;
    finished = true;
    waSocket.ev.off('connection.update', onUpdate);
    clearInterval(poller);
    clearTimeout(timer);
  };

  const updateConnected = async () => {
    if (finished) return;
    finish();
    await sleep(1200);
    const phone = getPhoneCountry(phoneJid);
    const country = `${phone.flag} ${phone.name}${phone.callingCode ? ` (+${phone.callingCode})` : ''}`;
    const text = `🎉 <b>BOT CONNECTED NOW!</b>\n\n${makeTelegramTable([
      ['Status', '✅ Successfully linked'],
      ['Number', `+${phone.digits}`],
      ['Country', country]
    ])}`;
    const connectedMarkup = {
      inline_keyboard: [
        [{ text: "📢 WhatsApp Channel", url: WA_CHANNEL_URL }],
        [{ text: "👤 Owner WhatsApp", url: OWNER_WA_URL }]
      ]
    };
    const options = {
      chat_id: chatId,
      message_id: pairMessage.message_id,
      parse_mode: 'HTML'
    };
    try {
      if (pairMessage.photo?.length) await bot.editMessageCaption(text, options);
      else await bot.editMessageText(text, options);
      try {
        await bot.editMessageReplyMarkup(connectedMarkup, {
          chat_id: chatId,
          message_id: pairMessage.message_id
        });
      } catch (markupError) {
        console.log('Could not replace pair keyboard; removing it instead:', markupError.message);
        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
          chat_id: chatId,
          message_id: pairMessage.message_id
        }).catch(() => {});
      }
    } catch (error) {
      console.log('Connected card edit failed; sending confirmation instead:', error.message);
      await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: chatId,
        message_id: pairMessage.message_id
      }).catch(() => {});
      await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_to_message_id: pairMessage.message_id
      }).catch(sendError => console.log('Connected confirmation send failed:', sendError.message));
    }
  };

  const isConnected = () => Boolean(waSocket.ws?.readyState === 1 && waSocket.user?.id);
  const isRegistered = async () => {
    try {
      const creds = JSON.parse(await fs.readFile(credsPath, 'utf8'));
      return creds.registered === true && Boolean(creds.me?.id);
    } catch {
      return false;
    }
  };
  const onUpdate = ({ connection } = {}) => {
    if (connection === 'open' || isConnected()) {
      void updateConnected().catch(error => console.log('Connected status update failed:', error.message));
    }
  };

  poller = setInterval(async () => {
    if (finished || pollCheckRunning) return;
    pollCheckRunning = true;
    try {
      if (isConnected() || await isRegistered()) await updateConnected();
    } catch (error) {
      console.log('Pair connection check failed:', error.message);
    } finally {
      pollCheckRunning = false;
    }
  }, 1000);
  timer = setTimeout(finish, 5 * 60 * 1000);
  timer.unref?.();
  waSocket.ev.on('connection.update', onUpdate);
  if (isConnected()) void updateConnected().catch(error => console.log('Connected status update failed:', error.message));
}

async function readPairedSessionCount() {
  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  let total = 0;
  try {
    const entries = await fs.readdir(pairingFolder, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const creds = JSON.parse(await fs.readFile(path.join(pairingFolder, entry.name, 'creds.json'), 'utf8'));
        if (creds.registered && creds.me?.id) total++;
      } catch {}
    }
  } catch {}
  let online = 0;
  try {
    const startpairing = require('./pair.js');
    online = startpairing.getSessionStats?.().online || 0;
  } catch {}
  return { total, online: Math.min(online, total) };
}

// Basic commands available in private chats and the approved Telegram group.
bot.onText(/^\/start(?:@\w+)?$/i, async (msg) => {
  if (isGroupChat(msg) && !isOfficialGroup(msg)) return;
  return bot.sendMessage(msg.chat.id,
    `💗 Fahim X Pair Bot\n\nUse /pair 8801XXXXXXXXX to pair a WhatsApp number.\nUse /help to see commands.`,
    { reply_to_message_id: msg.message_id }
  );
});

bot.onText(/^\/(help|commands)(?:@\w+)?$/i, async (msg) => {
  if (isGroupChat(msg) && !isOfficialGroup(msg)) return;
  return bot.sendMessage(msg.chat.id,
    `📖 Command List\n\n` +
    `/pair NUMBER — create WhatsApp pairing code\n` +
    `/ping — check Telegram bot response\n` +
    `/about — bot information\n` +
    `/id — show this chat and your user ID\n` +
    `/sessions — total linked sessions (official group admins/owner)\n` +
    `/status — bot uptime and total sessions (admins/owner)\n` +
    `/health — runtime information (admins/owner)\n` +
    `/unpair NUMBER — remove a linked session (owner only, private chat)`
  );
});

bot.onText(/^\/about(?:@\w+)?$/i, async (msg) => {
  if (isGroupChat(msg) && !isOfficialGroup(msg)) return;
  return bot.sendMessage(msg.chat.id,
    `💗 *Fahim X Pair Bot*\n\nTelegram দিয়ে WhatsApp device pair ও session পরিচালনার bot.`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/^\/id(?:@\w+)?$/i, async (msg) => {
  if (isGroupChat(msg) && !isOfficialGroup(msg)) return;
  return bot.sendMessage(msg.chat.id,
    `🆔 Chat ID: \`${msg.chat.id}\`\n👤 User ID: \`${msg.from?.id || 'unknown'}\``,
    { parse_mode: 'Markdown', reply_to_message_id: msg.message_id }
  );
});

bot.onText(/^\/ping(?:@\w+)?$/i, async (msg) => {
  if (isGroupChat(msg) && !isOfficialGroup(msg)) return;
  const start = Date.now();
  const sent = await bot.sendMessage(msg.chat.id, '🏓 Pong...');
  const latency = Date.now() - start;
  await bot.editMessageText(`🏓 Pong!\n⚡ ${latency} ms`, {
    chat_id: msg.chat.id,
    message_id: sent.message_id
  }).catch(() => {});
});

bot.onText(/^\/sessions?(?:@\w+)?$/i, async (msg) => {
  if (!(await canUseSessionCommands(msg))) {
    return bot.sendMessage(msg.chat.id, '🚫 /sessions শুধু official group admin বা owner ব্যবহার করতে পারবেন.');
  }
  const { total } = await readPairedSessionCount();
  return bot.sendMessage(msg.chat.id,
    `📊 *Session Overview*\n\n🔗 Total sessions: *${total}*`,
    { parse_mode: 'Markdown', reply_to_message_id: msg.message_id }
  );
});

bot.onText(/^\/status(?:@\w+)?$/i, async (msg) => {
  if (!(await canUseSessionCommands(msg))) {
    return bot.sendMessage(msg.chat.id, '🚫 /status শুধু official group admin বা owner ব্যবহার করতে পারবেন.');
  }
  const { total } = await readPairedSessionCount();
  const memory = (process.memoryUsage().heapUsed / 1048576).toFixed(1);
  const uptime = Math.floor(process.uptime());
  return bot.sendMessage(msg.chat.id,
    `🤖 *Bot Status*\n\n⏱ Uptime: *${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m*\n💾 Memory: *${memory} MB*\n🔗 Total sessions: *${total}*`,
    { parse_mode: 'Markdown', reply_to_message_id: msg.message_id }
  );
});

bot.onText(/^\/health(?:@\w+)?$/i, async (msg) => {
  if (!(await canUseSessionCommands(msg))) {
    return bot.sendMessage(msg.chat.id, '🚫 /health শুধু official group admin বা owner ব্যবহার করতে পারবেন.');
  }
  const memory = process.memoryUsage();
  const { total } = await readPairedSessionCount();
  return bot.sendMessage(msg.chat.id,
    `🩺 *Runtime Health*\n\nHeap: ${(memory.heapUsed / 1048576).toFixed(1)} MB\nRSS: ${(memory.rss / 1048576).toFixed(1)} MB\nTotal sessions: ${total}\nNode: ${process.version}`,
    { parse_mode: 'Markdown', reply_to_message_id: msg.message_id }
  );
});

// ========== START COMMAND ==========


  // Private chat mein normal start message
  
    
      

// ========== PAIR COMMAND ==========
bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const text = match[1]?.trim();
  if (isGroup && !isOfficialGroup(msg)) {
    await bot.sendMessage(chatId, '🚫 This bot only works in its official group.');
    await bot.leaveChat(chatId).catch(() => {});
    return;
  }

  // Group-এ অবশ্যই এক লাইনে /pair <international-number> দিন।
  // Pairing code group-এ দেখাবে—group-এর সবাই code দেখতে পারবে।
  if (!text && isGroup) {
    return bot.sendMessage(chatId,
      'ব্যবহার: /pair 8801XXXXXXXXX\nদেশের code-সহ WhatsApp number একই command-এ দিন।',
      { reply_to_message_id: msg.message_id }
    );
  }

  // Private DM-এ আগের মতো /pair দিয়ে পরে number পাঠানোর flow থাকবে।
  if (!text) {
    userStates.set(userId, { step: 'awaiting_number', chatId });
    return bot.sendMessage(chatId, 
      `🔐 *ρℓꫀꫝ𝘴e 𝘴end ꪗour ᭙hatsApp ꪀumber*\n\nExample: /pair 8801730768969\n\nOr just type: 8801730768969`,
      { parse_mode: 'Markdown' }
    );
  }

  if (/[a-z]/i.test(text)) {
    return bot.sendMessage(chatId, '❌ *Letters are not allowed.*\n\nPlease send only numbers.', { parse_mode: 'Markdown' });
  }
  
  if (!/^\d{7,15}$/.test(text)) {
    return bot.sendMessage(chatId, '❌ *Invalid format.*\n\nPlease send a valid WhatsApp number.\nExample: 8801xxxxxxxxx', { parse_mode: 'Markdown' });
  }
  
  if (text.startsWith('0')) {
    return bot.sendMessage(chatId, '❌ *Numbers starting with 0 are not allowed.*\n\nPlease include country code.', { parse_mode: 'Markdown' });
  }

  const countryCode = text.slice(0, 3);
  if (["252", "201"].includes(countryCode)) {
    return bot.sendMessage(chatId, '❌ *Numbers with this country code are not supported.*', { parse_mode: 'Markdown' });
  }

  if (pairingInProgress) {
    return bot.sendMessage(chatId, '⏳ অন্য একটি pairing code তৈরি হচ্ছে। একটু পরে আবার চেষ্টা করুন।', { reply_to_message_id: msg.message_id });
  }

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) {
    await fs.mkdir(pairingFolder, { recursive: true });
  }

  const files = await fs.readdir(pairingFolder);
  const pairedCount = files.filter(f => f.endsWith('@s.whatsapp.net')).length;

  if (pairedCount >= 1000) {
    return bot.sendMessage(chatId, '❌ *Pairing limit reached.*\n\nPlease try again later.', { parse_mode: 'Markdown' });
  }

  userStates.delete(userId);

  pairingInProgress = true;
  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId, '⏳ *𝐆ᴇɴᴇʀᴀᴛɪɴɢ ραιʀɪɴɢ ᥴσᴅꫀ...*\n\nρlease ωait α мσᴍᴇɴᴛ.', { parse_mode: 'Markdown' });
    
    const waSocket = await startpairing(Xreturn);
    const cuObj = await waitForPairingCode(pairingFolder, Xreturn);

    const pairMessage = await sendPairCard(chatId, Xreturn, cuObj.code, msg.message_id);
    watchPairConnection(waSocket, chatId, pairMessage, Xreturn);
    return pairMessage;
  } catch (error) {
    console.error('PAIR COMMAND ERROR:', error);
    bot.sendMessage(chatId, '❌ *Pairing service is temporarily unavailable.*\n\nPlease try again later.', { parse_mode: 'Markdown' });
  } finally {
    pairingInProgress = false;
  }
});

// Pair-card buttons use Telegram copy_text and URL buttons; no callback handler is needed.

// ========== TEXT MESSAGE HANDLER ==========
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (msg.chat.type !== 'private') return;
  if (!text) return;
  if (text.startsWith('/')) return;
  
  const userState = userStates.get(userId);
  if (!userState || userState.step !== 'awaiting_number') return;
  
  const phoneRegex = /^\d{7,15}$/;
  if (!phoneRegex.test(text)) return;
  
  userStates.delete(userId);
  
  if (/[a-z]/i.test(text)) {
    return bot.sendMessage(chatId, '❌ Letters are not allowed. Send only numbers.');
  }
  
  if (text.startsWith('0')) {
    return bot.sendMessage(chatId, '❌ Numbers starting with 0 are not allowed.');
  }

  const countryCode = text.slice(0, 3);
  if (["252", "201"].includes(countryCode)) {
    return bot.sendMessage(chatId, '❌ Numbers with this country code are not supported.');
  }

  if (pairingInProgress) {
    return bot.sendMessage(chatId, '⏳ অন্য একটি pairing code তৈরি হচ্ছে। একটু পরে আবার চেষ্টা করুন।');
  }

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) {
    await fs.mkdir(pairingFolder, { recursive: true });
  }

  const files = await fs.readdir(pairingFolder);
  const pairedCount = files.filter(f => f.endsWith('@s.whatsapp.net')).length;

  if (pairedCount >= 1000) {
    return bot.sendMessage(chatId, '❌ Pairing limit reached. Try again later.');
  }

  pairingInProgress = true;
  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId, '⏳ Generating pairing code...');
    
    const waSocket = await startpairing(Xreturn);
    const cuObj = await waitForPairingCode(pairingFolder, Xreturn);

    const pairMessage = await sendPairCard(chatId, Xreturn, cuObj.code, msg.message_id);
    watchPairConnection(waSocket, chatId, pairMessage, Xreturn);
    return pairMessage;

  } catch (error) {
    console.error('PAIRING ERROR:', error);
    bot.sendMessage(chatId, '❌ Pairing failed. Try again later.');
  } finally {
    pairingInProgress = false;
  }
});

// ========== UNPAIR COMMAND ==========
bot.onText(/\/unpair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1]?.trim();
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (isGroup) {
    return bot.sendMessage(chatId, '❌ Please use /unpair in my private chat.', { parse_mode: 'Markdown' });
  }
  if (!isOwner(msg)) {
    return bot.sendMessage(chatId, '🚫 /unpair is restricted to the bot owner.');
  }

  try {
    if (!input) {
      return bot.sendMessage(chatId, 'Example: /unpair 8801xxxxxxxxx', { parse_mode: 'Markdown' });
    }
    if (/[a-z]/i.test(input)) {
      return bot.sendMessage(chatId, 'Letters not allowed. Use: /unpair 8801xxxxxxxxx', { parse_mode: 'Markdown' });
    }
    if (!/^\d{7,15}$/.test(input)) {
      return bot.sendMessage(chatId, 'Invalid format. Use: /unpair 8801xxxxxxxxx', { parse_mode: 'Markdown' });
    }
    if (input.startsWith('0')) {
      return bot.sendMessage(chatId, 'Numbers starting with 0 not allowed.', { parse_mode: 'Markdown' });
    }

    const jidSuffix = `${input}`;
    const pairingPath = path.join(__dirname, 'kingbadboitimewisher', 'pairing');

    if (!(await exists(pairingPath))) {
      return bot.sendMessage(chatId, 'No paired devices found.');
    }

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    const matched = entries.find(entry => entry.isDirectory() && entry.name.endsWith(jidSuffix));

    if (!matched) {
      return bot.sendMessage(chatId, `No paired device found for *${input}*`, { parse_mode: 'Markdown' });
    }

    const targetPath = path.join(pairingPath, matched.name);
    await fs.rm(targetPath, { recursive: true, force: true });

    return bot.sendMessage(chatId, `✅ Paired user *${input}* has been deleted successfully`, { parse_mode: 'Markdown' });

  } catch (err) {
    console.error('UNPAIR ERROR:', err);
    bot.sendMessage(chatId, 'Failed to delete paired user. Please try again.');
  }
});

// Auto-leave every Telegram group except the configured official group.
async function enforceGroupAllowlist(chat) {
  if (!chat || !['group', 'supergroup'].includes(chat.type)) return;
  if (String(chat.id) === ALLOWED_GROUP_ID) return;
  console.log('Leaving unauthorized Telegram group:', chat.id);
  await bot.leaveChat(chat.id).catch(error => console.error('Could not leave unauthorized group:', error.message));
}

bot.on('my_chat_member', async (update) => {
  const status = update?.new_chat_member?.status;
  if (['member', 'administrator'].includes(status)) await enforceGroupAllowlist(update.chat);
});

bot.on('new_chat_members', async (msg) => {
  const me = await bot.getMe().catch(() => null);
  if (me && msg.new_chat_members?.some(member => member.id === me.id)) {
    await enforceGroupAllowlist(msg.chat);
  }
});

// ========== POLLING ERROR HANDLER ==========
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// ========== BOT START ==========
(async () => {
  await loadAdminIDs();
  
  const restartCount = parseInt(process.env.RESTART_COUNT || 0);
  console.log(`RESTART #${restartCount + 1}`);
  process.env.RESTART_COUNT = String(restartCount + 1);

  console.log('🤖 Telegram Bot is running...');
  console.log('✅ Bot Username: @bot_hosting_v1_bot');
  console.log('✅ Commands: /pair /unpair /ping /help /about /id /sessions /status /health');
})();

// ========== PROCESS HANDLERS ==========
process.on("uncaughtException", (err) => {
  console.error('Uncaught Exception:', err);
});
process.on("unhandledRejection", (err) => {
  console.error('Unhandled Rejection:', err);
});
process.removeAllListeners("warning");
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('message', (msg) => {
  if (msg === 'shutdown') gracefulShutdown('PM2_SHUTDOWN');
});
