import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WhatsApp Pairing API Route - V6 (High-Stability macOS Identity)
 * macOS වලදී මෙන්ම කිසිදු බාධාවකින් තොරව සම්බන්ධ වීමට මෙය සකස් කර ඇත.
 */
export const maxDuration = 60; // Next.js max duration for serverless functions

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    const { phoneNumber } = await req.json();
    
    // 1. දුරකථන අංකය පිරිසිදු කිරීම (Normalization)
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

    // 2. සෙෂන් එක සඳහා අද්විතීය තාවකාලික ෆෝල්ඩරයක් සෑදීම
    const sessionId = `sithu_v6_${Date.now()}_${sanitizedNumber}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

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

    // 3. Socket එක ආරම්භ කිරීම (macOS Safari ලෙස පෙනී සිටීම - වඩාත් ස්ථාවරයි)
    const sock = makeWASocket({
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      // macOS Safari ලෙස හඳුනා ගැනීමට (Crucial for bypassing 'Couldn't link device')
      browser: ['Mac OS', 'Safari', '17.2.1'], 
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 10000,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
    });

    // Creds update කිරීම
    sock.ev.on('creds.update', saveCreds);

    // 4. සර්වර් එක WhatsApp සමඟ ස්ථාවර සම්බන්ධතාවයක් ගොඩනගා ගන්නා තෙක් රැඳී සිටීම
    await delay(10000); 

    if (!sock.authState.creds.registered) {
      try {
        // Pairing code එක ඉල්ලා සිටීම
        const code = await sock.requestPairingCode(sanitizedNumber);
        
        if (code) {
          return NextResponse.json({ 
            success: true, 
            code: code.toUpperCase(),
            numberUsed: sanitizedNumber,
            message: "කේතය සාර්ථකව ලැබුණි. කරුණාකර විනාඩියක් ඇතුළත එය දුරකථනයට ඇතුළත් කරන්න."
          });
        } else {
          throw new Error("WhatsApp returned empty code");
        }
      } catch (err: any) {
        console.error("Pairing request failed:", err);
        return NextResponse.json({ 
          success: false, 
          error: "WhatsApp විසින් සම්බන්ධතාවය ප්‍රතික්ෂේප කරන ලදී. කරුණාකර අංකය පරීක්ෂා කර නැවත උත්සාහ කරන්න." 
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
      error: "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය. කරුණාකර අංකය නිවැරදිදැයි පරීක්ෂා කරන්න." 
    }, { status: 500 });
  }
}
