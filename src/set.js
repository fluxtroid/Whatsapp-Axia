const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set',
    category: 'Settings ⚙️',
    desc: 'Bot ගේ සැකසුම් වෙනස් කිරීම (උදා: !set botname My Bot)',
    execute: async (sock, msg, args, commands, config) => {
        
        // මෙය කළ හැක්කේ Owner ට පමණක් බව තහවුරු කිරීම
        if (msg.key.remoteJid !== config.ownerNumber) {
            return await sock.sendMessage(msg.key.remoteJid, { text: '❌ ඔබට මෙම විධානය භාවිතා කිරීමට අවසර නොමැත.' }, { quoted: msg });
        }

        if (args.length < 2) {
            return await sock.sendMessage(msg.key.remoteJid, { 
                text: `⚠️ කරුණාකර නිවැරදිව ලබා දෙන්න.\n\n*උදාහරණ:*\n${config.prefix}set prefix #\n${config.prefix}set mode private\n${config.prefix}set botname Super Bot\n${config.prefix}set owner 94712345678` 
            }, { quoted: msg });
        }

        const type = args[0].toLowerCase();
        const value = args[1]; // පළමු වචනය
        const fullValue = args.slice(1).join(' '); // හිස්තැන් සහිත සම්පූර්ණ වචනය (නම සඳහා)
        
        let replyMsg = '';

        if (type === 'prefix') {
            config.prefix = value.toLowerCase();
            replyMsg = `✅ Prefix එක සාර්ථකව [ *${config.prefix}* ] ලෙස වෙනස් කරන ලදි.`;
        
        } else if (type === 'mode') {
            const modeValue = value.toLowerCase();
            if (modeValue === 'public' || modeValue === 'private') {
                config.mode = modeValue;
                replyMsg = `✅ Bot Mode එක සාර්ථකව *${modeValue.toUpperCase()}* ලෙස වෙනස් කරන ලදි.`;
            } else {
                return await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Mode එක විය හැක්කේ "public" හෝ "private" පමණි.' }, { quoted: msg });
            }
        
        } else if (type === 'botname') {
            config.botName = fullValue;
            replyMsg = `✅ Bot Name එක සාර්ථකව *${fullValue}* ලෙස වෙනස් කරන ලදි.`;
        
        } else if (type === 'owner') {
            // ලබා දුන් අංකයේ ඇති + ලකුණු හෝ හිස්තැන් ඉවත් කර පිරිසිදු අංකය පමණක් ලබා ගැනීම
            const cleanNumber = value.replace(/[^0-9]/g, '');
            config.ownerNumber = `${cleanNumber}@s.whatsapp.net`;
            replyMsg = `✅ Owner Number එක සාර්ථකව *${cleanNumber}* ලෙස වෙනස් කරන ලදි.\n\n⚠️ _අවධානයට: දැන් සිට Bot ගේ සැකසුම් වෙනස් කළ හැක්කේ මෙම නව අංකයට පමණි!_`;
        
        } else {
            return await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ වැරදි සැකසුම් වර්ගයකි. (භාවිතා කළ හැක්කේ: prefix, mode, botname, owner)' }, { quoted: msg });
        }

        // වෙනස් කළ සැකසුම් නැවත config.json ගොනුවට සුරැකීම
        const configPath = path.join(__dirname, '..', 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        await sock.sendMessage(msg.key.remoteJid, { text: replyMsg }, { quoted: msg });
    }
};
