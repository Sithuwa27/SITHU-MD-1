
import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  Browsers,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

/**
 * Standalone WhatsApp Pairing Script
 * This script runs independently from the terminal to get the pairing code.
 */
async function startBot() {
  const phoneNumber = "94781229710"; // Hardcoded as requested
  const sessionPath = path.join(process.cwd(), 'session_data');
  
  console.log(`\n[SITHU MD] Starting pairing process for: ${phoneNumber}`);
  
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
    browser: Browsers.macOS('Desktop'),
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
  });

  sock.ev.on('creds.update', saveCreds);

  // Connection monitoring
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('\n[SUCCESS] SITHU MD is now connected to WhatsApp!');
    }
    if (connection === 'close') {
      console.log('[INFO] Connection closed. Restarting might be needed if not linked.');
    }
  });

  try {
    // Wait for the socket to initialize
    console.log('[INFO] Initializing socket connection...');
    await delay(10000); 
    
    // Request pairing code
    console.log('[INFO] Requesting pairing code from WhatsApp servers...');
    const code = await sock.requestPairingCode(phoneNumber);
    
    console.log("\n=========================================");
    console.log("🚀 SITHU MD WHATSAPP PAIRING CODE");
    console.log(`👉 CODE: ${code}`);
    console.log("=========================================\n");
    console.log("Enter this code on your phone (Linked Devices > Link with Phone Number)");
    
    // Keep the script running to allow the handshake to complete
    // In a real bot, this would be your main loop.
  } catch (error: any) {
    console.error("\n[ERROR] Failed to get pairing code:", error.message);
    process.exit(1);
  }
}

startBot();
