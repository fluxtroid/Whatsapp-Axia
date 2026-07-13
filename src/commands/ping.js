module.exports = {
    name: 'ping',
    category: 'General 🛠️', 
    desc: 'Bot ගේ ක්‍රියාකාරීත්වය පරීක්ෂා කිරීම',
    execute: async (sock, msg, args) => {
        // බොට්ගෙන් යන රිප්ලයි එක
        await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! 🏓 Bot is active and running perfectly.' }, { quoted: msg });
    }
};
