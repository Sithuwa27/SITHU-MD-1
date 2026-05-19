
import { NextResponse } from 'next/server';

/**
 * WhatsApp Pairing API Route (Disabled in favor of standalone script)
 */
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: "කරුණාකර terminal එකේ 'npm run bot' විධානය භාවිතා කරන්න." 
  }, { status: 403 });
}
