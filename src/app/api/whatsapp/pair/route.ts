import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 * This route initializes a Baileys socket and requests a pairing code.
 */
export const maxDuration = 60; // Maximize duration for long-running socket connection

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. Clean the phone number
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    // 2. Handle Sri Lankan numbers starting with 0
    if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 10) {
      sanitizedNumber = '94' + sanitizedNumber.substring(1);
    }
    
    // 3. Validation
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර රටේ කේතය සමඟ නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // 4. Session management
    // We use a specific folder for each number to avoid multi-session conflicts
    const sessionId = `sithu_session_${sanitizedNumber}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    // Clear old session if it exists to ensure a fresh pairing attempt
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } catch (e) {
        console.error("Error clearing old session:", e);
      }
    }
    
    fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.ubuntu('Chrome'), // Ubuntu Chrome matches better for many servers
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    // Wait a bit for the socket to connect to the WhatsApp servers
    await delay(8000); 

    if (!sock.authState.creds.registered) {
      try {
        // Request the pairing code
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          const formattedCode = code.replace(/-/g, '').toUpperCase();
          
          // Background listener for creds update
          sock.ev.on('creds.update', saveCreds);
          
          return NextResponse.json({ 
            success: true, 
            code: formattedCode,
            numberUsed: sanitizedNumber
          });
        } else {
          throw new Error("Could not generate pairing code.");
        }
      } catch (err: any) {
        console.error("Pairing request error:", err);
        return NextResponse.json({ 
          success: false, 
          error: "වට්සැප් සර්වර් සමඟ සම්බන්ධ වීමට නොහැකි විය. ඔබගේ අංකය නිවැරදි දැයි නැවත පරීක්ෂා කරන්න." 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "මෙම අංකය දැනටමත් සම්බන්ධ වී ඇත (Already Connected)." 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Critical WhatsApp API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "පද්ධති දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}
