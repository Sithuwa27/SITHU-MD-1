import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

/**
 * WhatsApp සම්බන්ධතාවය (Pairing) සිදුකරන ප්‍රධාන API එක.
 * මෙය වඩාත් වේගවත් සහ ස්ථාවර වන පරිදි සැකසූ අතර, 
 * සෑම පාරිභෝගිකයෙකුටම වෙනම තාවකාලික සෙෂන් එකක් ලබා දෙයි.
 */
export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();
    
    // දුරකථන අංකය පිරිසිදු කර ගැනීම (ඉලක්කම් පමණක් ඉතිරි කිරීම)
    const sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "කරුණාකර නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 94771234567)." 
      }, { status: 400 });
    }

    // සෙෂන් එක සඳහා අද්විතීය ෆෝල්ඩරයක් නිර්මාණය කිරීම
    const sessionId = `sithu_pair_${sanitizedNumber}_${Math.random().toString(36).substring(7)}`;
    const sessionPath = path.join('/tmp', sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // WhatsApp සොකට් එක ආරම්භ කිරීම
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.macOS('Chrome'),
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000,
    });

    // පෑයරින් කෝඩ් එක ඉල්ලා සිටීම
    // මෙය ක්‍රියාත්මක වන්නේ නම් පමණක් අපිට කෝඩ් එක ලැබේ
    const code = await sock.requestPairingCode(sanitizedNumber);
    
    // කෝඩ් එක සාර්ථකව ලැබුණහොත් එය ආපසු යැවීම
    if (code) {
      const formattedCode = code.replace(/-/g, '').toUpperCase();
      return NextResponse.json({ 
        success: true, 
        code: formattedCode 
      });
    } else {
      throw new Error("Pairing code generator failed to return a code.");
    }

  } catch (error: any) {
    console.error("WhatsApp Pairing Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "සම්බන්ධතාවය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}
