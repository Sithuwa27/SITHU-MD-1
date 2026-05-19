import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route - V4 (Enhanced macOS Desktop Spoofing)
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. Clean and normalize the phone number
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    // Sri Lankan number normalization
    if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 10) {
      sanitizedNumber = '94' + sanitizedNumber.substring(1);
    } else if (sanitizedNumber.length === 9) {
      sanitizedNumber = '94' + sanitizedNumber;
    }
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර නිවැරදි දුරකථන අංකය ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // 2. Setup a unique session directory to avoid locks
    // Using a timestamp to ensure fresh sessions each time
    const sessionId = `sithu_session_${sanitizedNumber}_${Date.now()}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    // Fetch version safely
    let version: [number, number, number] = [2, 3000, 1015901307];
    try {
      const latest = await fetchLatestBaileysVersion();
      if (latest && latest.version) {
        version = latest.version;
      }
    } catch (e) {
      console.log("Using default Baileys version");
    }

    // 3. Initialize the socket mimicking macOS for better stability
    const sock = makeWASocket({
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      // Mimic macOS Desktop exactly as it works best for pairing requests and notifications
      browser: Browsers.macOS('Desktop'), 
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    // 4. Wait for the socket to be ready before requesting code
    // Increased delay to ensure the device is registered on WhatsApp servers
    await delay(10000); 

    if (!sock.authState.creds.registered) {
      try {
        // Request the 8-digit pairing code
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          const formattedCode = code.replace(/-/g, '').toUpperCase();
          
          // Background cleanup of session after timeout (optional, but keep for now)
          // sock.ev.on('creds.update', saveCreds);
          
          return NextResponse.json({ 
            success: true, 
            code: formattedCode,
            numberUsed: sanitizedNumber
          });
        } else {
          throw new Error("Pairing code generation returned null.");
        }
      } catch (err: any) {
        console.error("Pairing request failed:", err);
        return NextResponse.json({ 
          success: false, 
          error: "WhatsApp සර්වර් විසින් මෙම අංකය ප්‍රතික්ෂේප කරන ලදී. අංකය නිවැරදි දැයි පරීක්ෂා කර නැවත උත්සාහ කරන්න." 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "මෙම අංකය දැනටමත් සම්බන්ධ වී ඇත." 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Critical Pairing Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "සම්බන්ධතාවය බිඳ වැටුණි. කරුණාකර ඔබගේ අංකය නිවැරදිව ඇතුළත් කර නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}