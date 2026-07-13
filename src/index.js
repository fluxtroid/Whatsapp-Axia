const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const commands = new Map();

const loadCommands = () => {
    const cmdPath = path.join(__dirname, 'commands');
    const files = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const cmd = require(`./commands/${file}`);
        if (cmd.name) {
            commands.set(cmd.name, cmd);
        }
    }
};

// config.json ගොනුව කියවීම සඳහා function එකක්
const getConfig = () => {
    const configPath = path.join(__dirname, 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

async function startBot() {
    loadCommands();
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['FluxTroid Bot', 'Chrome', '1.0.0']
    });

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const phoneNumber = await question('කරුණාකර ඔබේ WhatsApp අංකය ඇතුළත් කරන්න: ');
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, ''); 
            const code = await sock.requestPairingCode(cleanNumber);
            console.log(`\n🔑 ඔබේ Pairing Code එක: ${code}\n`);
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot Connected Successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const config = getConfig(); // පණිවිඩයක් ආවම නවතම සැකසුම් ලබාගැනීම
        const sender = msg.key.remoteJid;
        const isOwner = sender === config.ownerNumber;

        // Private mode එකේදී අයිතිකරුට හැර අන් අයට වැඩ නොකිරීම
        if (config.mode === 'private' && !isOwner) {
            return;
        }

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const prefix = config.prefix;
        
        if (!text || !text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            try {
                // Command එකට config එකත් යවනවා, එවිට ඇතුළතදී භාවිතා කළ හැක
                await commands.get(commandName).execute(sock, msg, args, commands, config);
            } catch (error) {
                console.error(`Error executing ${commandName}:`, error);
            }
        }
    });
}

startBot();
