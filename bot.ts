
import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import qrcodeTerminal from 'qrcode-terminal';
import ytSearch from 'yt-search';
import path from 'path';

/**
 * SITHU MD Bot - API Based Downloader
 * Bypasses YouTube IP blocks by using an external download API.
 */
async function startBot() {
  const sessionPath = './session_data';
  const tempDir = './temp';
  
  // Ensure directories exist
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any,
    browser: ['Mac OS', 'Safari', '10.15.7'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n=========================================");
      console.log("🚀 SITHU MD WHATSAPP QR CODE");
      console.log("=========================================\n");
      qrcodeTerminal.generate(qr, { small: true });
      console.log("\nInstructions:");
      console.log("1. Open WhatsApp on your phone.");
      console.log("2. Go to Linked Devices > Link a Device.");
      console.log("3. Scan the QR code above.\n");
    }

    if (connection === 'open') {
      console.log('\n[INFO] Bot is fully connected!');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`[INFO] Connection closed. Status Code: ${statusCode}`);
      
      if (shouldReconnect) {
        console.log('[INFO] Restarting bot automatically...');
        startBot();
      } else {
        console.log('[ERROR] Logged out. Please delete "session_data" folder and restart.');
      }
    }
  });

  // Handle Incoming Messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const jid = m.key.remoteJid!;
    const messageType = Object.keys(m.message)[0];
    
    let text = '';
    if (messageType === 'conversation') {
      text = m.message.conversation || '';
    } else if (messageType === 'extendedTextMessage') {
      text = m.message.extendedTextMessage?.text || '';
    }

    const lowerText = text.toLowerCase();

    // COMMAND: .song or !song
    if (lowerText.startsWith('.song') || lowerText.startsWith('!song')) {
      const query = text.replace(/^\.(song|!song)\s*/i, '').trim();
      
      if (!query) {
        return sock.sendMessage(jid, { text: '❌ කරුණාකර ගීතයේ නම ඇතුළත් කරන්න. (උදා: .song Imagine Dragons - Bones)' });
      }

      try {
        await sock.sendMessage(jid, { text: `🎧 *SITHU MD SEARCHING* 🎧\n\n🔎 සොයමින් පවතී: *${query}*\n\nකරුණාකර මොහොතක් රැඳී සිටින්න...` });

        // 1. Search YouTube
        const searchResults = await ytSearch(query);
        const video = searchResults.videos[0];

        if (!video) {
          return sock.sendMessage(jid, { text: `❌ කණගාටුයි, "${query}" සඳහා කිසිදු ප්‍රතිඵලයක් හමු නොවීය.` });
        }

        const videoUrl = video.url;
        const fileName = `${Date.now()}.mp3`;
        const filePath = path.join(tempDir, fileName);

        // 2. Fetch Download Link from External API
        // Using a public free API to bypass local IP blocks
        const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const apiResponse = await fetch(apiUrl);
        const apiData = await apiResponse.json();

        if (!apiData || !apiData.status || !apiData.result || !apiData.result.download) {
          throw new Error('API failed to provide download link');
        }

        const downloadUrl = apiData.result.download.url;

        // 3. Download the Audio Buffer
        const audioRes = await fetch(downloadUrl);
        if (!audioRes.ok) throw new Error('Failed to download audio from provider');
        
        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Save to Temp File
        fs.writeFileSync(filePath, buffer);

        // 5. Send Audio Message
        if (fs.existsSync(filePath)) {
          await sock.sendMessage(jid, { 
            audio: { url: filePath }, 
            mimetype: 'audio/mp4', 
            ptt: false,
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: `Artist: ${video.author.name} | SITHU MD`,
                thumbnailUrl: video.thumbnail,
                sourceUrl: videoUrl,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          });

          // Clean up temp file
          fs.unlinkSync(filePath);
        } else {
          sock.sendMessage(jid, { text: '❌ ගොනුව නිර්මාණය කිරීමට නොහැකි විය.' });
        }

      } catch (error) {
        console.error('Song command error:', error);
        sock.sendMessage(jid, { text: '❌ පද්ධතියේ දෝෂයක් සිදු විය. YouTube සර්වර් එක අපගේ සේවාව අවහිර කර ඇත. පසුව නැවත උත්සාහ කරන්න.' });
      }
    }

    // COMMAND: .status
    if (lowerText === '.status') {
      await sock.sendMessage(jid, { text: '✅ SITHU MD Bot is Online and ready to serve!' });
    }
  });
}

// Global error handling to prevent crash
process.on('uncaughtException', (err) => {
  console.error('[FATAL ERROR]', err);
});

startBot();
