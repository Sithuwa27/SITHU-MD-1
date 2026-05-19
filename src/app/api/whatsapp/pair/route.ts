import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. අංකය පිරිසිදු කිරීම (ඉලක්කම් පමණක් තබා ගැනීම)
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    // 2. ශ්‍රී ලංකාවේ අංකයක් නම් (07... ලෙස ඇරඹේ නම්) එය 94... බවට පත් කිරීම
    if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 10) {
      sanitizedNumber = '94' + sanitizedNumber.substring(1);
    }
    
    // 3. අංකයේ දිග පරීක්ෂාව (අවම වශයෙන් ඉලක්කම් 10ක්වත් තිබිය යුතුය)
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර රටේ කේතය සමඟ නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // 4. සෙෂන් එක කළමනාකරණය
    const sessionId = `sithu_session_${sanitizedNumber}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    // පැරණි සෙෂන් දත්ත තිබේ නම් ඒවා ඉවත් කිරීම (අලුතින්ම කනෙක්ට් වීමට)
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
      browser: Browsers.macOS('Chrome'), // Chrome ලෙස පෙන්වීම වඩාත් සාර්ථක විය හැක
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
    });

    // සර්වර් එකට සම්බන්ධ වීමට මඳ වේලාවක් ලබා දීම
    await delay(7000); 

    if (!sock.authState.creds.registered) {
      try {
        // Pairing code ඉල්ලීම
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          const formattedCode = code.replace(/-/g, '').toUpperCase();
          
          // Creds update කරන්න listener එක දානවා (මෙය පසුබිමේ සිදුවේ)
          sock.ev.on('creds.update', saveCreds);
          
          return NextResponse.json({ 
            success: true, 
            code: formattedCode,
            numberUsed: sanitizedNumber
          });
        } else {
          throw new Error("කේතය ජනනය කිරීමට නොහැකි විය.");
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
        error: "මෙම අංකය දැනටමත් සම්බන්ධ වී ඇත." 
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
