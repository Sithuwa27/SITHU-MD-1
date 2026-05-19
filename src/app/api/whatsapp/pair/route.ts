import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 * ලොග් වීමකින් තොරව Pairing Code එකක් ලබා ගැනීම සඳහා භාවිතා වේ.
 */
export const maxDuration = 60; // Next.js 15 route timeout extension (60 seconds)

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // අංකය පිරිසිදු කිරීම (ඉලක්කම් පමණක් තබා ගැනීම)
    let sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    // ශ්‍රී ලංකාවේ අංකයක් නම් (07... ලෙස ඇරඹේ නම්) එය 94... බවට පත් කිරීම
    if (sanitizedNumber.startsWith('0')) {
      sanitizedNumber = '94' + sanitizedNumber.substring(1);
    }
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // ස්ථාවර සෙෂන් එකක් භාවිතා කිරීම (සෑම විටම අලුත් එකක් නොවී දුරකථන අංකය මත පදනම්ව)
    const sessionId = `sithu_session_${sanitizedNumber}`;
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
      browser: Browsers.macOS('Desktop'), // වඩාත් ස්ථාවර බ්‍රවුසර පරාමිතියක්
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 10000,
    });

    // කේතය ලබා ගැනීමට පෙර සර්වර් එක සමඟ සම්බන්ධ වීමට මඳ වේලාවක් ලබා දීම
    await delay(5000); 

    if (!sock.authState.creds.registered) {
      try {
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          const formattedCode = code.replace(/-/g, '').toUpperCase();
          
          // සර්වර් එකේ ක්‍රියාවලිය වහාම අවසන් නොකර මඳ වේලාවක් තබා ගැනීම (Login එක සම්පූර්ණ වීමට)
          // සටහන: Serverless පරිසරයකදී මෙය සැමවිටම සාර්ථක නොවිය හැක.
          sock.ev.on('creds.update', saveCreds);
          
          return NextResponse.json({ 
            success: true, 
            code: formattedCode 
          });
        } else {
          throw new Error("කේතය ලබා ගැනීමට නොහැකි විය.");
        }
      } catch (err: any) {
        console.error("Pairing request error:", err);
        return NextResponse.json({ 
          success: false, 
          error: "වට්සැප් සර්වර් සමඟ සම්බන්ධ වීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න." 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "මෙම සෙෂන් එක දැනටමත් ලියාපදිංචි වී ඇත." 
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
