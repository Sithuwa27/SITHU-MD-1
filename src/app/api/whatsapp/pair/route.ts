
import { NextResponse } from 'next/server';

/**
 * DEPRECATED API ROUTE
 * Use the standalone 'bot.ts' script for better stability.
 */
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: "Please use 'npm run bot' in your terminal." 
  }, { status: 410 });
}
