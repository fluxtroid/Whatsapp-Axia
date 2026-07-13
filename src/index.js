const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

let isPairing = false; 
const commands = new Map();

const loadCommands = () => {
    const cmdPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(cmdPath)) {
        fs.mkdirSync(cmdPath, { recursive: true });
    }
    const files = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const cmd = require(`./commands/${file}`);
        if (cmd.name) {
            commands.set(cmd.name, cmd);
        }
    }
};

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
        // [FIX] WhatsApp Security Update එකට ගැළපෙන පරිදි Baileys හි නිල Browser සැකසුම භාවිතා කිරීම
        browser: Browsers.ubuntu('Chrome'), 
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !sock.authState.creds.registered && !isPairing) {
            isPairing = true;
            const phoneNumber = await question('\n☎️ කරුණාකර ඔබේ WhatsApp අංකය ඇතුළත් කරන්න (උදා - 947XXXXXXXX): ');
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, ''); 
            
            console.log('🔄 Pairing Code එක ලබා ගනිමින් පවතී... (කරුණාකර රැඳී සිටින්න)');
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                
                console.log(`\n🔑 ඔබේ Pairing Code එක: ${code}\n`);
                console.log('WhatsApp ඇප් එකට ගොස් Linked Devices -> Link with phone number යටතේ මෙම කේතය ඇතුළත් කරන්න.');
            } catch (error) {
                console.error('\n❌ Pairing Code ලබාගැනීමට නොහැකි විය. Error:', error.message);
                isPairing = false; 
            }
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            
            if (reason === DisconnectReason.loggedOut || reason === 405) {
                console.log(`\n❌ Session එක අවලංගු වී ඇත (Reason: ${reason}).`);
                console.log('🗑️ පරණ Session දත්ත ස්වයංක්‍රීයව මකා දමමින් පවතී...');

                // [NEW] අතින් delete කරනවා වෙනුවට Bot විසින්ම ෆෝල්ඩරය මකා දැමීම
                const authPath = path.join(__dirname, '..', 'auth_info_baileys');
                if (fs.existsSync(authPath)) {
                    fs.rmSync(authPath, { recursive: true, force: true });
                    console.log('✅ පරණ දත්ත මකා දමන ලදි! කරුණාකර නැවත "npm start" ලබා දෙන්න.\n');
                }
                process.exit(0); 
            } else {
                console.log(`⚠️ Connection closed (Reason: ${reason}). ආරක්ෂිතව නැවත සම්බන්ධ වෙමින් පවතී...`);
                setTimeout(() => startBot(), 3000); 
            }
        } else if (connection === 'open') {
            console.log('✅ Bot Connected Successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const config = getConfig();
        const sender = remoteJid;
        const isOwner = sender === config.ownerNumber;

        if (config.mode === 'private' && !isOwner) return;

       const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

// මේ පේළිය අලුතින් එකතු කරන්න
console.log("අලුත් මැසේජ් එකක් ආවා:", text); 

const prefix = config.prefix;
        
        if (!text || !text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            try {
                await sock.readMessages([msg.key]);
                await sock.sendPresenceUpdate('composing', remoteJid);
                
                const typingTime = Math.floor(Math.random() * 1000) + 1000; 
                await delay(typingTime);

                await commands.get(commandName).execute(sock, msg, args, commands, config);

                await sock.sendPresenceUpdate('paused', remoteJid);
                
            } catch (error) {
                console.error(`Error executing ${commandName}:`, error);
                await sock.sendPresenceUpdate('paused', remoteJid); 
            }
        }
    });
}

startBot();
