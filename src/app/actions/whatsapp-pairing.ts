
'use server';

/**
 * DEPRECATED: Use the API Route /api/whatsapp/pair instead for better stability.
 */
export async function requestWhatsAppPairingCode(phoneNumber: string) {
  return { 
    success: false, 
    error: "This action is deprecated. Please use the API route /api/whatsapp/pair." 
  };
}
