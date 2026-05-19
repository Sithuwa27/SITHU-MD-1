import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 * Improved error handling and connection stability
 */
export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // Cleaning number: strictly only digits
    const sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // Creating a unique temp session
    const sessionId = `sithu_session_${Date.now()}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
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
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 10000,
    });

    // Handle credentials saving
    sock.ev.on('creds.update', saveCreds);

    // Explicitly wait for the connection to be "ready" to request code
    // Sometimes calling immediately results in failure
    await delay(5000); 

    try {
      const code = await sock.requestPairingCode(sanitizedNumber);
      
      if (code) {
        const formattedCode = code.replace(/-/g, '').toUpperCase();
        return NextResponse.json({ 
          success: true, 
          code: formattedCode 
        });
      } else {
        throw new Error("WhatsApp සර්වර් එකෙන් කේතය ලබාගත නොහැකි විය.");
      }
    } catch (pairingError: any) {
      console.error("Pairing request failed:", pairingError);
      return NextResponse.json({ 
        success: false, 
        error: "Pairing කේතය ඉල්ලීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න." 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Critical WhatsApp API Error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "සම්බන්ධතාවය අසාර්ථක විය. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න." 
    }, { status: 500 });
  }
}
