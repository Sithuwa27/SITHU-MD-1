'use server';

/**
 * DEPRECATED: Use the API Route /api/whatsapp/pair instead.
 * Server Actions are prone to timeouts for long-running socket initializations.
 */
export async function requestWhatsAppPairingCode(phoneNumber: string) {
  return { 
    success: false, 
    error: "This server action is deprecated. The dashboard now uses /api/whatsapp/pair for better stability." 
  };
}
