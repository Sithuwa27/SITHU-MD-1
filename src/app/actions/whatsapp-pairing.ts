
'use server';

import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

/**
 * Server Action to request a WhatsApp pairing code using Baileys.
 * 
 * Note: For a production bot, the socket needs to remain active to complete the pairing.
 * In a serverless environment (like standard Server Actions), this is a challenge
 * and typically requires a long-running process or persistent state management.
 */
export async function requestWhatsAppPairingCode(phoneNumber: string) {
  try {
    // Sanitize phone number (remove all non-digits)
    const sanitizedNumber = phoneNumber.replace(/\D/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
      return { success: false, error: "Please enter a valid phone number with country code." };
    }

    // Initialize session state (using /tmp for serverless environments)
    // In a real app, you'd want to store this in a database or persistent volume.
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/baileys_session');
    
    // Get latest WA version
    const { version } = await fetchLatestBaileysVersion();

    // Initialize the socket
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
    });

    // Request the pairing code
    // The code is an 8-character string, often separated by a hyphen
    const rawCode = await sock.requestPairingCode(sanitizedNumber);
    const code = rawCode.replace('-', '').toUpperCase();
    
    return { success: true, code };
  } catch (error: any) {
    console.error("WhatsApp Pairing Error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to generate pairing code. Please try again." 
    };
  }
}
