import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 * Provides a dynamic pairing code using @whiskeysockets/baileys
 * Updated to mimic macOS for better compatibility as requested.
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. Clean and normalize the phone number
    // Remove all non-numeric characters (including + sign)
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    // Handle Sri Lankan format: 077... -> 9477...
    if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 10) {
      sanitizedNumber = '94' + sanitizedNumber.substring(1);
    }
    // Handle cases where country code might be missing but starts with 7...
    if (sanitizedNumber.length === 9 && (sanitizedNumber.startsWith('7') || sanitizedNumber.startsWith('1'))) {
      sanitizedNumber = '94' + sanitizedNumber;
    }
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර රටේ කේතය සමඟ නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // 2. Clean temporary session directory for a fresh attempt
    // Using a unique session ID based on number to avoid conflicts
    const sessionId = `sithu_session_${sanitizedNumber}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } catch (e) {
        console.error("Session cleanup error:", e);
      }
    }
    
    fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // 3. Initialize the socket
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      // Mimic macOS Desktop as it is known to be more stable for pairing
      browser: Browsers.macOS('Desktop'), 
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    // Wait for the socket to stabilize before requesting code
    // This delay is crucial for the handshake to initiate properly
    await delay(10000); 

    if (!sock.authState.creds.registered) {
      try {
        // Request the 8-digit pairing code
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          const formattedCode = code.replace(/-/g, '').toUpperCase();
          
          // Background listener for credential updates
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
        console.error("Pairing request failed:", err);
        return NextResponse.json({ 
          success: false, 
          error: "වට්සැප් සර්වර් විසින් මෙම අංකය ප්‍රතික්ෂේප කරන ලදී. අංකය සහ රටේ කේතය නිවැරදි දැයි පරීක්ෂා කරන්න." 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "මෙම අංකය දැනටමත් සම්බන්ධ වී ඇත. කරුණාකර වෙනත් අංකයක් උත්සාහ කරන්න." 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("WhatsApp API critical failure:", error);
    return NextResponse.json({ 
      success: false, 
      error: "සම්බන්ධතාවය බිඳ වැටුණි. කරුණාකර මඳ වේලාවකින් නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}