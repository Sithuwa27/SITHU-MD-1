'use server';

/**
 * DEPRECATED: Use the standalone 'bot.ts' script instead.
 * Run 'npm run bot' from your terminal to get the pairing code.
 */
export async function requestWhatsAppPairingCode(phoneNumber: string) {
  return { 
    success: false, 
    error: "මෙම ක්‍රමය අත්හිටුවා ඇත. කරුණාකර terminal එකේ 'npm run bot' භාවිතා කරන්න." 
  };
}
