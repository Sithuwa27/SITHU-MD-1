import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route
 * මෙමගින් Baileys භාවිතා කර අංක 8ක pairing code එකක් ජනනය කරයි.
 */
export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // අංකය පිරිසිදු කිරීම (ඉලක්කම් පමණක් ලබා ගැනීම)
    const sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // සෙෂන් එක සඳහා අද්විතීය තාවකාලික ෆෝල්ඩරයක් (Temporary Folder)
    const sessionId = `sithu_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // WhatsApp Socket එක ආරම්භ කිරීම
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.macOS('Desktop'), // වඩාත් ස්ථාවර බ්‍රවුසරයක් ලෙස පෙනී සිටීම
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    // Creds update එකක් සිදුවන විට එය සේව් කිරීම (අවශ්‍ය නම් පමණි)
    sock.ev.on('creds.update', saveCreds);

    // සොකට් එක සූදානම් වන තෙක් සුළු වේලාවක් රැඳී සිටීම (Warm up)
    await delay(2000);

    // Pairing Code එක ඉල්ලා සිටීම
    const code = await sock.requestPairingCode(sanitizedNumber);
    
    if (code) {
      const formattedCode = code.replace(/-/g, '').toUpperCase();
      
      // සෙෂන් ෆෝල්ඩරය පිරිසිදු කිරීම (Pairing code එක ලබාගත් පසු දැනට අවශ්‍ය නොවන නිසා)
      // සටහන: සැබෑ bot කෙනෙකු පවත්වාගෙන යාමට නම් මෙය තබාගත යුතුය. 
      // නමුත් මෙහිදී අප කරන්නේ code එක පෙන්වීම පමණක් බැවින් ඉඩ ඉතිරි කර ගැනීමට මකා දැමිය හැක.
      
      return NextResponse.json({ 
        success: true, 
        code: formattedCode 
      });
    } else {
      throw new Error("Could not generate pairing code.");
    }

  } catch (error: any) {
    console.error("WhatsApp Pairing Detailed Error:", error);
    
    // දෝෂයක් වූ විට ෆෝල්ඩරය පිරිසිදු කිරීම
    if (sessionPath && fs.existsSync(sessionPath)) {
      try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
    }

    return NextResponse.json({ 
      success: false, 
      error: error.message || "සම්බන්ධතාවය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}
