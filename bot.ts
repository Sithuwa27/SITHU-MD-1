
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
import ytdl from '@distube/ytdl-core';

/**
 * SITHU MD Bot - Local Stream Based Downloader
 * Uses @distube/ytdl-core for stable audio streaming.
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

        // 2. Download using @distube/ytdl-core stream
        const audioStream = ytdl(videoUrl, {
          filter: 'audioonly',
          quality: 'highestaudio',
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          }
        });

        const fileWriteStream = fs.createWriteStream(filePath);
        audioStream.pipe(fileWriteStream);

        fileWriteStream.on('finish', async () => {
          // 3. Send Audio Message once download is finished
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
          }
        });

        audioStream.on('error', (err) => {
          console.error('YTDL Stream Error:', err);
          sock.sendMessage(jid, { text: '❌ ගීතය බාගත කිරීමේදී දෝෂයක් සිදු විය.' });
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

      } catch (error) {
        console.error('Song command error:', error);
        sock.sendMessage(jid, { text: '❌ පද්ධතියේ දෝෂයක් සිදු විය. පසුව නැවත උත්සාහ කරන්න.' });
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
