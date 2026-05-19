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
 * Optimized Standalone WhatsApp Pairing Script
 * Use: npm run bot
 */
async function startBot() {
  const phoneNumber = "94781229710"; // Hardcoded for testing
  const sessionPath = path.join(process.cwd(), 'session_data');
  
  console.log(`\n[SITHU MD] Initializing fresh connection for: ${phoneNumber}`);
  console.log(`[INFO] Using session directory: ${sessionPath}`);
  
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
    // Strictly mimicking macOS Safari for maximum compatibility
    browser: ['Mac OS', 'Safari', '10.15.7'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 25000,
  });

  // Save credentials whenever updated
  sock.ev.on('creds.update', saveCreds);

  // Monitor connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log('\n[SUCCESS] SITHU MD connected successfully!');
      
      // Request pairing code only if not already registered
      if (!sock.authState.creds.registered) {
        console.log('[INFO] Stabilizing connection. Waiting 3 seconds before requesting pairing code...');
        await delay(3000); // Stabilization delay as requested
        
        try {
          console.log('[INFO] Requesting 8-digit pairing code...');
          const code = await sock.requestPairingCode(phoneNumber);
          
          console.log("\n=========================================");
          console.log("🚀 SITHU MD WHATSAPP PAIRING CODE");
          console.log(`👉 CODE: ${code}`);
          console.log("=========================================\n");
          console.log("Instructions:");
          console.log("1. Open WhatsApp on your phone.");
          console.log("2. Go to Linked Devices > Link a Device.");
          console.log("3. Select 'Link with phone number instead'.");
          console.log("4. Enter the code shown above.");
        } catch (error: any) {
          console.error("\n[ERROR] Failed to obtain pairing code:", error.message);
        }
      } else {
        console.log('[INFO] Bot is already registered/linked.');
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[INFO] Connection closed. Status Code: ${statusCode}`);
      
      if (shouldReconnect) {
        console.log('[INFO] Reconnecting in 5 seconds...');
        setTimeout(() => startBot(), 5000);
      } else {
        console.log('[ERROR] Logged out from WhatsApp. Please delete the "session_data" folder and restart.');
      }
    }
  });
}

// Global error handling for the script
process.on('uncaughtException', (err) => {
  console.error('[FATAL ERROR]', err);
});

startBot();
