const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// Terminal එකෙන් දුරකථන අංකය ලබා ගැනීමට readline සකස් කිරීම
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Socket connection එක සෑදීම (QR පෙන්වීම නවතා ඇත)
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // QR කේතය අවශ්‍ය නොවේ
        browser: ['FluxTroid Bot', 'Chrome', '1.0.0'] // Linked devices වල පෙන්වන නම
    });

    // පරිශීලකයා කලින් ලොග් වී නොමැති නම් Pairing Code එකක් ඉල්ලීම
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const phoneNumber = await question('කරුණාකර ඔබේ WhatsApp අංකය ඇතුළත් කරන්න (උදා - 947XXXXXXXX): ');
            // දුරකථන අංකයේ ඇති හිස්තැන් හෝ + ලකුණු ඉවත් කිරීම
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, ''); 
            
            const code = await sock.requestPairingCode(cleanNumber);
            console.log(`\n🔑 ඔබේ Pairing Code එක: ${code}\n`);
            console.log('WhatsApp ඇප් එකට ගොස් Linked Devices -> Link with phone number යටතේ මෙම කේතය ඇතුළත් කරන්න.');
        }, 3000); // Socket එක නිසි ලෙස ආරම්භ වීමට කුඩා වේලාවක් ලබා දීම
    }

    // Connection එකේ වෙනස්කම් හඳුනා ගැනීම
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot Connected Successfully!');
        }
    });

    // Session credentials අලුත් වන විට එය save කිරීම
    sock.ev.on('creds.update', saveCreds);

    // අලුත් පණිවිඩයක් පැමිණි විට
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (text === '!ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! 🏓 Bot is active.' });
        }
    });
}

startBot();
