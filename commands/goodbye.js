// commands/goodbye.js
const funnyLines = [
  "⎯͢✧ পার্টি দেওয়ার ভয়ে @name পালিয়ে গেলো 😹",
  "⎯͢✧ গ্রুপের ড্রামা দেখে @name সাইলেন্ট লিভ দিলো 😂",
  "⎯͢✧ আজকের ভিকটিম @name — উধাও হয়ে গেলো 🤣",
  "⎯͢✧ @name মনে হয় WiFi অফ করে পালিয়েছে 😆",
  "⎯͢✧ মেসেজের ভয় পেয়ে @name দৌড় দিয়েছে 😹",
  "⎯͢✧ গ্রুপের পাগলামি সহ্য করতে না পেরে @name চলে গেলো 😂",
  "⎯͢✧ কেউ পার্টি বললেই @name হারিয়ে যায় 🤣",
  "⎯͢✧ @name বললো “আমি ব্যস্ত” তারপর অফলাইন 😹",
  "⎯͢✧ গ্রুপে ঢুকেই বুঝলো ভুল জায়গা—@name লিভ 😂",
  "⎯͢✧ অতিরিক্ত হাসি সহ্য না করে @name পালালো 🤣",
  "⎯͢✧ @name শেষ পর্যন্ত টিকতে পারলো না 😹",
  "⎯͢✧ গ্রুপের নোটিফিকেশন দেখে @name ভয়ে পালালো 😂",
  "⎯͢✧ কেউ ‘hi’ বলতেই @name উধাও 🤣",
  "⎯͢✧ @name বললো “bye” না বলেই bye দিলো 😹",
  "⎯͢✧ গ্রুপের এনার্জি সহ্য না করে @name লিভ 😂",
  "⎯͢✧ @name আর এই পাগল গ্রুপ সহ্য করতে পারলো না 🤣",
  "⎯͢✧ মেসেজ দেখে @name স্ট্রেস নিয়ে বের হয়ে গেলো 😹",
  "⎯͢✧ গ্রুপে ঢুকেই বুঝলো—এখানে টিকে থাকা কঠিন @name 😂"
];

module.exports = {
  handleGroupParticipants: async (bad, update) => {
    const { id, participants, action } = update;
    
    // শুধুমাত্র লিভ নিলে বা রিমুভ করলেই কাজ করবে
    if (action !== 'remove' && action !== 'leave') return;

    for (const member of participants) {
      const name = member.split('@')[0];
      const mention = `@${name}`;
      const line = funnyLines[Math.floor(Math.random() * funnyLines.length)].replace("@name", mention);
      
      const text = `${line}\n\n> *ᥫ᭡⃝—͞𝐅𝐚𝐡𝐢𝐦 𝐁𝐛𝐳ᥫ᭡..࿐🌼⃠*`;

      await bad.sendMessage(id, { 
        text, 
        mentions: [member] 
      });
    }
  }
};
