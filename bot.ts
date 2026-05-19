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
 * SITHU MD Bot Standalone Script
 * Optimized for stability with macOS Safari identity and pairing code.
 */
async function startBot() {
  const phoneNumber = "94781229710";
  const sessionPath = './session_data';
  
  // Ensure session directory exists to prevent ENOENT errors
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  // 1. Use relative path for auth state
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // 2. Configure socket with macOS Safari identity to avoid disconnection
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any,
    browser: ['Mac OS', 'Safari', '10.15.7'],
  });

  // 3. Save credentials properly
  sock.ev.on('creds.update', saveCreds);

  // 4. Connection monitoring and auto-restart
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log('\n[INFO] Bot is fully connected!');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[INFO] Connection closed. Status Code: ${statusCode}`);
      
      if (shouldReconnect) {
        console.log('[INFO] Restarting bot automatically to maintain connection...');
        startBot();
      } else {
        console.log('[ERROR] Logged out from WhatsApp. Please delete "session_data" folder and restart.');
      }
    }
  });

  // 5. Request pairing code right after initialization if not registered
  if (!sock.authState.creds.registered) {
    console.log("[INFO] Stabilizing connection. Please wait 3 seconds...");
    await delay(3000); // Essential delay for socket stability before requesting code
    
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log("\n=========================================");
      console.log("🚀 SITHU MD WHATSAPP PAIRING CODE");
      console.log(`👉 CODE: ${code}`);
      console.log("=========================================");
      console.log("Instructions:");
      console.log("1. Open WhatsApp on your phone.");
      console.log("2. Go to Linked Devices > Link a Device.");
      console.log("3. Select 'Link with phone number instead'.");
      console.log("4. Enter the code displayed above.\n");
    } catch (error: any) {
      console.error("[ERROR] Failed to obtain pairing code:", error.message);
    }
  }
}

// Global process error handling to prevent script hanging
process.on('uncaughtException', (err) => {
  console.error('[FATAL ERROR]', err);
});

startBot();
