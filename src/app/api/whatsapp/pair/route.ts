
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * WhatsApp Pairing API Route
 * This route triggers the standalone bot.ts script to get a pairing code.
 */
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }

    // Sanitize phone number: remove +, spaces, leading zeros
    const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    
    // We execute the standalone script to get the code
    // This is more stable than running the socket logic inside the request handler
    const { stdout, stderr } = await execPromise(`npx tsx bot.ts --phone=${cleanPhone}`);

    if (stderr && !stdout) {
      console.error("Bot script error:", stderr);
      return NextResponse.json({ success: false, error: "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න." }, { status: 500 });
    }

    // Try to find the JSON output in stdout
    const jsonMatch = stdout.match(/\{"success":true,"code":"[A-Z0-9]+"\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ 
        success: true, 
        code: result.code,
        message: "Pairing code එක සාර්ථකව ලැබුණි."
      });
    }

    // If no JSON found but there was output, try to parse the last line
    try {
      const lines = stdout.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const result = JSON.parse(lastLine);
      if (result.success) {
        return NextResponse.json({ success: true, code: result.code });
      } else {
        return NextResponse.json({ success: false, error: result.error || "දෝෂයකි" }, { status: 500 });
      }
    } catch (e) {
      console.error("Execution failed:", stdout);
      return NextResponse.json({ success: false, error: "කේතය ලබා ගැනීමට නොහැකි විය. දුරකථන අංකය නිවැරදි දැයි බලන්න." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "සම්බන්ධතාවය ස්ථාපිත කිරීමට නොහැකි විය. (Timeout/Error)" 
    }, { status: 500 });
  }
}
