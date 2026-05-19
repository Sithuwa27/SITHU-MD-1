'use server';

import fs from 'fs';
import path from 'path';

/**
 * Checks the local session_data to determine if the bot is linked.
 */
export async function getBotStatus() {
  const sessionPath = path.join(process.cwd(), 'session_data', 'creds.json');
  
  try {
    if (fs.existsSync(sessionPath)) {
      const credsRaw = fs.readFileSync(sessionPath, 'utf-8');
      const creds = JSON.parse(credsRaw);
      
      // If 'me' exists, it means the bot is successfully linked to an account
      if (creds.me && creds.me.id) {
        return {
          isConnected: true,
          botName: creds.me.name || 'SITHU-MD-BOT',
          phoneNumber: creds.me.id.split(':')[0],
          pushName: creds.me.name || '.',
        };
      }
    }
    
    return { isConnected: false, botName: 'SITHU MD BOT', phoneNumber: null };
  } catch (error) {
    console.error('Error checking bot status:', error);
    return { isConnected: false, botName: 'SITHU MD BOT', phoneNumber: null };
  }
}

/**
 * Deletes session data to log out
 */
export async function logoutBot() {
  const sessionDir = path.join(process.cwd(), 'session_data');
  try {
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      return { success: true };
    }
    return { success: false, error: 'No active session found.' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Failed to delete session data.' };
  }
}
