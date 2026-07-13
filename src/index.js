const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function startBot() {
    // Session data සුරක්ෂිතව තබා ගැනීම සඳහා
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Socket connection එක සෑදීම
    const sock = makeWASocket({
        printQRInTerminal: true, // QR කේතය terminal එකේ පෙන්වීම
        auth: state,
        logger: pino({ level: 'silent' }) // අනවශ්‍ය logs පෙන්වීම නැවැත්වීම
    });

    // Connection එකේ වෙනස්කම් හඳුනා ගැනීම (QR scan කිරීම, Disconnect වීම)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            startBot(); // Disconnect වුවහොත් නැවත සම්බන්ධ වීම
        } else if (connection === 'open') {
            console.log('✅ Bot Connected Successfully!');
        }
    });

    // Session credentials අලුත් වන විට එය save කිරීම
    sock.ev.on('creds.update', saveCreds);

    // අලුත් පණිවිඩයක් පැමිණි විට
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // පණිවිඩය හිස් නම් හෝ එය bot විසින්ම යැවූවක් නම් අතහැර දැමීම
        if (!msg.message || msg.key.fromMe) return;

        // පණිවිඩයේ අන්තර්ගතය ලබා ගැනීම
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (text === '!ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! 🏓 Bot is active.' });
        }
    });
}

startBot();
