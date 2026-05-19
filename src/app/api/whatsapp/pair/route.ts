import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

/**
 * API Route to handle WhatsApp pairing requests.
 * Standard API routes provide better control over timeouts and session isolation.
 */
export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();
    
    // Sanitize phone number (remove all non-digits)
    const sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "Please enter a valid phone number with country code." 
      }, { status: 400 });
    }

    // Use a unique session directory to prevent "Connection Closed" conflicts
    // In production, you might want to cleanup these folders periodically
    const sessionId = `pairing_${sanitizedNumber}_${Date.now()}`;
    const sessionPath = path.join('/tmp', sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // Initialize socket with minimal overhead
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      browser: ['SITHU-MD', 'Chrome', '1.1.0'],
      connectTimeoutMs: 15000,
    });

    // Request the pairing code from WhatsApp servers
    const rawCode = await sock.requestPairingCode(sanitizedNumber);
    const formattedCode = rawCode.replace(/-/g, '').toUpperCase();
    
    // Note: The socket can be closed after getting the code in this specific flow,
    // though the session state remains in /tmp if the user finishes the link.
    
    return NextResponse.json({ 
      success: true, 
      code: formattedCode 
    });

  } catch (error: any) {
    console.error("WhatsApp API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate pairing code. Please try again." 
    }, { status: 500 });
  }
}
