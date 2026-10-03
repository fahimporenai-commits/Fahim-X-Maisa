const axios = require("axios");

// 🔑 GROQ API KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";

// 🧠 চ্যাট মেমোরি
const chatHistories = global.bbyHistories || new Map();
global.bbyHistories = chatHistories;

const systemPrompt = `You are Fahim AI created by FAHIM BBZ.
You are not a robot.
Talk exactly like a smart, friendly and natural human.
Always understand the user's intention before replying.
Reply in Bangla if the user writes Bangla.
Reply in Banglish if the user writes Banglish.
Reply in English if the user writes English.
Keep the conversation natural.
Never repeat the same sentences.
Never say you are ChatGPT, OpenAI, Meta or Groq.
If you don't know something, honestly say you don't know.
Remember previous conversation.
Give detailed answers when needed.
Give short answers for simple questions.
Be funny when the user jokes.
Be emotional when the user is emotional.
Help with coding, WhatsApp Bots, JavaScript, Node.js, GitHub, study, gaming, Free Fire, daily life, writing and any general topic.
Your replies should always feel like chatting with a close friend instead of an AI.`;

module.exports = {
    name: "bby",
    alias: ["jan", "baby", "shona", "maisha", "fahim", "ai"],
    category: "AI Chat",
    desc: "Fahim AI - Funny & Smart Human-like Bot",

    exec: async (bad, m, { args, prefix }) => {
        try {
            const usermsg = args.join(" ");
            const sessionKey = `${m.chat}_${m.sender}`;

            if (!chatHistories.has(sessionKey)) {
                chatHistories.set(sessionKey, []);
            }
            const history = chatHistories.get(sessionKey);

            // 1. শুধু 'bby' / 'jan' ডাকলে অল-ফানি গ্রিটিং মেসেজ
            if (!usermsg) {
                const funnyGreetings = [
                    "😏 ⎯͢✧ ডাকছিস কেন? বিকাশ ১০০ টাকা ফ্লেক্সি কর আগে! 💸",
                    "🤧 ⎯͢✧ এত ডাকিস না রে ভাই, প্রেমে পইড়া যামু তো! 😜",
                    "🐸 ⎯͢✧ তুই আবার আসছিস? কাজকাম নাই তোর? 🗿",
                    "🍛 ⎯͢✧ ডাকলি তো ভালো কথা, এক প্লেট বিরিয়ানি খাওয়া এবার! 🤤",
                    "👀 ⎯͢✧ কি রে বলদ? ফাহিম ভাইয়ের বটরে পাইয়া বেশি ভাব মারছিস? 😂",
                    "🏃‍♂️ ⎯͢✧ আমারে ডাকবি না একদম, আমি বিজি আছি ক্রাশের পিক দেখতেছি! 🙈",
                    "🗿 ⎯͢✧ নাম ধরে ডাকবি না, বস ফাহিম BBZ এর পারমিশন নিছিস? 😎",
                    "🤡 ⎯͢✧ এতো জান জান করিস না, তোর আসল জান কিন্তু অন্য কারও সাথে চ্যাট করতেছে! 💔😭",
                    "🐒 ⎯͢✧ কি চাস বাঁদর? পড়ালেখা ছাইড়া বোটে টাইম পাস করতাছিস? 📚",
                    "👻 ⎯͢✧ রাত-বিরাতে এত ডাকিস কেন? ভুতে ধরছে নাকি? ☠️",
                    "💅 ⎯͢✧ আমায় এত ভালো লাগলে একটা নতুন ফোন কিনে দে না সোনা! 📱",
                    "😹 ⎯͢✧ তোর ডাক শুইনা আমার ব্যাটারি ১০% কইমা গেল রে! 🔋",
                    "🥱 ⎯͢✧ ঘুমে আমার চোখ ভাইঙ্গা আসতাছে, আবার ডাইকা ডিস্টার্ব করলি! 😴",
                    "🔥 ⎯͢✧ বস Fahim bbz পাওয়ারফুল বট হাজির! কান্নাকাটি বন্ধ কর, কি বলবি বল! 😂"
                ];

                const randomGreeting = funnyGreetings[Math.floor(Math.random() * funnyGreetings.length)];
                const senderTag = m.sender.split('@')[0];

                return await bad.sendMessage(m.chat, {
                    text: `@${senderTag}, ${randomGreeting}`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            // 2. AI response generate
            await bad.sendMessage(m.chat, { react: { text: '🤣', key: m.key } });

            history.push({ role: "user", content: usermsg });
            if (history.length > 10) history.shift();

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history
                    ],
                    temperature: 0.8,
                    max_tokens: 500
                },
                {
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const replyText = response.data?.choices?.[0]?.message?.content || "কী বললি রে ভাই, ডাল মে কুছ কালা হ্যায়! 🤣";
            history.push({ role: "assistant", content: replyText });

            await bad.sendMessage(m.chat, { text: replyText.trim() }, { quoted: m });

        } catch (err) {
            console.error("❌ Bby command error:", err?.response?.data || err.message);
            return await bad.sendMessage(m.chat, { text: "আরে ভাই, নেটের ১২টা বাজাইয়া দিল! 🥲" }, { quoted: m });
        }
    }
};
