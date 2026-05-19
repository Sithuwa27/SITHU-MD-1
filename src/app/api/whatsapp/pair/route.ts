
import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, delay, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';
import QRCode from 'qrcode';

/**
 * WhatsApp QR Connection API Route
 * Generates a QR code for the user to scan, similar to WhatsApp Web.
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  let sessionPath = '';
  try {
    // 1. සෙෂන් එක සඳහා තාවකාලික ෆෝල්ඩරයක් සෑදීම
    const sessionId = `sithu_qr_${Date.now()}`;
    sessionPath = path.join(os.tmpdir(), sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    let version: [number, number, number] = [2, 3000, 1015901307];
    try {
      const latest = await fetchLatestBaileysVersion();
      if (latest && latest.version) {
        version = latest.version;
      }
    } catch (e) {
      console.log("Using default version");
    }

    // 2. Socket එක ආරම්භ කිරීම
    const sock = makeWASocket({
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.macOS('Desktop'), 
      connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    // 3. QR කේතය ලැබෙන තෙක් රැඳී සිටීම
    const qrPromise = new Promise<string>((resolve, reject) => {
      sock.ev.on('connection.update', (update) => {
        const { qr, connection } = update;
        if (qr) {
          resolve(qr);
        }
        if (connection === 'open') {
          // Already connected
          reject(new Error('Already connected'));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => reject(new Error('QR Timeout')), 30000);
    });

    try {
      const qrString = await qrPromise;
      const qrDataUri = await QRCode.toDataURL(qrString);
      
      return NextResponse.json({ 
        success: true, 
        qr: qrDataUri,
        message: "QR කේතය සාර්ථකව ලැබුණි. කරුණාකර එය ස්කෑන් කරන්න."
      });
    } catch (err: any) {
      console.error("QR Generation failed:", err);
      return NextResponse.json({ 
        success: false, 
        error: err.message === 'QR Timeout' ? "QR කේතය ලබා ගැනීමට ප්‍රමාද වැඩියි. නැවත උත්සාහ කරන්න." : "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය." 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න." 
    }, { status: 500 });
  }
}
