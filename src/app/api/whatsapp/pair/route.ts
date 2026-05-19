
import { NextResponse } from 'next/server';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

/**
 * API Route to handle WhatsApp pairing requests.
 * Uses Baileys to initialize a temporary socket and request an 8-digit pairing code.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phoneNumber = body.phoneNumber;
    
    // Sanitize phone number (remove all non-digits)
    const sanitizedNumber = phoneNumber?.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "Please enter a valid phone number with country code." 
      }, { status: 400 });
    }

    // Use a unique session directory for each pairing request to avoid "Connection Closed" conflicts
    const sessionId = `session_${sanitizedNumber}_${Date.now()}`;
    const sessionPath = path.join('/tmp', sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state } = await useMultiFileAuthState(sessionPath);
    
    // Get latest WA version to ensure compatibility
    const { version } = await fetchLatestBaileysVersion();

    // Initialize the socket with minimal logging
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
      connectTimeoutMs: 20000,
      defaultQueryTimeoutMs: 20000,
    });

    // Request the pairing code
    // This is the core Baileys call that generates the 8-digit string
    const rawCode = await sock.requestPairingCode(sanitizedNumber);
    const code = rawCode.replace(/-/g, '').toUpperCase();
    
    // In a production environment, the socket should stay open to complete the handshake.
    // For this dashboard, we return the code to the user.
    
    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    console.error("WhatsApp Pairing API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate pairing code. Please check your network and try again." 
    }, { status: 500 });
  }
}
