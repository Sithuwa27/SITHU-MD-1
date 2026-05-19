import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route - V5 (Stable macOS Identity)
 * macOS වල මෙන්ම සාර්ථකව සම්බන්ධ වීමට මෙය සකස් කර ඇත.
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. ශ්‍රී ලංකාවේ අංක පිරිසිදු කිරීම (Normalization)
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
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

    // 2. සෙෂන් එක සඳහා අලුත් තාවකාලික ෆෝල්ඩරයක් සෑදීම
    const sessionId = `sithu_v5_${sanitizedNumber}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } catch (e) {
        console.error("Could not remove old session", e);
      }
    }
    fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    // Baileys version එක ලබා ගැනීම
    let version: [number, number, number] = [2, 3000, 1015901307];
    try {
      const latest = await fetchLatestBaileysVersion();
      if (latest && latest.version) {
        version = latest.version;
      }
    } catch (e) {
      console.log("Using default Baileys version");
    }

    // 3. Socket එක ආරම්භ කිරීම (macOS Desktop ලෙස පෙනී සිටීම)
    const sock = makeWASocket({
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      // macOS Chrome ලෙස හඳුනා ගැනීමට (Crucial for stability)
      browser: ['Mac OS', 'Chrome', '121.0.6167.184'], 
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    // Creds update කිරීම
    sock.ev.on('creds.update', saveCreds);

    // 4. Handshake එක සඳහා මඳ වේලාවක් රැඳී සිටීම
    // මෙය දුරකථනයට Notification එක ලැබීමට උපකාරී වේ.
    await delay(8000); 

    if (!sock.authState.creds.registered) {
      try {
        // Pairing code එක ඉල්ලා සිටීම
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          return NextResponse.json({ 
            success: true, 
            code: code.toUpperCase(),
            numberUsed: sanitizedNumber
          });
        } else {
          throw new Error("Code request returned null");
        }
      } catch (err: any) {
        console.error("Pairing request failed:", err);
        return NextResponse.json({ 
          success: false, 
          error: "WhatsApp විසින් මෙම සම්බන්ධතාවය ප්‍රතික්ෂේප කරන ලදී. කරුණාකර නැවත උත්සාහ කරන්න." 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "මෙම අංකය දැනටමත් සම්බන්ධ වී ඇත." 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය. කරුණාකර ඔබගේ අංකය පරීක්ෂා කරන්න." 
    }, { status: 500 });
  }
}
