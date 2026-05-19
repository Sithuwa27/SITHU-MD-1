
import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import qrcodeTerminal from 'qrcode-terminal';

/**
 * SITHU MD Bot Standalone Script
 * QR Code Authentication Method
 */
async function startBot() {
  const sessionPath = './session_data';
  
  // Ensure session directory exists
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // We'll handle QR manually with qrcode-terminal
    logger: pino({ level: 'silent' }) as any,
    browser: ['Mac OS', 'Safari', '10.15.7'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Display QR Code if received
    if (qr) {
      console.log("\n=========================================");
      console.log("🚀 SITHU MD WHATSAPP QR CODE");
      console.log("=========================================\n");
      qrcodeTerminal.generate(qr, { small: true });
      console.log("\nInstructions:");
      console.log("1. Open WhatsApp on your phone.");
      console.log("2. Go to Linked Devices > Link a Device.");
      console.log("3. Scan the QR code above.\n");
    }

    if (connection === 'open') {
      console.log('\n[INFO] Bot is fully connected!');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[INFO] Connection closed. Status Code: ${statusCode}`);
      
      if (shouldReconnect) {
        console.log('[INFO] Restarting bot automatically...');
        startBot();
      } else {
        console.log('[ERROR] Logged out. Please delete "session_data" folder and restart.');
      }
    }
  });
}

// Global error handling
process.on('uncaughtException', (err) => {
  console.error('[FATAL ERROR]', err);
});

startBot();
