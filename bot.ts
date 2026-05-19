
import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  Browsers,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Standalone WhatsApp Pairing Script
 * This script handles the socket connection and requests a pairing code.
 */
async function startBot() {
  const args = process.argv.slice(2);
  const phoneArg = args.find(arg => arg.startsWith('--phone='));
  const phoneNumber = phoneArg ? phoneArg.split('=')[1] : null;

  if (!phoneNumber) {
    console.error(JSON.stringify({ success: false, error: "Phone number is required. Use --phone=947..." }));
    process.exit(1);
  }

  // Use a temporary session directory
  const sessionId = `sithu_session_${Date.now()}`;
  const sessionPath = path.join(os.tmpdir(), sessionId);
  
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
    browser: Browsers.macOS('Desktop'), // Use macOS Desktop for stability
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
  });

  sock.ev.on('creds.update', saveCreds);

  // Connection logic
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== 401;
      if (!shouldReconnect) {
        // Session expired or logged out
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }
    }
  });

  try {
    // Wait for the socket to be ready
    await delay(3000);
    
    // Request pairing code
    const code = await sock.requestPairingCode(phoneNumber);
    
    // Output ONLY the code in a format the API can parse easily
    console.log(JSON.stringify({ success: true, code }));
    
    // Keep it alive for a bit so the connection settles, then exit
    // In a real production bot, this script would continue running.
    setTimeout(() => process.exit(0), 10000);
  } catch (error: any) {
    console.error(JSON.stringify({ success: false, error: error.message || "Failed to get code" }));
    process.exit(1);
  }
}

startBot();
