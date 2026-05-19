
import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

/**
 * Clean Standalone WhatsApp Pairing Script
 * Use: npm run bot
 */
async function startBot() {
  const phoneNumber = "94781229710"; // Hardcoded for testing
  const sessionPath = path.join(process.cwd(), 'session_auth');
  
  console.log(`\n[SITHU MD] Starting clean pairing process for: ${phoneNumber}`);
  
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any,
    // Critical: Desktop identity to avoid "Couldn't link device" errors
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('\n[SUCCESS] SITHU MD connected successfully!');
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[INFO] Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  try {
    // Wait for the socket to stabilize before requesting the code
    await delay(5000); 
    
    if (!sock.authState.creds.registered) {
      console.log('[INFO] Requesting 8-digit pairing code...');
      const code = await sock.requestPairingCode(phoneNumber);
      
      console.log("\n=========================================");
      console.log("🚀 SITHU MD WHATSAPP PAIRING CODE");
      console.log(`👉 CODE: ${code}`);
      console.log("=========================================\n");
      console.log("Steps to link:");
      console.log("1. Open WhatsApp on your phone.");
      console.log("2. Go to Linked Devices > Link a Device.");
      console.log("3. Select 'Link with phone number instead'.");
      console.log("4. Enter the code shown above.");
    } else {
      console.log('[INFO] Bot is already registered/linked.');
    }
  } catch (error: any) {
    console.error("\n[ERROR] Failed to obtain pairing code:", error.message);
  }
}

startBot();
