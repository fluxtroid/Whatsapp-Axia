module.exports = {
    name: 'menu',
    category: 'General 🛠️',
    desc: 'සියලුම Command ලබා ගැනීම',
    execute: async (sock, msg, args, commands, config) => {
        
        let menuText = `╭━━━〔 *Whatsapp Axia* 〕━━━⬣\n`;
        menuText += `┃ 👨‍💻 *Owner:* FluxTroid\n`;
        menuText += `┃ 🚀 *Mode:* ${config.mode.toUpperCase()}\n`;
        menuText += `┃  Prefix: [ *${config.prefix}* ]\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n\n`;

        const categories = {};
        commands.forEach((cmd) => {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(cmd);
        });

        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `╭───「 *${category}* 」\n`;
            cmds.forEach((cmd) => {
                menuText += `│ ❖ ${config.prefix}${cmd.name} - _${cmd.desc}_\n`;
            });
            menuText += `╰───────────────⬣\n\n`;
        }

        // ඡායාරූපයක් ලබා දී ඇත්නම් එය සමඟ මෙනුව යැවීම, නැතිනම් සාමාන්‍ය පණිවිඩයක් ලෙස යැවීම
        if (config.menuImage && config.menuImage.trim() !== "") {
            await sock.sendMessage(msg.key.remoteJid, { 
                image: { url: config.menuImage }, 
                caption: menuText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
        }
    }
};
