// commands/welcome.js
const banglaStatus = [
  "🌸 নতুন অতিথি এসেছে, গ্রুপের হাওয়া বদলে গেলো!",
  "✨ তোমায় পেয়ে আমাদের পরিবার আরও রঙিন!",
  "💙 হাসিমুখে থেকো, গ্রুপ জমিয়ে রাখবে আশা করি!",
  "🌺 নতুন রাজা এসে গেছে আমাদের গ্রুপে!",
  "🔥 চল আজকে একটু ভিন্নরকম মজা হোক!",
  "🎉 গ্রুপে ঢুকেই তোমার এন্ট্রি স্টাইলিশ!",
  "🌼 আশা করি তুমি দারুণ অ্যাক্টিভ থাকবে!",
  "😎 এসে যাও, এখন শুরু হোক আড্ডার রাজত্ব!",
  "💫 তোমার কারণে গ্রুপের মান আরও আপ!",
  "😂 গ্রুপের টেনশন এখন তোমার হাতে!",
  "🌟 তোমায় ছাড়া গ্রুপটা যেন অসম্পূর্ণ ছিলো!",
  "🌷 তোমাকে দেখে গ্রুপের ভাইব আপ হয়ে গেলো!",
  "🔥 মনে হচ্ছে আজ গ্রুপে ঝড় আসছে!",
  "🐥 গ্রুপে এক ফ্রেশ ভাইব ঢুকে গেছে!",
  "💖 সবাইকে চমক দিতে তুমি এসেছো!",
  "😄 গ্রুপে নতুন হাসির ঝিলিক!",
  "🌈 আজ গ্রুপটা ফ্রেশ কারণ তুমি এসেছো!",
  "⚡ তোমার এন্ট্রি = পুরো গ্রুপ চার্জড!",
  "🎭 এখন থেকে গ্রুপে শুরু হবে আসল মজা!",
  "💥 সাবধান! নতুন মেম্বার = নতুন ঝগড়া ও হাসি!",
  "😂 ভাবছো শুধু এড হয়েছো? না! এখন তুমি পরিবারের অংশ!",
  "🔮 মনে হচ্ছে তুমি গ্রুপের হিডেন লিজেন্ড!",
  "😻 তোমার এন্ট্রি গ্রুপে কিউট ভাইব এনেছে!",
  "🔥 গ্রুপে তোমার মতো একজনকেই দরকার ছিলো!"
];

module.exports = {
  name: "welcome",
  
  // গ্রুপে নতুন কেউ জয়েন করলে Baileys ইভেন্ট থেকে কল হবে
  handleGroupParticipants: async (bad, update) => {
    try {
      const { id, participants, action } = update;
      
      if (action !== 'add') return;

      const groupInfo = await bad.groupMetadata(id);
      const groupName = groupInfo.subject;
      const totalMembers = groupInfo.participants.length;

      for (const member of participants) {
        let profilePicUrl;
        try {
          profilePicUrl = await bad.profilePictureUrl(member, 'image');
        } catch {
          profilePicUrl = null;
        }

        const username = `@${member.split('@')[0]}`;
        const randomStatus = banglaStatus[Math.floor(Math.random() * banglaStatus.length)];

        // ১. প্রথম মেসেজ: কাস্টম ওয়েলকাম টেক্সট
        const welcomeMessage = `🦢 *⎯͢✧ 𝐇ᴇʏ ${username}, ⎯͢✧ আমাদের গ্রুপ ${groupName}-এ তোমাকে স্বাগতম!* ✨

💗 *⎯͢✧ ${randomStatus}* 🎧...

🏠 *⎯͢✧ মোট সদস্য:* ${totalMembers}

🌟 *⎯͢✧ নিয়ম:* অ্যাক্টিভ থাকো, সবাইকে রেসপেক্ট দাও ও মজা করো!

⎯͢✧🤖 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 ⎯͢✧🐱

⎯͢✧🌷 > *ᥫ᭡⃝—͞𝐅𝐚𝐡𝐢𝐦 𝐁𝐛𝐳ᥫ᭡..࿐🌼⃠*`;

        if (profilePicUrl) {
          await bad.sendMessage(id, {
            image: { url: profilePicUrl },
            caption: welcomeMessage,
            mentions: [member]
          });
        } else {
          await bad.sendMessage(id, {
            text: welcomeMessage,
            mentions: [member]
          });
        }

        // ১.৫ সেকেন্ডের ডিলে (যাতে মেসেজ ওভারল্যাপ না করে)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // ২. দ্বিতীয় মেসেজ: স্টাইলিশ ইন্ট্রো ফর্ম
        const introMessage = `╭══──────══╮
   𝘎𝘪𝘷𝘦 𝘠𝘰𝘶𝘳 𝘐𝘯𝘵𝘳ο 
   ${username}
${groupName}
╰══──────══╯

╭══──────══╮
 ☞𓋜𝐍ꫝ𝐦𝐞: 𓂃 ࣪˖ ִֶָ
𓋜𝐀𝐠𝐞: ✮⃝🖤
𓋜𝐂𝐥𝐚𝐬𝐬: 𓂃 ࣪˖ ִֶָ✨
𓋜𝐟𝐯𝐭 𝐢𝐦𝐨𝐣𝐢: 𓂃 ࣪˖ ִֶָ
𓋜𝐅𝐫𝐨𝐦: 𓂃 ࣪˖ ִֶָ📍
𓋜𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧:  𓂃 ࣪˖ ִֶ
╰═════════════
╭══──────══╮
   𝘛𝘩𝘯𝘬 𝘺𝘰𝘶 𝘍𝘰𝘳 𝘢𝘥𝘳𝘦𝘴𝘴
╰══──────══╯`;

        await bad.sendMessage(id, {
          text: introMessage,
          mentions: [member]
        });
      }
    } catch (e) {
      console.error("Welcome Event Error:", e);
    }
  }
};
