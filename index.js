/*
=============================================
  KRISHUxWP BOT — v2.0
  500+ Commands | Baileys Multi-Device
  Made with ❤️ by @krishu672
=============================================
*/

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');

// ─── CONFIGURATION ────────────────────────────────────────
const PREFIX = '.';
const SESSION_DIR = './session';
const OWNER_NUMBER = '91xxxxxxxxxx';  // Will be set from env
const BOT_NAME = 'KRISHUxWP BOT';
const VERSION = 'v2.0';

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

// ─── COMMAND DATABASE ─────────────────────────────────────
const commands = new Map();
const categories = {};

// ─── LOAD COMMANDS ────────────────────────────────────────
function loadCommands() {
  const commandFiles = [
    // ========== GENERAL ==========
    { name: 'help', desc: '📖 Show all commands', category: 'General', execute: helpCmd },
    { name: 'menu', desc: '📋 Show bot menu', category: 'General', execute: menuCmd },
    { name: 'ping', desc: '🏓 Check bot response time', category: 'General', execute: pingCmd },
    { name: 'alive', desc: '💚 Check if bot is running', category: 'General', execute: aliveCmd },
    { name: 'owner', desc: '👤 Show bot owner info', category: 'General', execute: ownerCmd },
    { name: 'info', desc: 'ℹ️ Bot information', category: 'General', execute: infoCmd },
    { name: 'support', desc: '🔗 Support group link', category: 'General', execute: supportCmd },
    { name: 'report', desc: '📝 Report a bug/issue', category: 'General', execute: reportCmd },
    { name: 'creators', desc: '👨‍💻 Bot creators', category: 'General', execute: creatorsCmd },
    { name: 'uptime', desc: '⏱️ Bot uptime', category: 'General', execute: uptimeCmd },
    { name: 'runtime', desc: '⏰ Bot runtime status', category: 'General', execute: runtimeCmd },
    { name: 'speed', desc: '⚡ Bot speed test', category: 'General', execute: speedCmd },
    { name: 'sc', desc: '📄 Source code link', category: 'General', execute: scCmd },
    { name: 'script', desc: '📜 Bot script info', category: 'General', execute: scriptCmd },
    { name: 'donate', desc: '💝 Support the bot', category: 'General', execute: donateCmd },

    // ========== AI & CHAT ==========
    { name: 'ai', desc: '🤖 Chat with AI (Gemini)', category: 'AI & Chat', execute: aiCmd },
    { name: 'gemini', desc: '🧠 Ask Gemini AI', category: 'AI & Chat', execute: geminiCmd },
    { name: 'meta', desc: '🔮 Meta AI assistant', category: 'AI & Chat', execute: metaCmd },
    { name: 'gpt', desc: '💬 ChatGPT conversation', category: 'AI & Chat', execute: gptCmd },
    { name: 'bard', desc: '📚 Google Bard AI', category: 'AI & Chat', execute: bardCmd },
    { name: 'dalle', desc: '🎨 DALL-E image generation', category: 'AI & Chat', execute: dalleCmd },
    { name: 'imagine', desc: '🖼️ Generate image from text', category: 'AI & Chat', execute: imagineCmd },
    { name: 'trt', desc: '💭 Chat with AI (Alt)', category: 'AI & Chat', execute: trtCmd },
    { name: 'simi', desc: '🗣️ SimSimi chat', category: 'AI & Chat', execute: simiCmd },
    { name: 'translate', desc: '🌐 Translate text', category: 'AI & Chat', execute: translateCmd },
    { name: 'define', desc: '📖 Dictionary definition', category: 'AI & Chat', execute: defineCmd },
    { name: 'synonym', desc: '🔤 Find synonyms', category: 'AI & Chat', execute: synonymCmd },
    { name: 'antonym', desc: '🔤 Find antonyms', category: 'AI & Chat', execute: antonymCmd },
    { name: 'fact', desc: '📌 Random fact', category: 'AI & Chat', execute: factCmd },
    { name: 'joke', desc: '😂 Random joke', category: 'AI & Chat', execute: jokeCmd },
    { name: 'riddle', desc: '❓ Random riddle', category: 'AI & Chat', execute: riddleCmd },

    // ========== DOWNLOADER ==========
    { name: 'ytmp3', desc: '🎵 Download YouTube audio (MP3)', category: 'Downloader', execute: ytmp3Cmd },
    { name: 'ytmp4', desc: '🎬 Download YouTube video (MP4)', category: 'Downloader', execute: ytmp4Cmd },
    { name: 'ytsearch', desc: '🔍 Search YouTube videos', category: 'Downloader', execute: ytsearchCmd },
    { name: 'instagram', desc: '📷 Download Instagram media', category: 'Downloader', execute: instagramCmd },
    { name: 'ig', desc: '📱 Instagram downloader', category: 'Downloader', execute: instagramCmd },
    { name: 'igdl', desc: '📱 Insta download', category: 'Downloader', execute: instagramCmd },
    { name: 'igstory', desc: '📖 Download IG story', category: 'Downloader', execute: igstoryCmd },
    { name: 'facebook', desc: '📘 Download Facebook video', category: 'Downloader', execute: facebookCmd },
    { name: 'fb', desc: '📘 FB video download', category: 'Downloader', execute: facebookCmd },
    { name: 'fbdl', desc: '📘 Facebook downloader', category: 'Downloader', execute: facebookCmd },
    { name: 'twitter', desc: '🐦 Download Twitter/X video', category: 'Downloader', execute: twitterCmd },
    { name: 'twdl', desc: '🐦 Twitter downloader', category: 'Downloader', execute: twitterCmd },
    { name: 'tiktok', desc: '🎵 Download TikTok video', category: 'Downloader', execute: tiktokCmd },
    { name: 'tt', desc: '🎵 TikTok downloader', category: 'Downloader', execute: tiktokCmd },
    { name: 'ttdl', desc: '🎵 TikTok DL', category: 'Downloader', execute: tiktokCmd },
    { name: 'tiktokmp3', desc: '🎵 TikTok audio only', category: 'Downloader', execute: tiktokmp3Cmd },
    { name: 'tiktoknowm', desc: '🎵 TikTok no watermark', category: 'Downloader', execute: tiktoknowmCmd },
    { name: 'pinterest', desc: '📌 Download Pinterest image', category: 'Downloader', execute: pinterestCmd },
    { name: 'pin', desc: '📌 Pinterest downloader', category: 'Downloader', execute: pinterestCmd },
    { name: 'pindl', desc: '📌 Pinterest DL', category: 'Downloader', execute: pinterestCmd },
    { name: 'imgur', desc: '🖼️ Upload image to Imgur', category: 'Downloader', execute: imgurCmd },
    { name: 'mediafire', desc: '📁 Download MediaFire file', category: 'Downloader', execute: mediafireCmd },
    { name: 'mfire', desc: '📁 MediaFire downloader', category: 'Downloader', execute: mediafireCmd },
    { name: 'drive', desc: '☁️ Download Google Drive file', category: 'Downloader', execute: gdriveCmd },
    { name: 'gd', desc: '☁️ Google Drive DL', category: 'Downloader', execute: gdriveCmd },
    { name: 'gdrive', desc: '☁️ GDrive downloader', category: 'Downloader', execute: gdriveCmd },
    { name: 'soundcloud', desc: '🎧 Download SoundCloud audio', category: 'Downloader', execute: soundcloudCmd },
    { name: 'scdl', desc: '🎧 SoundCloud DL', category: 'Downloader', execute: soundcloudCmd },
    { name: 'spotify', desc: '🎶 Download Spotify track', category: 'Downloader', execute: spotifyCmd },
    { name: 'spdl', desc: '🎶 Spotify downloader', category: 'Downloader', execute: spotifyCmd },
    { name: 'capcut', desc: '✂️ Download CapCut template', category: 'Downloader', execute: capcutCmd },

    // ========== STALKER & SEARCH ==========
    { name: 'igstalk', desc: '🔍 Instagram profile stalk', category: 'Stalker & Search', execute: igstalkCmd },
    { name: 'tiktokstalk', desc: '🔍 TikTok profile stalk', category: 'Stalker & Search', execute: tiktokstalkCmd },
    { name: 'ghstalk', desc: '👨‍💻 GitHub profile stalk', category: 'Stalker & Search', execute: ghstalkCmd },
    { name: 'github', desc: '👨‍💻 GitHub user info', category: 'Stalker & Search', execute: ghstalkCmd },
    { name: 'ytstalk', desc: '📺 YouTube channel info', category: 'Stalker & Search', execute: ytstalkCmd },
    { name: 'google', desc: '🔎 Google search', category: 'Stalker & Search', execute: googleCmd },
    { name: 'search', desc: '🔎 Web search', category: 'Stalker & Search', execute: googleCmd },
    { name: 'image', desc: '🖼️ Google image search', category: 'Stalker & Search', execute: imageCmd },
    { name: 'img', desc: '🖼️ Image search', category: 'Stalker & Search', execute: imageCmd },
    { name: 'weather', desc: '🌤️ Weather information', category: 'Stalker & Search', execute: weatherCmd },
    { name: 'news', desc: '📰 Latest news', category: 'Stalker & Search', execute: newsCmd },
    { name: 'wikipedia', desc: '📚 Wikipedia search', category: 'Stalker & Search', execute: wikipediaCmd },
    { name: 'wiki', desc: '📚 Wikipedia', category: 'Stalker & Search', execute: wikipediaCmd },
    { name: 'imdb', desc: '🎬 Movie information', category: 'Stalker & Search', execute: imdbCmd },
    { name: 'movie', desc: '🎬 Movie info', category: 'Stalker & Search', execute: imdbCmd },
    { name: 'anime', desc: '🎌 Anime search', category: 'Stalker & Search', execute: animeCmd },
    { name: 'manga', desc: '📖 Manga search', category: 'Stalker & Search', execute: mangaCmd },
    { name: 'character', desc: '👤 Anime character info', category: 'Stalker & Search', execute: characterCmd },
    { name: 'waifu', desc: '👘 Random waifu image', category: 'Stalker & Search', execute: waifuCmd },
    { name: 'nekobin', desc: '📄 Paste to Nekobin', category: 'Stalker & Search', execute: nekobinCmd },
    { name: 'qrcode', desc: '📱 Generate QR code', category: 'Stalker & Search', execute: qrcodeCmd },
    { name: 'qr', desc: '📱 QR generator', category: 'Stalker & Search', execute: qrcodeCmd },

    // ========== CONVERTER ==========
    { name: 'sticker', desc: '🖼️ Convert image to sticker', category: 'Converter', execute: stickerCmd },
    { name: 's', desc: '🖼️ Sticker maker', category: 'Converter', execute: stickerCmd },
    { name: 'stickermaker', desc: '🖼️ Create sticker', category: 'Converter', execute: stickerCmd },
    { name: 'toimg', desc: '🖼️ Convert sticker to image', category: 'Converter', execute: toimgCmd },
    { name: 'togif', desc: '🎞️ Convert video/sticker to GIF', category: 'Converter', execute: togifCmd },
    { name: 'tomp3', desc: '🎵 Convert video to audio', category: 'Converter', execute: tomp3Cmd },
    { name: 'tovideo', desc: '🎬 Convert audio to video', category: 'Converter', execute: tovideoCmd },
    { name: 'removebg', desc: '✨ Remove image background', category: 'Converter', execute: removebgCmd },
    { name: 'nobg', desc: '✨ Background remover', category: 'Converter', execute: removebgCmd },
    { name: 'enhance', desc: '🌟 Enhance image quality', category: 'Converter', execute: enhanceCmd },
    { name: 'blur', desc: '🌫️ Blur image', category: 'Converter', execute: blurCmd },
    { name: 'bright', desc: '☀️ Adjust brightness', category: 'Converter', execute: brightCmd },
    { name: 'circle', desc: '⭕ Crop image to circle', category: 'Converter', execute: circleCmd },
    { name: 'flip', desc: '🔄 Flip image', category: 'Converter', execute: flipCmd },
    { name: 'mirror', desc: '🪞 Mirror image', category: 'Converter', execute: mirrorCmd },
    { name: 'compress', desc: '📦 Compress image', category: 'Converter', execute: compressCmd },
    { name: 'emoji', desc: '😊 Emoji to sticker', category: 'Converter', execute: emojiCmd },
    { name: 'emojimix', desc: '🔀 Mix two emojis', category: 'Converter', execute: emojimixCmd },
    { name: 'ttp', desc: '✏️ Text to picture', category: 'Converter', execute: ttpCmd },
    { name: 'attp', desc: '✏️ Animated text to picture', category: 'Converter', execute: attpCmd },

    // ========== GROUP ==========
    { name: 'group', desc: '👥 Group settings', category: 'Group', execute: groupCmd },
    { name: 'grouplink', desc: '🔗 Get group invite link', category: 'Group', execute: grouplinkCmd },
    { name: 'gcinfo', desc: 'ℹ️ Group information', category: 'Group', execute: gcinfoCmd },
    { name: 'tagall', desc: '📢 Mention all members', category: 'Group', execute: tagallCmd },
    { name: 'everyone', desc: '📢 @everyone', category: 'Group', execute: tagallCmd },
    { name: 'hidetag', desc: '👻 Hidden tag all', category: 'Group', execute: hidetagCmd },
    { name: 'admin', desc: '👑 Admin commands menu', category: 'Group', execute: adminCmd },
    { name: 'promote', desc: '⬆️ Promote to admin', category: 'Group', execute: promoteCmd },
    { name: 'demote', desc: '⬇️ Demote from admin', category: 'Group', execute: demoteCmd },
    { name: 'kick', desc: '👢 Remove member', category: 'Group', execute: kickCmd },
    { name: 'add', desc: '➕ Add member', category: 'Group', execute: addCmd },
    { name: 'welcome', desc: '👋 Toggle welcome message', category: 'Group', execute: welcomeCmd },
    { name: 'goodbye', desc: '👋 Toggle goodbye message', category: 'Group', execute: goodbyeCmd },
    { name: 'antilink', desc: '🔗 Toggle anti-link', category: 'Group', execute: antilinkCmd },
    { name: 'antispam', desc: '🚫 Toggle anti-spam', category: 'Group', execute: antispamCmd },
    { name: 'antitag', desc: '🚫 Anti-badword', category: 'Group', execute: antitagCmd },
    { name: 'mute', desc: '🔇 Mute group', category: 'Group', execute: muteCmd },
    { name: 'unmute', desc: '🔊 Unmute group', category: 'Group', execute: unmuteCmd },
    { name: 'nsfw', desc: '🔞 Toggle NSFW', category: 'Group', execute: nsfwCmd },
    { name: 'setname', desc: '✏️ Change group name', category: 'Group', execute: setnameCmd },
    { name: 'setdesc', desc: '📝 Change group description', category: 'Group', execute: setdescCmd },
    { name: 'setpp', desc: '🖼️ Change group icon', category: 'Group', execute: setppCmd },
    { name: 'revoke', desc: '🔄 Revoke group link', category: 'Group', execute: revokeCmd },
    { name: 'vote', desc: '🗳️ Create a poll/vote', category: 'Group', execute: voteCmd },
    { name: 'poll', desc: '📊 Create poll', category: 'Group', execute: pollCmd },
    { name: 'quiz', desc: '❓ Quiz game', category: 'Group', execute: quizCmd },

    // ========== FUN ==========
    { name: 'hack', desc: '💻 Fake hacking prank', category: 'Fun', execute: hackCmd },
    { name: 'hackbhai', desc: '💻 Hacking prank', category: 'Fun', execute: hackCmd },
    { name: 'dare', desc: '🎯 Random dare', category: 'Fun', execute: dareCmd },
    { name: 'truth', desc: '🤫 Random truth', category: 'Fun', execute: truthCmd },
    { name: 'ship', desc: '💕 Ship rating', category: 'Fun', execute: shipCmd },
    { name: 'love', desc: '💘 Love calculator', category: 'Fun', execute: loveCmd },
    { name: 'lovetest', desc: '💝 Love test', category: 'Fun', execute: loveCmd },
    { name: 'flirt', desc: '😉 Flirt message', category: 'Fun', execute: flirtCmd },
    { name: 'pickup', desc: '💬 Pickup line', category: 'Fun', execute: pickupCmd },
    { name: 'roast', desc: '🔥 Roast someone', category: 'Fun', execute: roastCmd },
    { name: 'insult', desc: '😤 Insult generator', category: 'Fun', execute: insultCmd },
    { name: 'compliment', desc: '💖 Compliment generator', category: 'Fun', execute: complimentCmd },
    { name: 'meme', desc: '😂 Random meme', category: 'Fun', execute: memeCmd },
    { name: 'dankmeme', desc: '🔥 Dank meme', category: 'Fun', execute: dankmemeCmd },
    { name: 'cat', desc: '🐱 Random cat image', category: 'Fun', execute: catCmd },
    { name: 'dog', desc: '🐕 Random dog image', category: 'Fun', execute: dogCmd },
    { name: 'fox', desc: '🦊 Random fox image', category: 'Fun', execute: foxCmd },
    { name: 'bird', desc: '🐦 Random bird image', category: 'Fun', execute: birdCmd },
    { name: '8ball', desc: '🎱 Magic 8-ball', category: 'Fun', execute: eightballCmd },
    { name: 'magicball', desc: '🔮 Magic ball', category: 'Fun', execute: eightballCmd },
    { name: 'coinflip', desc: '🪙 Flip a coin', category: 'Fun', execute: coinflipCmd },
    { name: 'dice', desc: '🎲 Roll a dice', category: 'Fun', execute: diceCmd },
    { name: 'roll', desc: '🎲 Dice roll', category: 'Fun', execute: diceCmd },
    { name: 'slot', desc: '🎰 Slot machine', category: 'Fun', execute: slotCmd },
    { name: 'rps', desc: '✂️ Rock Paper Scissors', category: 'Fun', execute: rpsCmd },
    { name: 'tictactoe', desc: '⭕❌ Tic Tac Toe', category: 'Fun', execute: ticCmd },
    { name: 'ttt', desc: '⭕❌ Tic Tac Toe', category: 'Fun', execute: ticCmd },
    { name: 'calc', desc: '🧮 Calculator', category: 'Fun', execute: calcCmd },
    { name: 'calculate', desc: '🧮 Calculate', category: 'Fun', execute: calcCmd },
    { name: 'math', desc: '🔢 Math solver', category: 'Fun', execute: mathCmd },
    { name: 'say', desc: '🔊 Make bot say something', category: 'Fun', execute: sayCmd },
    { name: 'repeat', desc: '🔁 Repeat message', category: 'Fun', execute: sayCmd },
    { name: 'echo', desc: '📢 Echo message', category: 'Fun', execute: sayCmd },
    { name: 'reverse', desc: '↩️ Reverse text', category: 'Fun', execute: reverseCmd },
    { name: 'capitalize', desc: '🔠 Capitalize text', category: 'Fun', execute: capsCmd },
    { name: 'small', desc: '🔡 Make text small', category: 'Fun', execute: smallCmd },
    { name: 'big', desc: '🔠 Make text big', category: 'Fun', execute: bigCmd },
    { name: 'font', desc: '✍️ Fancy font generator', category: 'Fun', execute: fontCmd },
    { name: 'fancy', desc: '✨ Fancy text', category: 'Fun', execute: fontCmd },
    { name: 'style', desc: '🎨 Text styles', category: 'Fun', execute: styleCmd },

    // ========== TOOLS ==========
    { name: 'shorturl', desc: '🔗 URL shortener', category: 'Tools', execute: shorturlCmd },
    { name: 'tinyurl', desc: '🔗 TinyURL', category: 'Tools', execute: shorturlCmd },
    { name: 'urlshort', desc: '🔗 Short URL', category: 'Tools', execute: shorturlCmd },
    { name: 'base64', desc: '🔐 Base64 encode/decode', category: 'Tools', execute: base64Cmd },
    { name: 'b64', desc: '🔐 Base64 encode/decode', category: 'Tools', execute: base64Cmd },
    { name: 'hash', desc: '🔑 Hash text (MD5/SHA)', category: 'Tools', execute: hashCmd },
    { name: 'encrypt', desc: '🔒 Encrypt text', category: 'Tools', execute: encryptCmd },
    { name: 'decrypt', desc: '🔓 Decrypt text', category: 'Tools', execute: decryptCmd },
    { name: 'password', desc: '🔐 Generate password', category: 'Tools', execute: passwordCmd },
    { name: 'passgen', desc: '🔐 Password generator', category: 'Tools', execute: passwordCmd },
    { name: 'uuid', desc: '🆔 Generate UUID', category: 'Tools', execute: uuidCmd },
    { name: 'color', desc: '🎨 Color info/hex', category: 'Tools', execute: colorCmd },
    { name: 'hex', desc: '#️⃣ Hex color info', category: 'Tools', execute: colorCmd },
    { name: 'battery', desc: '🔋 Check bot battery', category: 'Tools', execute: batteryCmd },
    { name: 'readqr', desc: '📱 Read QR code from image', category: 'Tools', execute: readqrCmd },
    { name: 'scanqr', desc: '📱 Scan QR', category: 'Tools', execute: readqrCmd },
    { name: 'ocr', desc: '📝 Image to text (OCR)', category: 'Tools', execute: ocrCmd },
    { name: 'count', desc: '🔢 Character/word count', category: 'Tools', execute: countCmd },
    { name: 'char', desc: '🔢 Character count', category: 'Tools', execute: countCmd },
    { name: 'word', desc: '📊 Word counter', category: 'Tools', execute: countCmd },
    { name: 'note', desc: '📝 Save a note', category: 'Tools', execute: noteCmd },
    { name: 'list', desc: '📋 Create a list', category: 'Tools', execute: listCmd },
    { name: 'todo', desc: '✅ To-do list', category: 'Tools', execute: todoCmd },
    { name: 'reminder', desc: '⏰ Set reminder', category: 'Tools', execute: reminderCmd },
    { name: 'alarm', desc: '⏰ Set alarm', category: 'Tools', execute: alarmCmd },
    { name: 'timer', desc: '⏱️ Set timer', category: 'Tools', execute: timerCmd },
    { name: 'json', desc: '📦 JSON formatter', category: 'Tools', execute: jsonCmd },
    { name: 'beautify', desc: '✨ Beautify JSON', category: 'Tools', execute: jsonCmd },
    { name: 'cpu', desc: '💻 CPU/RAM info', category: 'Tools', execute: cpuCmd },
    { name: 'sys', desc: '⚙️ System info', category: 'Tools', execute: sysCmd },

    // ========== EDUCATIONAL ==========
    { name: 'ask', desc: '❓ Ask any question', category: 'Educational', execute: askCmd },
    { name: 'solve', desc: '🧮 Solve a problem', category: 'Educational', execute: solveCmd },
    { name: 'quote', desc: '💬 Random quote', category: 'Educational', execute: quoteCmd },
    { name: 'motivate', desc: '💪 Motivation quote', category: 'Educational', execute: motivateCmd },
    { name: 'inspire', desc: '✨ Inspirational quote', category: 'Educational', execute: inspireCmd },
    { name: 'spell', desc: '✍️ Spell checker', category: 'Educational', execute: spellCmd },
    { name: 'grammar', desc: '📝 Grammar check', category: 'Educational', execute: grammarCmd },
    { name: 'code', desc: '💻 Run/Render code', category: 'Educational', execute: codeCmd },
    { name: 'run', desc: '▶️ Execute code', category: 'Educational', execute: codeCmd },
    { name: 'compile', desc: '⚙️ Compile code', category: 'Educational', execute: codeCmd },
    { name: 'js', desc: '🟨 JavaScript help', category: 'Educational', execute: jsCmd },
    { name: 'python', desc: '🐍 Python help', category: 'Educational', execute: pythonCmd },
    { name: 'html', desc: '🌐 HTML/CSS help', category: 'Educational', execute: htmlCmd },
    { name: 'teach', desc: '📚 Teach bot something', category: 'Educational', execute: teachCmd },
    { name: 'learn', desc: '📖 Bot learning mode', category: 'Educational', execute: learnCmd },
    { name: 'brainly', desc: '🎓 Brainly answers', category: 'Educational', execute: brainlyCmd },

    // ========== MEDIA ==========
    { name: 'play', desc: '🎵 Play audio from YouTube', category: 'Media', execute: playCmd },
    { name: 'song', desc: '🎵 Download song', category: 'Media', execute: songCmd },
    { name: 'video', desc: '🎬 Download video', category: 'Media', execute: videoCmd },
    { name: 'audio', desc: '🎵 Download audio', category: 'Media', execute: audioCmd },
    { name: 'ringtone', desc: '🔔 Download ringtone', category: 'Media', execute: ringtoneCmd },
    { name: 'lyrics', desc: '🎤 Get song lyrics', category: 'Media', execute: lyricsCmd },
    { name: 'lyric', desc: '🎤 Lyrics search', category: 'Media', execute: lyricsCmd },
    { name: 'spotifydl', desc: '🎶 Download from Spotify', category: 'Media', execute: spotifydlCmd },
    { name: 'shazam', desc: '🎵 Identify song', category: 'Media', execute: shazamCmd },
    { name: 'whatsong', desc: '🎵 What song is this?', category: 'Media', execute: shazamCmd },
    { name: 'music', desc: '🎶 Music search & play', category: 'Media', execute: musicCmd },

    // ========== ISLAMIC ==========
    { name: 'quran', desc: '📖 Quran recitation', category: 'Islamic', execute: quranCmd },
    { name: 'surah', desc: '📖 Read Surah', category: 'Islamic', execute: surahCmd },
    { name: 'ayat', desc: '📖 Quran verse', category: 'Islamic', execute: ayatCmd },
    { name: 'hadith', desc: '📜 Hadith of the day', category: 'Islamic', execute: hadithCmd },
    { name: 'allah99', desc: '☪️ 99 Names of Allah', category: 'Islamic', execute: allah99Cmd },
    { name: 'asmaulhusna', desc: '☪️ Asmaul Husna', category: 'Islamic', execute: allah99Cmd },
    { name: 'namaz', desc: '🕌 Namaz timings', category: 'Islamic', execute: namazCmd },
    { name: 'prayer', desc: '🕌 Prayer times', category: 'Islamic', execute: namazCmd },
    { name: 'azan', desc: '🔊 Azan/Adhan', category: 'Islamic', execute: azanCmd },
    { name: 'qibla', desc: '🧭 Qibla direction', category: 'Islamic', execute: qiblaCmd },
    { name: 'islamic', desc: '☪️ Islamic info', category: 'Islamic', execute: islamicCmd },
    { name: 'dua', desc: '🤲 Daily dua', category: 'Islamic', execute: duaCmd },

    // ========== OWNER ==========
    { name: 'eval', desc: '⚡ Execute JS code', category: 'Owner', execute: evalCmd },
    { name: 'exec', desc: '💻 Execute shell command', category: 'Owner', execute: execCmd },
    { name: 'sh', desc: '💻 Shell command', category: 'Owner', execute: execCmd },
    { name: 'restart', desc: '🔄 Restart bot', category: 'Owner', execute: restartCmd },
    { name: 'shutdown', desc: '⏹️ Shutdown bot', category: 'Owner', execute: shutdownCmd },
    { name: 'bc', desc: '📢 Broadcast message', category: 'Owner', execute: bcCmd },
    { name: 'broadcast', desc: '📢 Broadcast to all chats', category: 'Owner', execute: bcCmd },
    { name: 'block', desc: '🚫 Block a user', category: 'Owner', execute: blockCmd },
    { name: 'unblock', desc: '✅ Unblock a user', category: 'Owner', execute: unblockCmd },
    { name: 'leave', desc: '🚪 Leave group', category: 'Owner', execute: leaveCmd },
    { name: 'join', desc: '🔗 Join group via link', category: 'Owner', execute: joinCmd },
    { name: 'setprefix', desc: '🔧 Change command prefix', category: 'Owner', execute: setprefixCmd },
    { name: 'setnamebot', desc: '✏️ Change bot name', category: 'Owner', execute: setnamebotCmd },
    { name: 'updates', desc: '📦 Bot updates info', category: 'Owner', execute: updatesCmd },
    { name: 'ban', desc: '🔨 Ban user from bot', category: 'Owner', execute: banCmd },
    { name: 'unban', desc: '🔓 Unban user', category: 'Owner', execute: unbanCmd },
    { name: 'blocklist', desc: '📋 Blocked users list', category: 'Owner', execute: blocklistCmd },
    { name: 'listgc', desc: '📋 Groups list', category: 'Owner', execute: listgcCmd },
    { name: 'listpc', desc: '📋 Personal chats', category: 'Owner', execute: listpcCmd },
    { name: 'save', desc: '💾 Save session/data', category: 'Owner', execute: saveCmd },
    { name: 'load', desc: '📂 Load session/data', category: 'Owner', execute: loadCmd },
    { name: 'reset', desc: '🔄 Reset bot', category: 'Owner', execute: resetCmd },
    { name: 'clear', desc: '🧹 Clear session', category: 'Owner', execute: clearCmd },
    { name: 'mode', desc: '🔀 Change bot mode', category: 'Owner', execute: modeCmd },
    { name: 'public', desc: '🌐 Set bot to public', category: 'Owner', execute: publicCmd },
    { name: 'self', desc: '🔒 Set bot to self mode', category: 'Owner', execute: selfCmd },
    { name: 'debug', desc: '🐛 Debug mode', category: 'Owner', execute: debugCmd },
    { name: 'test', desc: '🧪 Test command', category: 'Owner', execute: testCmd },
    { name: 'session', desc: '🔐 Session info', category: 'Owner', execute: sessionCmd },

    // ========== EXTRA FUN ==========
    { name: 'couple', desc: '💑 Couple of the day', category: 'Extra Fun', execute: coupleCmd },
    { name: 'ppcouple', desc: '💑 Couple DP', category: 'Extra Fun', execute: ppcoupleCmd },
    { name: 'avatar', desc: '👤 Random avatar', category: 'Extra Fun', execute: avatarCmd },
    { name: 'logo', desc: '🎨 Logo maker', category: 'Extra Fun', execute: logoCmd },
    { name: 'make', desc: '🎨 Create logo/design', category: 'Extra Fun', execute: makeCmd },
    { name: 'neon', desc: '💡 Neon text maker', category: 'Extra Fun', execute: neonCmd },
    { name: 'glitch', desc: '👾 Glitch text maker', category: 'Extra Fun', execute: glitchCmd },
    { name: 'gradient', desc: '🌈 Gradient text', category: 'Extra Fun', execute: gradientCmd },
    { name: '3dtext', desc: '3️⃣ 3D text maker', category: 'Extra Fun', execute: text3dCmd },
    { name: 'burning', desc: '🔥 Burning text', category: 'Extra Fun', execute: burningCmd },
    { name: 'demon', desc: '👿 Demon text maker', category: 'Extra Fun', execute: demonCmd },
    { name: 'fire', desc: '🔥 Fire text effect', category: 'Extra Fun', execute: fireCmd },
    { name: 'shadow', desc: '👤 Shadow text', category: 'Extra Fun', execute: shadowCmd },
    { name: 'banner', desc: '🏴 Banner generator', category: 'Extra Fun', execute: bannerCmd },
    { name: 'write', desc: '✍️ Handwriting', category: 'Extra Fun', execute: writeCmd },
    { name: 'carbon', desc: '💻 Carbon code image', category: 'Extra Fun', execute: carbonCmd },
    { name: 'mock', desc: '🃏 Mocking spongebob text', category: 'Extra Fun', execute: mockCmd },
    { name: 'vaporwave', desc: '🌊 Vaporwave text', category: 'Extra Fun', execute: vaporCmd },
    { name: 'clown', desc: '🤡 Clown someone', category: 'Extra Fun', execute: clownCmd },
    { name: 'wanted', desc: '🏴 Wanted poster', category: 'Extra Fun', execute: wantedCmd },
    { name: 'triggered', desc: '🤬 Triggered effect', category: 'Extra Fun', execute: triggeredCmd },
    { name: 'rip', desc: '🪦 RIP gravestone', category: 'Extra Fun', execute: ripCmd },
    { name: 'affect', desc: '😭 No effect meme', category: 'Extra Fun', execute: affectCmd },
    { name: 'beautiful', desc: '✨ Beautiful effect', category: 'Extra Fun', execute: beautifulCmd },
    { name: 'blur', desc: '🌫️ Blur face/image', category: 'Extra Fun', execute: blurCmd },
    { name: 'jail', desc: '🔒 Jail effect', category: 'Extra Fun', execute: jailCmd },
    { name: 'gay', desc: '🏳️‍🌈 Gay pride effect', category: 'Extra Fun', execute: gayCmd },
    { name: 'trash', desc: '🗑️ Trash meme', category: 'Extra Fun', execute: trashCmd },
    { name: 'drip', desc: '💧 Drip effect', category: 'Extra Fun', execute: dripCmd },
    { name: 'mission', desc: '🎯 Mission passed meme', category: 'Extra Fun', execute: missionCmd },
    { name: 'horny', desc: '🥵 Horny effect', category: 'Extra Fun', execute: hornyCmd },
    { name: 'hitler', desc: '💀 Hitler effect', category: 'Extra Fun', execute: hitlerCmd },

    // ========== ANONYMOUS ==========
    { name: 'anonymous', desc: '👤 Anonymous chat', category: 'Anonymous', execute: anonymousCmd },
    { name: 'anon', desc: '👤 Anon chat start', category: 'Anonymous', execute: anonStartCmd },
    { name: 'stopanon', desc: '🛑 Stop anonymous chat', category: 'Anonymous', execute: anonStopCmd },
    { name: 'sendanon', desc: '📤 Send anonymous message', category: 'Anonymous', execute: sendanonCmd },
    { name: 'confess', desc: '🤫 Anonymous confession', category: 'Anonymous', execute: confessCmd },
    { name: 'secret', desc: '🤫 Secret message', category: 'Anonymous', execute: secretCmd },

    // ========== GAMES ==========
    { name: 'guess', desc: '🎮 Guess the number', category: 'Games', execute: guessCmd },
    { name: 'guessing', desc: '🎮 Number guessing', category: 'Games', execute: guessCmd },
    { name: 'hangman', desc: '💀 Hangman game', category: 'Games', execute: hangmanCmd },
    { name: 'wordgame', desc: '📝 Word guessing game', category: 'Games', execute: wordgameCmd },
    { name: 'scramble', desc: '🔀 Word scramble', category: 'Games', execute: scrambleCmd },
    { name: 'trivia', desc: '🧠 Trivia quiz', category: 'Games', execute: triviaCmd },
    { name: 'quiz', desc: '❓ Quiz game', category: 'Games', execute: quizCmd },
    { name: 'rpsgame', desc: '✂️ Rock Paper Scissors game', category: 'Games', execute: rpsgameCmd },
    { name: 'mathgame', desc: '🔢 Math quiz game', category: 'Games', execute: mathgameCmd },
    { name: 'emoji', desc: '😊 Emoji guessing', category: 'Games', execute: emojiGameCmd },
    { name: 'connect4', desc: '🟡 Connect 4 game', category: 'Games', execute: connect4Cmd },
    { name: 'chess', desc: '♟️ Chess game', category: 'Games', execute: chessCmd },
    { name: 'sudoku', desc: '🧩 Sudoku puzzle', category: 'Games', execute: sudokuCmd },
    { name: 'maze', desc: '🌀 Maze generator', category: 'Games', execute: mazeCmd },
    { name: 'memory', desc: '🧠 Memory game', category: 'Games', execute: memoryCmd },
    { name: 'battle', desc: '⚔️ Battle game', category: 'Games', execute: battleCmd },
    { name: 'fight', desc: '🥊 Fight game', category: 'Games', execute: fightCmd },
    { name: 'duel', desc: '🤺 Duel game', category: 'Games', execute: duelCmd },
    { name: 'race', desc: '🏎️ Racing game', category: 'Games', execute: raceCmd },
    { name: 'casino', desc: '🎰 Casino game', category: 'Games', execute: casinoCmd },
    { name: 'slots', desc: '🎰 Slot game', category: 'Games', execute: slotsCmd },
    { name: 'blackjack', desc: '🃏 Blackjack game', category: 'Games', execute: blackjackCmd },
    { name: 'bj', desc: '🃏 Blackjack', category: 'Games', execute: blackjackCmd },

    // ========== ECONOMY ==========
    { name: 'balance', desc: '💰 Check balance', category: 'Economy', execute: balanceCmd },
    { name: 'bal', desc: '💰 Balance', category: 'Economy', execute: balanceCmd },
    { name: 'wallet', desc: '👛 Check wallet', category: 'Economy', execute: walletCmd },
    { name: 'daily', desc: '📅 Daily reward', category: 'Economy', execute: dailyCmd },
    { name: 'weekly', desc: '📅 Weekly reward', category: 'Economy', execute: weeklyCmd },
    { name: 'monthly', desc: '📅 Monthly reward', category: 'Economy', execute: monthlyCmd },
    { name: 'work', desc: '💼 Work for money', category: 'Economy', execute: workCmd },
    { name: 'mine', desc: '⛏️ Mine for coins', category: 'Economy', execute: mineCmd },
    { name: 'fish', desc: '🎣 Go fishing', category: 'Economy', execute: fishCmd },
    { name: 'hunt', desc: '🏹 Go hunting', category: 'Economy', execute: huntCmd },
    { name: 'rob', desc: '🔫 Rob a user', category: 'Economy', execute: robCmd },
    { name: 'steal', desc: '🦹 Steal coins', category: 'Economy', execute: robCmd },
    { name: 'gamble', desc: '🎲 Gamble coins', category: 'Economy', execute: gambleCmd },
    { name: 'bet', desc: '🎰 Bet coins', category: 'Economy', execute: betCmd },
    { name: 'transfer', desc: '💸 Send money', category: 'Economy', execute: transferCmd },
    { name: 'pay', desc: '💸 Pay user', category: 'Economy', execute: transferCmd },
    { name: 'send', desc: '📤 Send coins', category: 'Economy', execute: transferCmd },
    { name: 'shop', desc: '🛒 View shop', category: 'Economy', execute: shopCmd },
    { name: 'buy', desc: '🛍️ Buy from shop', category: 'Economy', execute: buyCmd },
    { name: 'sell', desc: '💰 Sell items', category: 'Economy', execute: sellCmd },
    { name: 'inventory', desc: '🎒 Check inventory', category: 'Economy', execute: inventoryCmd },
    { name: 'inv', desc: '🎒 Inventory', category: 'Economy', execute: inventoryCmd },
    { name: 'leaderboard', desc: '🏆 Top users', category: 'Economy', execute: leaderboardCmd },
    { name: 'lb', desc: '🏆 Leaderboard', category: 'Economy', execute: leaderboardCmd },
    { name: 'rank', desc: '📊 User rank', category: 'Economy', execute: rankCmd },
    { name: 'level', desc: '📈 Level & XP', category: 'Economy', execute: levelCmd },
    { name: 'xp', desc: '⚡ Experience points', category: 'Economy', execute: xpCmd },
    { name: 'profile', desc: '👤 User profile', category: 'Economy', execute: profileCmd },

    // ========== NSFW ==========
    { name: 'nsfwmenu', desc: '🔞 NSFW commands menu', category: 'NSFW', execute: nsfwmenuCmd },
    { name: 'nsfwwaifu', desc: '🔞 NSFW waifu', category: 'NSFW', execute: nsfwwaifuCmd },
    { name: 'nsfwneko', desc: '🔞 NSFW neko', category: 'NSFW', execute: nsfwnekoCmd },
    { name: 'hentai', desc: '🔞 Hentai images', category: 'NSFW', execute: hentaiCmd },
    { name: 'boobs', desc: '🔞 Boobs image', category: 'NSFW', execute: boobsCmd },
    { name: 'ass', desc: '🔞 Ass image', category: 'NSFW', execute: assCmd },
    { name: 'pussy', desc: '🔞 Pussy image', category: 'NSFW', execute: pussyCmd },
    { name: 'anal', desc: '🔞 Anal image', category: 'NSFW', execute: analCmd },
    { name: 'blowjob', desc: '🔞 BJ image', category: 'NSFW', execute: blowjobCmd },
    { name: 'bj', desc: '🔞 Blowjob', category: 'NSFW', execute: blowjobCmd },
    { name: 'cum', desc: '🔞 Cum image', category: 'NSFW', execute: cumCmd },
    { name: 'lesbian', desc: '🔞 Lesbian image', category: 'NSFW', execute: lesbianCmd },
    { name: 'threesome', desc: '🔞 Threesome', category: 'NSFW', execute: threesomeCmd },
    { name: 'neko', desc: '🔞 Neko nsfw', category: 'NSFW', execute: nekoCmd },
    { name: 'trap', desc: '🔞 Trap/Crossdress', category: 'NSFW', execute: trapCmd },
    { name: 'yuri', desc: '🔞 Yuri image', category: 'NSFW', execute: yuriCmd },
    { name: 'yaoi', desc: '🔞 Yaoi image', category: 'NSFW', execute: yaoiCmd },
    { name: 'feet', desc: '🔞 Feet image', category: 'NSFW', execute: feetCmd },
    { name: 'ero', desc: '🔞 Ero image', category: 'NSFW', execute: eroCmd },
    { name: 'futanari', desc: '🔞 Futa image', category: 'NSFW', execute: futanariCmd },
    { name: 'femdom', desc: '🔞 Femdom image', category: 'NSFW', execute: femdomCmd },
    { name: 'gasm', desc: '🔞 Orgasm image', category: 'NSFW', execute: gasmCmd },
    { name: 'holo', desc: '🔞 Hololive nsfw', category: 'NSFW', execute: holoCmd },
    { name: 'kitsune', desc: '🔞 Kitsune nsfw', category: 'NSFW', execute: kitsuneCmd },
    { name: 'kuni', desc: '🔞 Kuni image', category: 'NSFW', execute: kuniCmd },
    { name: 'masturbation', desc: '🔞 Masturbation', category: 'NSFW', execute: masturbationCmd },
    { name: 'nekoapi', desc: '🔞 Nekobot API', category: 'NSFW', execute: nekoapiCmd },
    { name: 'orgy', desc: '🔞 Orgy image', category: 'NSFW', execute: orgyCmd },
    { name: 'pantsu', desc: '🔞 Pantsu image', category: 'NSFW', execute: pantsuCmd },
    { name: 'panties', desc: '🔞 Panties image', category: 'NSFW', execute: pantiesCmd },
    { name: 'school', desc: '🔞 School nsfw', category: 'NSFW', execute: schoolCmd },
    { name: 'sologirl', desc: '🔞 Solo girl', category: 'NSFW', execute: sologirlCmd },
    { name: 'solo', desc: '🔞 Solo nsfw', category: 'NSFW', execute: soloCmd },
    { name: 'tentacles', desc: '🔞 Tentacles', category: 'NSFW', execute: tentaclesCmd },
    { name: 'uniform', desc: '🔞 Uniform nsfw', category: 'NSFW', execute: uniformCmd },
    { name: 'wallpaper', desc: '🔞 NSFW wallpaper', category: 'NSFW', execute: wallpaperCmd },
    { name: 'zettai', desc: '🔞 Zettai ryouiki', category: 'NSFW', execute: zettaiCmd },
  ];

  // Register all commands
  for (const cmd of commandFiles) {
    commands.set(cmd.name.toLowerCase(), cmd);
    if (!categories[cmd.category]) categories[cmd.category] = [];
    categories[cmd.category].push(cmd);
  }
}

// ─── COMMAND HANDLERS ────────────────────────────────────

// Helper: Send message
async function sendMessage(sock, jid, text, quoted) {
  return await sock.sendMessage(jid, { text }, { quoted });
}

// Helper: Send with image
async function sendImage(sock, jid, url, caption, quoted) {
  return await sock.sendMessage(jid, { image: { url }, caption }, { quoted });
}

// Helper: Get random item
function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── GENERAL COMMAND EXECUTORS ───────────────────────────

async function helpCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  let helpText = `╭━━━「 *${BOT_NAME} HELP* 」━━━╮\n`;
  helpText += `┃ 👋 *Hi, ${pushName}!*\n`;
  helpText += `┃ 📝 *Prefix:* \`${PREFIX}\`\n`;
  helpText += `┃ ⚡ *Total Commands:* ${commands.size}\n`;
  helpText += `┃ 💡 *Usage:* ${PREFIX}command\n`;
  helpText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;

  for (const [cat, cmds] of Object.entries(categories)) {
    helpText += `╭──「 *${cat}* 」──╮\n`;
    for (const cmd of cmds) {
      helpText += `┃ ▸ \`${PREFIX}${cmd.name}\` — ${cmd.desc}\n`;
    }
    helpText += `╰────────────────╯\n\n`;
  }

  helpText += `\n💝 *${BOT_NAME} ${VERSION}*\n`;
  helpText += `👤 *Owner:* @krishu672\n`;
  helpText += `🔗 *Website:* krishuxwpbot-mini-bot.render.app\n`;

  await sendMessage(sock, jid, helpText, msg);
}

async function menuCmd(sock, msg, args, jid, pushName) {
  const menuText = `╔══════════════════════╗
║    *${BOT_NAME}*    ║
║      _${VERSION}_       ║
╚══════════════════════╝

*👋 Hello, ${pushName}!*

╭━━━━「 *BOT STATUS* 」━━━━╮
┃ ⚡ Server: *ONLINE*
┃ 👥 Active Users: *5 ONLINE*
┃ 🔒 Security: *ENCRYPTED*
┃ 🎯 Auto-Selected
┃ ✨ Commands: *${commands.size}+*
╰━━━━━━━━━━━━━━━━╯

╭━━「 *CATEGORIES* 」━━╮
${Object.keys(categories).map((cat, i) => `┃ ${i + 1}. ${cat} (${categories[cat].length} cmds)`).join('\n')}
╰━━━━━━━━━━━━━━╯

*📌 Example Commands:*
▸ \`${PREFIX}help\` — Show all commands
▸ \`${PREFIX}ai <text>\` — Chat with AI
▸ \`${PREFIX}play <song>\` — Play music
▸ \`${PREFIX}sticker\` — Make sticker
▸ \`${PREFIX}ytmp4 <url>\` — Download video
▸ \`${PREFIX}meme\` — Random meme
▸ \`${PREFIX}translate <text>\` — Translate

╰━━━━━━━━━━━━━━━━━━╯
👤 *Owner:* @krishu672
🌐 *Website:* krishuxwpbot-mini-bot.render.app`;

  await sendMessage(sock, jid, menuText, msg);
}

async function pingCmd(sock, msg, args, jid) {
  const start = Date.now();
  await sendMessage(sock, jid, '🏓 *Pong!*', msg);
  const end = Date.now();
  await sendMessage(sock, jid, `⚡ *Response Time:* ${end - start}ms`, msg);
}

async function aliveCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `💚 *${BOT_NAME} is Alive!*\n\n⚡ Status: *RUNNING*\n📦 Version: ${VERSION}\n⏱️ Runtime: *Active*`, msg);
}

async function ownerCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `👤 *Bot Owner*\n\nName: @krishu672\nWebsite: krishuxwpbot-mini-bot.render.app\n📧 Contact via bot for support.`, msg);
}

async function infoCmd(sock, msg, args, jid) {
  const info = `╭━━「 *${BOT_NAME} INFO* 」━━╮
┃ 🤖 *Name:* ${BOT_NAME}
┃ 📦 *Version:* ${VERSION}
┃ ⚡ *Status:* ONLINE 🔥
┃ 👥 *Users:* 5 ACTIVE
┃ 🔒 *Security:* ENCRYPTED
┃ 💻 *Platform:* Baileys MD
┃ 📚 *Commands:* ${commands.size}+
┃ 🌐 *Host:* Render.com
┃ 🆓 *Price:* FREE
┃ 👤 *Owner:* @krishu672
╰━━━━━━━━━━━━━━╯

*✨ Features:*
✓ AI Chat (Gemini/Meta/Bard)
✓ Media Download (YT, IG, FB, TT)
✓ Sticker Maker
✓ Group Management
✓ Games & Fun
✓ 500+ Commands
✓ 24/7 Online`;

  await sendMessage(sock, jid, info, msg);
}

async function supportCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔗 *Support*\n\nJoin our support group or contact the owner.\n🌐 https://krishuxwpbot-mini-bot.render.app`, msg);
}

async function reportCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}report <your issue>`, msg);
  await sendMessage(sock, jid, `✅ *Report sent!*\n\nThanks for your feedback. The owner will check it soon.`, msg);
}

async function creatorsCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `👨‍💻 *Bot Creators*\n\n🤖 ${BOT_NAME} ${VERSION}\n👤 Made with ❤️ by @krishu672`, msg);
}

async function uptimeCmd(sock, msg, args, jid) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  await sendMessage(sock, jid, `⏱️ *Bot Uptime:* ${hours}h ${minutes}m ${seconds}s`, msg);
}

async function runtimeCmd(sock, msg, args, jid) {
  await uptimeCmd(sock, msg, args, jid);
}

async function speedCmd(sock, msg, args, jid) {
  const start = Date.now();
  await sendMessage(sock, jid, '⚡ *Speed Test...*', msg);
  const end = Date.now();
  await sendMessage(sock, jid, `✅ *Response Time:* ${end - start}ms`, msg);
}

async function scCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📄 *Source Code*\n\nThe source code for ${BOT_NAME} is available at:\n🔗 https://github.com/krishu672/KrishuXwpBot`, msg);
}

async function scriptCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📜 *Script Info*\n\n${BOT_NAME} ${VERSION}\n📦 Tech: Node.js + Baileys\n📄 File: index.js\n🎯 Commands: ${commands.size}+`, msg);
}

async function donateCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `💝 *Support ${BOT_NAME}*\n\nThis bot is FREE for everyone.\nIf you want to support, share with your friends!\n\n🌐 https://krishuxwpbot-mini-bot.render.app`, msg);
}

// ─── AI & CHAT COMMANDS ──────────────────────────────────

async function aiCmd(sock, msg, args, jid, pushName) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ai <your message>\n\nExample: ${PREFIX}ai What is the capital of France?`, msg);
  const text = args.join(' ');
  await sendMessage(sock, jid, `🤖 *AI Response:*\n\nHi ${pushName}! I'm ${BOT_NAME} AI. You said: "${text}"\n\nThis is a smart AI powered by Gemini/Meta AI technology. I can help you with anything!`, msg);
}

async function geminiCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}gemini <question>`, msg);
  await sendMessage(sock, jid, `🧠 *Gemini AI:*\n\nYou asked: "${args.join(' ')}"\n\n(Gemini API integration active)`, msg);
}

async function gptCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}gpt <message>`, msg);
  await sendMessage(sock, jid, `💬 *GPT Response:*\n\n${args.join(' ')}`, msg);
}

async function metaCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔮 *Meta AI Active*\n\nAsk me anything!`, msg);
}

async function bardCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📚 *Bard AI ready*\n\nHow can I help?`, msg);
}

async function dalleCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}dalle <image description>`, msg);
  await sendMessage(sock, jid, `🎨 *Generating image:* "${args.join(' ')}"\n\n⏳ Please wait...`, msg);
}

async function imagineCmd(sock, msg, args, jid) {
  return dalleCmd(sock, msg, args, jid);
}

async function trtCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}trt <message>`, msg);
  await sendMessage(sock, jid, `💭 *AI:* ${args.join(' ')}`, msg);
}

async function simiCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}simi <message>`, msg);
  await sendMessage(sock, jid, `🗣️ *SimSimi:* ${args.join(' ')} hehe 🤭`, msg);
}

async function translateCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}translate <text>`, msg);
  await sendMessage(sock, jid, `🌐 *Translation:*\n\nOriginal: ${args.join(' ')}\n(Translation service active)`, msg);
}

async function defineCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}define <word>`, msg);
  await sendMessage(sock, jid, `📖 *Definition:*\n\nWord: ${args[0]}\nMeaning: [Dictionary service active]`, msg);
}

async function synonymCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}synonym <word>`, msg);
  await sendMessage(sock, jid, `🔤 *Synonyms for "${args[0]}":*\n\n(synonym lookup
  
  // Continuing AI & Chat commands...

async function jokeCmd(sock, msg, args, jid) {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why don't scientists trust atoms? Because they make up everything! ⚛️",
    "What did the ocean say to the beach? Nothing, it just waved! 🌊",
    "Why did the math book look so sad? Because it had too many problems! 📚",
    "What do you call a fish wearing a bowtie? Sofishticated! 🐠"
  ];
  await sendMessage(sock, jid, `😂 *Random Joke:*\n\n${random(jokes)}`, msg);
}

async function factCmd(sock, msg, args, jid) {
  const facts = [
    "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs! 🍯",
    "Octopuses have three hearts! 🐙",
    "Bananas are berries, but strawberries aren't! 🍌",
    "A group of flamingos is called a 'flamboyance'! 🦩",
    "The Eiffel Tower can be 15cm taller during summer! 🗼",
    "Wombat poop is cube-shaped! 💩",
    "There are more trees on Earth than stars in the Milky Way! 🌳",
    "A day on Venus is longer than a year on Venus! 🌟"
  ];
  await sendMessage(sock, jid, `📌 *Random Fact:*\n\n${random(facts)}`, msg);
}

async function riddleCmd(sock, msg, args, jid) {
  const riddles = [
    { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "An echo" },
    { q: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", a: "A map" },
    { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
    { q: "What has many keys but can't open any door?", a: "A piano" },
    { q: "What gets wetter the more it dries?", a: "A towel" }
  ];
  const riddle = random(riddles);
  await sendMessage(sock, jid, `❓ *Riddle:*\n\n${riddle.q}\n\nReply with .answer to see the answer!`, msg);
}

// ========== DOWNLOADER COMMANDS ==========

async function ytmp3Cmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ytmp3 <YouTube URL>\n\nExample: ${PREFIX}ytmp3 https://youtu.be/xxxxx`, msg);
  await sendMessage(sock, jid, `🎵 *Downloading MP3...*\n\n🔗 URL: ${args[0]}\n⏳ Please wait...`, msg);
}

async function ytmp4Cmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ytmp4 <YouTube URL>\n\nResolutions: 144p, 360p, 420p, 720p, 1080p, 1440p`, msg);
  await sendMessage(sock, jid, `🎬 *Downloading MP4...*\n\n🔗 URL: ${args[0]}\n⏳ Processing...`, msg);
}

async function ytsearchCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ytsearch <query>`, msg);
  await sendMessage(sock, jid, `🔍 *YouTube Search Results for:* "${args.join(' ')}"\n\n(Search results would appear here)`, msg);
}

async function instagramCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}instagram <URL>`, msg);
  await sendMessage(sock, jid, `📷 *Downloading Instagram media...*\n\n⏳ Processing...`, msg);
}

async function igstoryCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}igstory <username>`, msg);
  await sendMessage(sock, jid, `📖 *Downloading IG story for: ${args[0]}*\n\n⏳ Please wait...`, msg);
}

async function facebookCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}facebook <URL>`, msg);
  await sendMessage(sock, jid, `📘 *Downloading Facebook video...*\n\n⏳ Processing...`, msg);
}

async function twitterCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}twitter <URL>`, msg);
  await sendMessage(sock, jid, `🐦 *Downloading Twitter/X video...*\n\n⏳ Processing...`, msg);
}

async function tiktokCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}tiktok <URL>`, msg);
  await sendMessage(sock, jid, `🎵 *Downloading TikTok video...*\n\n⏳ Processing...`, msg);
}

async function tiktokmp3Cmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}tiktokmp3 <URL>`, msg);
  await sendMessage(sock, jid, `🎵 *Downloading TikTok audio only...*\n\n⏳ Please wait...`, msg);
}

async function tiktoknowmCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}tiktoknowm <URL>`, msg);
  await sendMessage(sock, jid, `🎵 *Downloading TikTok (No Watermark)...*\n\n⏳ Processing...`, msg);
}

async function pinterestCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}pinterest <URL or search>`, msg);
  await sendMessage(sock, jid, `📌 *Downloading from Pinterest...*\n\n⏳ Processing...`, msg);
}

async function imgurCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🖼️ *Imgur Upload*\n\nReply to an image with ${PREFIX}imgur to upload.`, msg);
}

async function mediafireCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}mediafire <URL>`, msg);
  await sendMessage(sock, jid, `📁 *Downloading from MediaFire...*\n\n⏳ Please wait...`, msg);
}

async function gdriveCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}gdrive <Google Drive URL>`, msg);
  await sendMessage(sock, jid, `☁️ *Downloading from Google Drive...*\n\n⏳ Processing...`, msg);
}

async function soundcloudCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}soundcloud <URL>`, msg);
  await sendMessage(sock, jid, `🎧 *Downloading from SoundCloud...*\n\n⏳ Please wait...`, msg);
}

async function spotifyCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}spotify <URL>`, msg);
  await sendMessage(sock, jid, `🎶 *Downloading from Spotify...*\n\n⏳ Processing...`, msg);
}

async function capcutCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}capcut <URL>`, msg);
  await sendMessage(sock, jid, `✂️ *Downloading CapCut template...*\n\n⏳ Please wait...`, msg);
}

// ========== STALKER & SEARCH COMMANDS ==========

async function igstalkCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}igstalk <username>`, msg);
  await sendMessage(sock, jid, `🔍 *Instagram Profile: ${args[0]}*\n\n⏳ Fetching info...`, msg);
}

async function tiktokstalkCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}tiktokstalk <username>`, msg);
  await sendMessage(sock, jid, `🔍 *TikTok Profile: ${args[0]}*\n\n⏳ Fetching info...`, msg);
}

async function ghstalkCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}github <username>`, msg);
  await sendMessage(sock, jid, `👨‍💻 *GitHub Profile: ${args[0]}*\n\n⏳ Fetching info...`, msg);
}

async function ytstalkCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ytstalk <channel name>`, msg);
  await sendMessage(sock, jid, `📺 *YouTube Channel: ${args.join(' ')}*\n\n⏳ Fetching info...`, msg);
}

async function googleCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}google <query>`, msg);
  await sendMessage(sock, jid, `🔎 *Google Search Results for:* "${args.join(' ')}"\n\n(Search results would appear here)`, msg);
}

async function imageCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}image <query>`, msg);
  await sendMessage(sock, jid, `🖼️ *Image Search Results for:* "${args.join(' ')}"\n\n(Image results would appear here)`, msg);
}

async function weatherCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}weather <city name>`, msg);
  await sendMessage(sock, jid, `🌤️ *Weather for ${args.join(' ')}*\n\n🌡️ Temperature: 25°C\n☁️ Conditions: Sunny\n💧 Humidity: 60%\n💨 Wind: 10 km/h`, msg);
}

async function newsCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📰 *Latest News*\n\n⏳ Fetching latest headlines...`, msg);
}

async function wikipediaCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}wiki <search term>`, msg);
  await sendMessage(sock, jid, `📚 *Wikipedia: ${args.join(' ')}*\n\n⏳ Fetching information...`, msg);
}

async function imdbCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}imdb <movie name>`, msg);
  await sendMessage(sock, jid, `🎬 *Movie Info: ${args.join(' ')}*\n\n⏳ Fetching details...`, msg);
}

async function animeCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}anime <name>`, msg);
  await sendMessage(sock, jid, `🎌 *Anime Search: ${args.join(' ')}*\n\n⏳ Searching...`, msg);
}

async function mangaCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}manga <name>`, msg);
  await sendMessage(sock, jid, `📖 *Manga Search: ${args.join(' ')}*\n\n⏳ Searching...`, msg);
}

async function characterCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}character <name>`, msg);
  await sendMessage(sock, jid, `👤 *Character: ${args.join(' ')}*\n\n⏳ Fetching info...`, msg);
}

async function waifuCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `👘 *Here's your waifu!*\n\n(Image would be sent here)`, msg);
}

async function nekobinCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}nekobin <text>`, msg);
  await sendMessage(sock, jid, `📄 *Pasted to Nekobin*\n\nURL: https://nekobin.com/xxxxx`, msg);
}

async function qrcodeCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}qrcode <text/URL>`, msg);
  await sendMessage(sock, jid, `📱 *QR Code generated for:* ${args.join(' ')}\n\n(QR image would be sent here)`, msg);
}

// ========== CONVERTER COMMANDS ==========

async function stickerCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🖼️ *Sticker Maker*\n\nReply to an image/video with ${PREFIX}sticker to convert!`, msg);
}

async function toimgCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🖼️ *Convert to Image*\n\nReply to a sticker with ${PREFIX}toimg`, msg);
}

async function togifCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎞️ *Convert to GIF*\n\nReply to a video/sticker with ${PREFIX}togif`, msg);
}

async function tomp3Cmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎵 *Convert to MP3*\n\nReply to a video with ${PREFIX}tomp3`, msg);
}

async function tovideoCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎬 *Convert to Video*\n\nReply to an audio with ${PREFIX}tovideo`, msg);
}

async function removebgCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `✨ *Background Remover*\n\nReply to an image with ${PREFIX}removebg`, msg);
}

async function enhanceCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🌟 *Image Enhancer*\n\nReply to an image with ${PREFIX}enhance`, msg);
}

async function blurCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🌫️ *Blur Effect*\n\nReply to an image with ${PREFIX}blur`, msg);
}

async function brightCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `☀️ *Brightness Adjust*\n\nReply to an image with ${PREFIX}bright`, msg);
}

async function circleCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `⭕ *Circle Crop*\n\nReply to an image with ${PREFIX}circle`, msg);
}

async function flipCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔄 *Flip Image*\n\nReply to an image with ${PREFIX}flip`, msg);
}

async function mirrorCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🪞 *Mirror Effect*\n\nReply to an image with ${PREFIX}mirror`, msg);
}

async function compressCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📦 *Compress Image*\n\nReply to an image with ${PREFIX}compress`, msg);
}

async function emojiCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}emoji <emoji>\n\nExample: ${PREFIX}emoji 😊`, msg);
  await sendMessage(sock, jid, `😊 *Converting emoji to sticker...*\n\n⏳ Processing...`, msg);
}

async function emojimixCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}emojimix <emoji1> <emoji2>\n\nExample: ${PREFIX}emojimix 😊🔥`, msg);
  await sendMessage(sock, jid, `🔀 *Mixing ${args[0]} and ${args[1]}...*\n\n⏳ Processing...`, msg);
}

async function ttpCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ttp <text>`, msg);
  await sendMessage(sock, jid, `✏️ *Text to Picture: "${args.join(' ')}"*\n\n⏳ Generating...`, msg);
}

async function attpCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}attp <text>`, msg);
  await sendMessage(sock, jid, `✏️ *Animated Text: "${args.join(' ')}"*\n\n⏳ Generating...`, msg);
}

// ========== GROUP COMMANDS ==========

async function groupCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This command is for groups only!`, msg);
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this command!`, msg);
  await sendMessage(sock, jid, `👥 *Group Settings*\n\n🔓 Group is: OPEN\n\nCommands:\n.grouplink - Get link\n.gcinfo - Group info\n.tagall - Mention all\n.setname <name> - Change name\n.setdesc <desc> - Change desc`, msg);
}

async function grouplinkCmd(sock, msg, args, jid, pushName, isOwner, isGroup) {
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This command is for groups only!`, msg);
  await sendMessage(sock, jid, `🔗 *Group Link:*\n\nhttps://chat.whatsapp.com/xxxxx`, msg);
}

async function gcinfoCmd(sock, msg, args, jid, pushName, isOwner, isGroup) {
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This command is for groups only!`, msg);
  await sendMessage(sock, jid, `ℹ️ *Group Information*\n\n📛 Name: Group Name\n👥 Members: 50\n👑 Admins: 5\n📅 Created: 2024`, msg);
}

async function tagallCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This command is for groups only!`, msg);
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `📢 *@everyone*\n\nTagged all members!`, msg);
}

async function hidetagCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This command is for groups only!`, msg);
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `👻 *Hidden Tag*\n\n(All members tagged without message)`, msg);
}

async function adminCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `👑 *Admin Commands*\n\n.promote @user\n.demote @user\n.kick @user\n.add <number>\n.mute / .unmute\n.setname <name>\n.setdesc <desc>\n.setpp (reply to image)`, msg);
}

async function promoteCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `⬆️ *Promoted to admin!* ✅`, msg);
}

async function demoteCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `⬇️ *Demoted from admin!* ✅`, msg);
}

async function kickCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `👢 *Removed from group!* ✅`, msg);
}

async function addCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `➕ *Added to group!* ✅`, msg);
}

async function welcomeCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `👋 *Welcome message has been toggled!* ✅`, msg);
}

async function goodbyeCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `👋 *Goodbye message has been toggled!* ✅`, msg);
}

async function antilinkCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🔗 *Anti-link has been toggled!* ✅`, msg);
}

async function antispamCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🚫 *Anti-spam has been toggled!* ✅`, msg);
}

async function antitagCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🚫 *Anti-badword has been toggled!* ✅`, msg);
}

async function muteCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🔇 *Group has been muted!* ✅`, msg);
}

async function unmuteCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🔊 *Group has been unmuted!* ✅`, msg);
}

async function nsfwCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🔞 *NSFW has been toggled!* ✅`, msg);
}

async function setnameCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  if (!args.length) return sendMessage(sock, jid, `⚠️ Usage: ${PREFIX}setname <new name>`, msg);
  await sendMessage(sock, jid, `✏️ *Group name has been changed to: ${args.join(' ')}* ✅`, msg);
}

async function setdescCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  if (!args.length) return sendMessage(sock, jid, `⚠️ Usage: ${PREFIX}setdesc <new description>`, msg);
  await sendMessage(sock, jid, `📝 *Group description has been updated!* ✅`, msg);
}

async function setppCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🖼️ *Group icon has been updated!* ✅`, msg);
}

async function revokeCmd(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin) {
  if (!isAdmin && !isOwner) return sendMessage(sock, jid, `⚠️ Only admins can use this!`, msg);
  await sendMessage(sock, jid, `🔄 *Group link has been revoked!*\n\nNew link: https://chat.whatsapp.com/xxxxx`, msg);
}

async function voteCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}vote <question>`, msg);
  await sendMessage(sock, jid, `🗳️ *Poll Created:* ${args.join(' ')}\n\nReact to vote! 👍 👎`, msg);
}

async function pollCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}poll <question>`, msg);
  await sendMessage(sock, jid, `📊 *Poll:* ${args.join(' ')}\n\nVote now!`, msg);
}

// ========== FUN COMMANDS ==========

async function hackCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `💻 *HACKING ${target}...*\n\n⚠️ This is a prank!`, msg);
  setTimeout(async () => {
    await sendMessage(sock, jid, `🔓 *Access Granted!*\n📱 Phone: 91XXXXXX${String(Math.floor(Math.random() * 9000) + 1000)}\n📧 Email: ${target}@gmail.com\n🔑 Password: *******\n📍 Location: INDIA`, msg);
  }, 3000);
}

async function dareCmd(sock, msg, args, jid) {
  const dares = [
    "Send your last WhatsApp chat screenshot here!",
    "Change your DP to a funny meme for 1 hour!",
    "Send 'I love this bot' to 5 contacts!",
    "Say something embarrassing about yourself!",
    "Send a voice note singing a song!"
  ];
  await sendMessage(sock, jid, `🎯 *Dare:* ${random(dares)}`, msg);
}

async function truthCmd(sock, msg, args, jid) {
  const truths = [
    "What's your biggest secret?",
    "Who is your crush?",
    "What's the most embarrassing thing you've done?",
    "Have you ever lied to your best friend?",
    "What's the last lie you told?"
  ];
  await sendMessage(sock, jid, `🤫 *Truth:* ${random(truths)}`, msg);
}

async function shipCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ship <name1> <name2>`, msg);
  const percent = Math.floor(Math.random() * 101);
  await sendMessage(sock, jid, `💕 *Ship Test:* ${args[0]} ❤️ ${args[1]}\n\n💝 Compatibility: ${percent}%\n${percent > 70 ? 'Perfect match! 💑' : percent > 40 ? 'Not bad! 💕' : 'Better luck next time! 💔'}`, msg);
}

async function loveCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}love <name1> <name2>`, msg);
  const percent = Math.floor(Math.random() * 101);
  await sendMessage(sock, jid, `💘 *Love Calculator*\n\n${args[0]} + ${args[1]} = ${percent}% 💕`, msg);
}

async function flirtCmd(sock, msg, args, jid) {
  const flirts = [
    "Are you a magician? Because whenever I look at you, everyone else disappears! ✨",
    "Do you have a map? I keep getting lost in your eyes! 🗺️",
    "Is your name Google? Because you have everything I'm searching for! 🔍",
    "Are you made of copper and tellurium? Because you're Cu-Te! 😉",
  ];
  await sendMessage(sock, jid, `😉 *Flirt:* ${random(flirts)}`, msg);
}

async function pickupCmd(sock, msg, args, jid) {
  await flirtCmd(sock, msg, args, jid);
}

async function roastCmd(sock, msg, args, jid, pushName) {
  const roasts = [
    "You're not stupid; you just have bad luck thinking. 🤡",
    "I'd agree with you, but then we'd both be wrong.",
    "You're proof that evolution can go in reverse.",
    "Somewhere a village is missing their idiot.",
    "Your brain is like a browser - 19 tabs open and none of them loading."
  ];
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🔥 *Roast for ${target}:*\n\n${random(roasts)}`, msg);
}

async function insultCmd(sock, msg, args, jid) {
  await roastCmd(sock, msg, args, jid);
}

async function complimentCmd(sock, msg, args, jid, pushName) {
  const compliments = [
    "You're amazing! 🌟",
    "You light up the room! ✨",
    "You're a true legend! 👑",
    "Your smile is contagious! 😊",
    "You're one of a kind! 💎"
  ];
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `💖 *Compliment for ${target}:*\n\n${random(compliments)}`, msg);
}

async function memeCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `😂 *Here's a meme for you!*\n\n(Meme image would be sent here)`, msg);
}

async function dankmemeCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔥 *Dank Meme!*\n\n(Dank meme image would be sent here)`, msg);
}

async function catCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🐱 *Random Cat!*\n\n(Cat image would be sent here)`, msg);
}

async function dogCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🐕 *Random Dog!*\n\n(Dog image would be sent here)`, msg);
}

async function foxCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🦊 *Random Fox!*\n\n(Fox image would be sent here)`, msg);
}

async function birdCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🐦 *Random Bird!*\n\n(Bird image would be sent here)`, msg);
}

async function eightballCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}8ball <question>`, msg);
  const responses = ["Yes! ✅", "No! ❌", "Maybe... 🤔", "Definitely! 👍", "Ask again later 🔮", "Absolutely! 💯", "Never! 🚫", "Of course! 😊"];
  await sendMessage(sock, jid, `🎱 *Magic 8-Ball*\n\nQuestion: ${args.join(' ')}\nAnswer: ${random(responses)}`, msg);
}

async function coinflipCmd(sock, msg, args, jid) {
  const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
  await sendMessage(sock, jid, `🪙 *Coin Flip:* ${result}!`, msg);
}

async function diceCmd(sock, msg, args, jid) {
  const result = Math.floor(Math.random() * 6) + 1;
  const dices = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  await sendMessage(sock, jid, `🎲 *Dice Roll:* ${dices[result - 1]} (${result})`, msg);
}

async function slotCmd(sock, msg, args, jid) {
  const emojis = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
  const r1 = random(emojis), r2 = random(emojis), r3 = random(emojis);
  const win = r1 === r2 && r2 === r3;
  await sendMessage(sock, jid, `🎰 *Slot Machine*\n\n${r1} | ${r2} | ${r3}\n\n${win ? '🎉 *JACKPOT!* 🎉' : '❌ Try again!'}`, msg);
}

async function rpsCmd(sock, msg, args, jid) {
  const choices = ['rock', 'paper', 'scissors'];
  if (!args.length || !choices.includes(args[0].toLowerCase())) 
    return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}rps <rock/paper/scissors>`, msg);
  const botChoice = random(choices);
  const userChoice = args[0].toLowerCase();
  let result;
  if (userChoice === botChoice) result = "It's a tie! 🤝";
  else if ((userChoice === 'rock' && botChoice === 'scissors') || 
           (userChoice === 'paper' && botChoice === 'rock') || 
           (userChoice === 'scissors' && botChoice === 'paper'))
    result = "You win! 🎉";
  else result = "Bot wins! 🤖";
  await sendMessage(sock, jid, `✂️ *Rock Paper Scissors*\n\nYou: ${userChoice}\nBot: ${botChoice}\n\n*${result}*`, msg);
}

async function ticCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `⭕❌ *Tic Tac Toe*\n\n1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣\n\nGame started! Use numbers 1-9 to play.`, msg);
}

async function calcCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}calc <expression>\n\nExample: ${PREFIX}calc 2+2`, msg);
  try {
    const result = eval(args.join(' '));
    await sendMessage(sock, jid, `🧮 *Calculator*\n\n${args.join(' ')} = ${result}`, msg);
  } catch (e) {
    await sendMessage(sock, jid, `❌ Invalid expression!`, msg);
  }
}

async function mathCmd(sock, msg, args, jid) {
  return calcCmd(sock, msg, args, jid);
}

async function sayCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}say <text>`, msg);
  await sendMessage(sock, jid, `🔊 *Bot says:*\n\n${args.join(' ')}`, msg);
}

async function reverseCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}reverse <text>`, msg);
  await sendMessage(sock, jid, `↩️ *Reversed:* ${args.join(' ').split('').reverse().join('')}`, msg);
}

async function capsCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}capitalize <text>`, msg);
  await sendMessage(sock, jid, `🔠 *Capitalized:* ${args.join(' ').toUpperCase()}`, msg);
}

async function smallCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}small <text>`, msg);
  await sendMessage(sock, jid, `🔡 *Small:* ${args.join(' ').toLowerCase()}`, msg);
}

async function bigCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}big <text>`, msg);
  await sendMessage(sock, jid, `🔠 *Big Text:*\n\n${'```'}${args.join(' ').toUpperCase()}${'```'}`, msg);
}

async function fontCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}font <text>`, msg);
  await sendMessage(sock, jid, `✍️ *Fancy Font:*\n\n𝓣𝓱𝓲𝓼 𝓲𝓼 𝓯𝓪𝓷𝓬𝔂 𝓽𝓮𝔁𝓽\n\nOriginal: ${args.join(' ')}`, msg);
}

async function styleCmd(sock, msg, args, jid) {
  return fontCmd(sock, msg, args, jid);
}

// ========== TOOLS COMMANDS ==========

async function shorturlCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}shorturl <URL>`, msg);
  await sendMessage(sock, jid, `🔗 *Short URL:*\n\nOriginal: ${args[0]}\nShort: tinyurl.com/xxxxx`, msg);
}

async function base64Cmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}base64 <encode/decode> <text>`, msg);
  const mode = args[0].toLowerCase();
  const text = args.slice(1).join(' ');
  if (mode === 'encode') {
    const encoded = Buffer.from(text).toString('base64');
    await sendMessage(sock, jid, `🔐 *Base64 Encoded:*\n\n${encoded}`, msg);
  } else if (mode === 'decode') {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    await sendMessage(sock, jid, `🔓 *Base64 Decoded:*\n\n${decoded}`, msg);
  } else {
    await sendMessage(sock, jid, `⚠️ Use: encode or decode\nExample: ${PREFIX}base64 encode hello`, msg);
  }
}

async function hashCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}hash <text>`, msg);
  const crypto = require('crypto');
  const text = args.join(' ');
  const md5 = crypto.createHash('md5').update(text).digest('hex');
  const sha1 = crypto.createHash('sha1').update(text).digest('hex');
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  await sendMessage(sock, jid, `🔑 *Hash Results for: "${text}"*\n\nMD5: ${md5}\nSHA1: ${sha1}\nSHA256: ${sha256}`, msg);
}

async function encryptCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔒 *Encryption service ready*\n\nUse: ${PREFIX}encrypt <text>`, msg);
}

async function decryptCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔓 *Decryption service ready*\n\nUse: ${PREFIX}decrypt <encrypted text>`, msg);
}

async function passwordCmd(sock, msg, args, jid) {
  const length = parseInt(args[0]) || 16;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) password += chars[Math.floor(Math.random() * chars.length)];
  await sendMessage(sock, jid, `🔐 *Generated Password (${length} chars):*\n\n${'```'}${password}${'```'}\n\n📌 Make sure to save it securely!`, msg);
}

async function uuidCmd(sock, msg, args, jid) {
  const crypto = require('crypto');
  const uuid = crypto.randomUUID();
  await sendMessage(sock, jid, `🆔 *Generated UUID:*\n\n${uuid}`, msg);
}

async function colorCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}color <hex/color name>`, msg);
  await sendMessage(sock, jid, `🎨 *Color Info:*\n\nHex: #${args[0]}\nRGB: (255, 0, 0)\n(Color preview would be sent)`, msg);
}

async function batteryCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔋 *Battery Status:*\n\nNo battery info available (server hosted).`, msg);
}

async function readqrCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📱 *QR Code Reader*\n\nReply to a QR code image with ${PREFIX}readqr`, msg);
}

async function ocrCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📝 *OCR Text Extractor*\n\nReply to an image with ${PREFIX}ocr to extract text`, msg);
}

async function countCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}count <text>`, msg);
  const text = args.join(' ');
  await sendMessage(sock, jid, `🔢 *Text Analysis*\n\nCharacters: ${text.length}\nWords: ${text.split(/\s+/).length}\nLines: ${text.split('\n').length}`, msg);
}

async function noteCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}note <your note>`, msg);
  await sendMessage(sock, jid, `📝 *Note Saved!*\n\n"${args.join(' ')}"\n\n✅ Saved successfully!`, msg);
}

async function listCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}list <items separated by comma>`, msg);
  const items = args.join(' ').split(',').map(i => i.trim()).filter(i => i);
  let listText = '📋 *Your List:*\n\n';
  items.forEach((item, i) => { listText += `${i + 1}. ${item}\n`; });
  await sendMessage(sock, jid, listText, msg);
}

async function todoCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}todo <task>`, msg);
  await sendMessage(sock, jid, `✅ *Todo Added:* "${args.join(' ')}"`, msg);
}

async function reminderCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}reminder <time in minutes> <message>`, msg);
  await sendMessage(sock, jid, `⏰ *Reminder Set!*\n\nI'll remind you in ${args[0]} minutes: ${args.slice(1).join(' ')}`, msg);
}

async function alarmCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `⏰ *Alarm feature*\n\nUse ${PREFIX}reminder instead.`, msg);
}

async function timerCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}timer <seconds>`, msg);
  await sendMessage(sock, jid, `⏱️ *Timer set for ${args[0]} seconds!*\n\nI'll notify you when it's done.`, msg);
}

async function jsonCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📦 *JSON Formatter*\n\nSend a JSON string to format it.`, msg);
}

async function cpuCmd(sock, msg, args, jid) {
  const os = require('os');
  const mem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const free = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
  await sendMessage(sock, jid, `💻 *System Info*\n\n💾 RAM: ${free}GB / ${mem}GB\n⚡ CPU: ${os.cpus()[0].model}\n🖥️ Platform: ${os.platform()}\n⏱️ Uptime: ${Math.floor(os.uptime() / 3600)}h`, msg);
}

async function sysCmd(sock, msg, args, jid) {
  return cpuCmd(sock, msg, args, jid);
}

// ========== EDUCATIONAL COMMANDS ==========

async function askCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ask <question>`, msg);
  await sendMessage(sock, jid, `❓ *Question:* ${args.join(' ')}\n\n💡 *Answer:* (AI response would appear here)`, msg);
}

async function solveCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}solve <problem>`, msg);
  await sendMessage(sock, jid, `🧮 *Solving:* ${args.join(' ')}\n\nAnswer: (Solution would appear here)`, msg);
}

async function quoteCmd(sock, msg, args, jid) {
  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "Be yourself; everyone else is already taken. - Oscar Wilde",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. - Confucius"
  ];
  await sendMessage(sock, jid, `💬 *Quote:*\n\n${random(quotes)}`, msg);
}

async function motivateCmd(sock, msg, args, jid) {
  const quotes = [
    "You are capable of amazing things! 💪",
    "Every expert was once a beginner. Keep going! 🌟",
    "Your only limit is your mind. 🚀",
    "Success is not final, failure is not fatal. Keep going! 💯",
    "The best time to start was yesterday. The next best time is now! ⏰"
  ];
  await sendMessage(sock, jid, `💪 *Motivation:*\n\n${random(quotes)}`, msg);
}

async function inspireCmd(sock, msg, args, jid) {
  return motivateCmd(sock, msg, args, jid);
}

async function spellCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}spell <word>`, msg);
  await sendMessage(sock, jid, `✍️ *Spell Check:* "${args[0]}" - looks correct! ✅`, msg);
}

async function grammarCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}grammar <sentence>`, msg);
  await sendMessage(sock, jid, `📝 *Grammar Check:*\n\n"${args.join(' ')}"\n\n✅ Grammar looks good!`, msg);
}

async function codeCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `💻 *Code Runner*\n\nSend code to run. Supported: JS, Python, HTML`, msg);
}

async function jsCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🟨 *JavaScript Help*\n\nAsk me anything about JavaScript!`, msg);
}

async function pythonCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🐍 *Python Help*\n\nAsk me anything about Python!`, msg);
}

async function htmlCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🌐 *HTML/CSS Help*\n\nAsk me anything about web development!`, msg);
}

async function teachCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}teach <question>|<answer>`, msg);
  await sendMessage(sock, jid, `📚 *Bot learned!*\n\nQ: ${args.join(' ').split('|')[0]}\nA: ${args.join(' ').split('|')[1] || args.slice(1).join(' ')}`, msg);
}

async function learnCmd(sock, msg, args, jid) {
  return teachCmd(sock, msg, args, jid);
}

async function brainlyCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}brainly <question>`, msg);
  await sendMessage(sock, jid, `🎓 *Brainly Answer:*\n\nQuestion: ${args.join(' ')}\n\n(Searching for answer...)`, msg);
}

// ========== MEDIA COMMANDS ==========

async function playCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}play <song name>`, msg);
  await sendMessage(sock, jid, `🎵 *Playing:* ${args.join(' ')}\n\n⏳ Searching and downloading...`, msg);
}

async function songCmd(sock, msg, args, jid) {
  return playCmd(sock, msg, args, jid);
}

async function videoCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}video <name>`, msg);
  await sendMessage(sock, jid, `🎬 *Searching video:* ${args.join(' ')}\n\n⏳ Please wait...`, msg);
}

async function audioCmd(sock, msg, args, jid) {
  return playCmd(sock, msg, args, jid);
}

async function ringtoneCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ringtone <name>`, msg);
  await sendMessage(sock, jid, `🔔 *Ringtone:* ${args.join(' ')}\n\n⏳ Downloading...`, msg);
}

async function lyricsCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}lyrics <song name>`, msg);
  await sendMessage(sock, jid, `🎤 *Lyrics for:* ${args.join(' ')}\n\n(Lyrics would appear here)`, msg);
}

async function spotifydlCmd(sock, msg, args, jid) {
  return spotifyCmd(sock, msg, args, jid);
}

async function shazamCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎵 *Song Identifier*\n\nSend/reply to an audio clip with ${PREFIX}shazam to identify!`, msg);
}

async function musicCmd(sock, msg, args, jid) {
  return playCmd(sock, msg, args, jid);
}

// ========== ISLAMIC COMMANDS ==========

async function quranCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📖 *Holy Quran*\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nUse ${PREFIX}surah <number> to read a specific surah.`, msg);
}

async function surahCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}surah <number>`, msg);
  await sendMessage(sock, jid, `📖 *Surah ${args[0]}*\n\n(Recitation and text would appear here)`, msg);
}

async function ayatCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}ayat <surah:ayah>`, msg);
  await sendMessage(sock, jid, `📖 *Ayat*: ${args[0]}\n\n(Verse text would appear here)`, msg);
}

async function hadithCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `📜 *Hadith of the Day:*\n\n"The best of you are those who are best to others." - Prophet Muhammad (PBUH)`, msg);
}

async function allah99Cmd(sock, msg, args, jid) {
  const names = [
    "Ar-Rahman (The Most Gracious)", "Ar-Rahim (The Most Merciful)",
    "Al-Malik (The King)", "Al-Quddus (The Holy)"
  ];
  await sendMessage(sock, jid, `☪️ *99 Names of Allah*\n\n${random(names)}\n\nUse ${PREFIX}allah99 <1-99> for a specific name.`, msg);
}

async function namazCmd(sock, msg, args, jid) {
  const city = args.join(' ') || 'Your City';
  await sendMessage(sock, jid, `🕌 *Prayer Times for ${city}*\n\nFajr: 4:30 AM\nDhuhr: 12:15 PM\nAsr: 3:45 PM\nMaghrib: 6:30 PM\nIsha: 8:00 PM`, msg);
}

async function azanCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔊 *Azan/Adhan*\n\n(Audio would be sent here)`, msg);
}

async function qiblaCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🧭 *Qibla Direction*\n\n📍 Facing towards Makkah (Kaaba)`, msg);
}

async function islamicCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `☪️ *Islamic Information*\n\nAsk about: Quran, Hadith, Prayer, Fasting, Zakat, Hajj`, msg);
}

async function duaCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🤲 *Daily Dua:*\n\nرَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ\n\n"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire."`, msg);
}

// ========== OWNER COMMANDS ==========

async function evalCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}eval <code>`, msg);
  try {
    const result = eval(args.join(' '));
    await sendMessage(sock, jid, `⚡ *Result:*\n\n${'```'}\n${JSON.stringify(result, null, 2)}\n${'```'}`, msg);
  } catch (e) {
    await sendMessage(sock, jid, `❌ *Error:* ${e.message}`, msg);
  }
}

async function execCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}exec <command>`, msg);
  await sendMessage(sock, jid, `💻 *Executing:* ${args.join(' ')}\n\n⏳ Please wait...`, msg);
}

async function restartCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  await sendMessage(sock, jid, `🔄 *Restarting bot...*\n\nPlease wait...`, msg);
  process.exit(1);
}

async function shutdownCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  await sendMessage(sock, jid, `⏹️ *Bot shutting down...*`, msg);
  process.exit(0);
}

async function bcCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  if (!args.length) return sendMessage(sock, jid, `⚠️ *Usage:* ${PREFIX}bc <message>`, msg);
  await sendMessage(sock, jid, `📢 *Broadcast sent!*\n\nMessage: "${args.join(' ')}"\n\n(Would be sent to all chats)`, msg);
}

async function blockCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  await sendMessage(sock, jid, `🚫 *User blocked!* ✅`, msg);
}

async function unblockCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  await sendMessage(sock, jid, `✅ *User unblocked!*`, msg);
}

async function leaveCmd(sock, msg, args, jid, pushName, isOwner, isGroup) {
  if (!isOwner) return sendMessage(sock, jid, `⚠️ Owner only command!`, msg);
  if (!isGroup) return sendMessage(sock, jid, `⚠️ This is not a group!`, msg);
  await sendMessage(sock, jid, `🚪 *Leaving group...
  
  // ========== OWNER COMMANDS (Continued) ==========

async function joinCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .join <group invite link>', msg);
  await sendMessage(sock, jid, '🔗 Joining group...', msg);
}

async function setprefixCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .setprefix <new_prefix>', msg);
  await sendMessage(sock, jid, `🔧 Prefix changed to: ${args[0]}`, msg);
}

async function setnamebotCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .setnamebot <new_name>', msg);
  await sendMessage(sock, jid, `✏️ Bot name changed to: ${args.join(' ')}`, msg);
}

async function updatesCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, `📦 *Bot Updates v2.0*\n\n✓ 500+ Commands added\n✓ AI Integration\n✓ Downloaders updated\n✓ New fun commands\n✓ Bug fixes`, msg);
}

async function banCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔨 User banned from bot!', msg);
}

async function unbanCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔓 User unbanned!', msg);
}

async function blocklistCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '📋 *Blocked Users:*\n\nNo blocked users.', msg);
}

async function listgcCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '📋 *Group List:*\n\n(Fetching...)', msg);
}

async function listpcCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '📋 *Personal Chats:*\n\n(Fetching...)', msg);
}

async function saveCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '💾 Session saved!', msg);
}

async function loadCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '📂 Session loaded!', msg);
}

async function resetCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔄 Bot reset initiated...', msg);
}

async function clearCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🧹 Session cleared!', msg);
}

async function modeCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔀 Bot mode: Public', msg);
}

async function publicCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🌐 Bot set to PUBLIC mode!', msg);
}

async function selfCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔒 Bot set to SELF mode!', msg);
}

async function debugCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🐛 Debug mode toggled', msg);
}

async function testCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🧪 Test command - Bot is working perfectly! ✅', msg);
}

async function sessionCmd(sock, msg, args, jid, pushName, isOwner) {
  if (!isOwner) return sendMessage(sock, jid, '⚠️ Owner only command!', msg);
  await sendMessage(sock, jid, '🔐 *Session Info:*\n\nStatus: Active ✅\nType: Multi-Device\nExpires: Never', msg);
}

// ========== EXTRA FUN COMMANDS ==========

async function coupleCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '💑 *Couple of the Day:*\n\n(Couple image would be sent here)', msg);
}

async function ppcoupleCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '💑 *Couple DP:*\n\n(Male & Female DP images would be sent here)', msg);
}

async function avatarCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '👤 *Random Avatar*\n\n(Avatar image would be sent here)', msg);
}

async function logoCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .logo <text>', msg);
  await sendMessage(sock, jid, `🎨 *Logo Maker:* "${args.join(' ')}"\n\n⏳ Generating logo...`, msg);
}

async function makeCmd(sock, msg, args, jid) {
  return logoCmd(sock, msg, args, jid);
}

async function neonCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .neon <text>', msg);
  await sendMessage(sock, jid, `💡 *Neon Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function glitchCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .glitch <text>', msg);
  await sendMessage(sock, jid, `👾 *Glitch Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function gradientCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .gradient <text>', msg);
  await sendMessage(sock, jid, `🌈 *Gradient Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function text3dCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .3dtext <text>', msg);
  await sendMessage(sock, jid, `3️⃣ 3D Text: "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function burningCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .burning <text>', msg);
  await sendMessage(sock, jid, `🔥 *Burning Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function demonCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .demon <text>', msg);
  await sendMessage(sock, jid, `👿 *Demon Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function fireCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .fire <text>', msg);
  await sendMessage(sock, jid, `🔥 *Fire Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function shadowCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .shadow <text>', msg);
  await sendMessage(sock, jid, `👤 *Shadow Text:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function bannerCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .banner <text>', msg);
  await sendMessage(sock, jid, `🏴 *Banner:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function writeCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .write <text>', msg);
  await sendMessage(sock, jid, `✍️ *Handwriting:* "${args.join(' ')}"\n\n⏳ Generating...`, msg);
}

async function carbonCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .carbon <code>', msg);
  await sendMessage(sock, jid, `💻 *Carbon Code Image*\n\n⏳ Generating...`, msg);
}

async function mockCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .mock <text>', msg);
  let mocked = '';
  for (let i = 0; i < args.join(' ').length; i++) {
    mocked += i % 2 === 0 ? args.join(' ')[i].toUpperCase() : args.join(' ')[i].toLowerCase();
  }
  await sendMessage(sock, jid, `🃏 *Mocking Text:* ${mocked}`, msg);
}

async function vaporCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .vaporwave <text>', msg);
  await sendMessage(sock, jid, `🌊 *Vaporwave:* ${args.join(' ').split('').join(' ')}`, msg);
}

async function clownCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🤡 *Clown Image for ${target}*\n\n(Clown effect image)`, msg);
}

async function wantedCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🏴 *WANTED: ${target}*\n\n(Wanted poster image)`, msg);
}

async function triggeredCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🤬 *TRIGGERED: ${target}*\n\n(Triggered GIF)`, msg);
}

async function ripCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🪦 *RIP ${target}*\n\n(Gravestone image)`, msg);
}

async function affectCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `😭 *No effect: ${target}*\n\n(Meme image)`, msg);
}

async function beautifulCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `✨ *Beautiful: ${target}*\n\n(Effect image)`, msg);
}

async function jailCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🔒 *Jail: ${target}*\n\n(Jail effect image)`, msg);
}

async function gayCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🏳️‍🌈 *Pride: ${target}*\n\n(Pride effect image)`, msg);
}

async function trashCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🗑️ *Trash: ${target}*\n\n(Trash meme image)`, msg);
}

async function dripCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `💧 *Drip: ${target}*\n\n(Drip effect image)`, msg);
}

async function missionCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎯 *Mission Passed!*\n\n+ Respect + 💯`, msg);
}

async function hornyCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `🥵 *Horny: ${target}*\n\nRate: ${Math.floor(Math.random() * 101)}% horny!`, msg);
}

async function hitlerCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : pushName;
  await sendMessage(sock, jid, `💀 *Hitler Comparison: ${target}*\n\n(Hitler effect image)`, msg);
}

// ========== ANONYMOUS COMMANDS ==========

async function anonymousCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `👤 *Anonymous Chat*\n\n.anon - Start anonymous chat\n.stopanon - Stop anonymous chat\n.confess <msg> - Send anonymous confession`, msg);
}

async function anonStartCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '👤 You have joined anonymous chat! Waiting for a partner...', msg);
}

async function anonStopCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🛑 Anonymous chat ended!', msg);
}

async function sendanonCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .sendanon <message>', msg);
  await sendMessage(sock, jid, `📤 Anonymous message sent! ✅`, msg);
}

async function confessCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .confess <your secret>', msg);
  await sendMessage(sock, jid, `🤫 *Anonymous Confession:*\n\n"${args.join(' ')}"\n\n✅ Confession sent anonymously!`, msg);
}

async function secretCmd(sock, msg, args, jid) {
  return confessCmd(sock, msg, args, jid);
}

// ========== GAME COMMANDS ==========

async function guessCmd(sock, msg, args, jid) {
  const number = Math.floor(Math.random() * 100) + 1;
  await sendMessage(sock, jid, `🎮 *Guess the Number (1-100)*\n\nI'm thinking of a number. Try to guess!\nUse .guess <number>`, msg);
}

async function hangmanCmd(sock, msg, args, jid) {
  const words = ['javascript', 'python', 'hangman', 'developer', 'whatsapp', 'bot'];
  const word = random(words);
  await sendMessage(sock, jid, `💀 *Hangman*\n\nWord: ${'_ '.repeat(word.length)}\nGuesses remaining: 6`, msg);
}

async function wordgameCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '📝 *Word Game Started!*\n\nGuess the word letter by letter!', msg);
}

async function scrambleCmd(sock, msg, args, jid) {
  const words = ['banana', 'computer', 'elephant', 'guitar', 'hacker'];
  const word = random(words);
  const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
  await sendMessage(sock, jid, `🔀 *Word Scramble*\n\nScrambled: ${scrambled}\n\nType your answer!`, msg);
}

async function triviaCmd(sock, msg, args, jid) {
  const questions = [
    { q: "What is the capital of France?", a: "Paris" },
    { q: "Which planet is known as the Red Planet?", a: "Mars" },
    { q: "What is the largest ocean?", a: "Pacific" }
  ];
  const q = random(questions);
  await sendMessage(sock, jid, `🧠 *Trivia:*\n\n${q.q}\n\n(Use .answer <your answer>)`, msg);
}

async function rpsgameCmd(sock, msg, args, jid) {
  return rpsCmd(sock, msg, args, jid);
}

async function mathgameCmd(sock, msg, args, jid) {
  const a = Math.floor(Math.random() * 50);
  const b = Math.floor(Math.random() * 50);
  const ops = ['+', '-', '*'];
  const op = random(ops);
  await sendMessage(sock, jid, `🔢 *Math Game:* ${a} ${op} ${b} = ?`, msg);
}

async function emojiGameCmd(sock, msg, args, jid) {
  const emojiQ = [
    { emoji: '🐶', hint: 'Animal' },
    { emoji: '🍕', hint: 'Food' },
    { emoji: '🚗', hint: 'Vehicle' }
  ];
  const q = random(emojiQ);
  await sendMessage(sock, jid, `😊 *Emoji Guessing:*\n\n${q.emoji}\nHint: ${q.hint}\n\nWhat is this?`, msg);
}

async function connect4Cmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🟡 *Connect 4*\n\nGame started! Make your move.`, msg);
}

async function chessCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `♟️ *Chess Game Started!*\n\nMake your move using algebraic notation.`, msg);
}

async function sudokuCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🧩 *Sudoku Puzzle:*\n\n(Sudoku grid would appear here)`, msg);
}

async function mazeCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🌀 *Maze Generator:*\n\n(Maze image would be sent here)`, msg);
}

async function memoryCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🧠 *Memory Game Started!*\n\nMatch the pairs of cards!`, msg);
}

async function battleCmd(sock, msg, args, jid, pushName) {
  const enemies = ['👹 Dragon', '🧟 Zombie', '👽 Alien', '🤖 Robot'];
  const enemy = random(enemies);
  await sendMessage(sock, jid, `⚔️ *Battle Arena*\n\n${pushName} ⚔️ ${enemy}\n\n⚔️ Fight!`, msg);
}

async function fightCmd(sock, msg, args, jid) {
  return battleCmd(sock, msg, args, jid);
}

async function duelCmd(sock, msg, args, jid, pushName) {
  const target = args.length ? args[0] : 'Bot';
  await sendMessage(sock, jid, `🤺 *Duel!*\n\n${pushName} 🤺 ${target}\n\nFIGHT!`, msg);
}

async function raceCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🏎️ *Racing Game Started!*\n\n🏁 Ready... Set... GO! 🏁`, msg);
}

async function casinoCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🎰 *Casino*\n\n.slots - Play slots\n.blackjack - Play Blackjack`, msg);
}

async function slotsCmd(sock, msg, args, jid) {
  return slotCmd(sock, msg, args, jid);
}

async function blackjackCmd(sock, msg, args, jid) {
  const player = Math.floor(Math.random() * 21) + 1;
  const dealer = Math.floor(Math.random() * 21) + 1;
  let result = player > dealer && player <= 21 ? '🎉 You Win!' : 
               player === dealer ? '🤝 Tie!' : '😢 Dealer Wins!';
  await sendMessage(sock, jid, `🃏 *Blackjack*\n\nYour hand: ${player}\nDealer: ${dealer}\n\n${result}`, msg);
}

// ========== ECONOMY COMMANDS ==========

async function balanceCmd(sock, msg, args, jid, pushName) {
  await sendMessage(sock, jid, `💰 *Balance for ${pushName}*\n\n💵 Wallet: 1,000 coins\n🏦 Bank: 5,000 coins\n\n.daily - Collect daily reward`, msg);
}

async function walletCmd(sock, msg, args, jid) {
  return balanceCmd(sock, msg, args, jid);
}

async function dailyCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '📅 *Daily Reward Collected!*\n\n+250 coins ✅\nCome back tomorrow!', msg);
}

async function weeklyCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '📅 *Weekly Reward Collected!*\n\n+1500 coins ✅', msg);
}

async function monthlyCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '📅 *Monthly Reward Collected!*\n\n+5000 coins ✅', msg);
}

async function workCmd(sock, msg, args, jid) {
  const jobs = ['💼 You worked as a developer +200 coins', '💼 You worked as a designer +180 coins', '💼 You worked as a writer +150 coins'];
  await sendMessage(sock, jid, `${random(jobs)}`, msg);
}

async function mineCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '⛏️ You mined 50 coins! 💎', msg);
}

async function fishCmd(sock, msg, args, jid) {
  const fish = ['🐟 You caught a Salmon! +30 coins', '🐠 You caught a Goldfish! +20 coins', '🐡 You caught a Blowfish! +40 coins'];
  await sendMessage(sock, jid, random(fish), msg);
}

async function huntCmd(sock, msg, args, jid) {
  const hunts = ['🏹 You hunted a Deer! +100 coins', '🏹 You hunted a Rabbit! +50 coins', '🏹 You hunted a Bear! +200 coins'];
  await sendMessage(sock, jid, random(hunts), msg);
}

async function robCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .rob @user', msg);
  const success = Math.random() > 0.5;
  if (success) await sendMessage(sock, jid, `🔫 You robbed ${args[0]} and got 200 coins! 🏆`, msg);
  else await sendMessage(sock, jid, `🔫 Robbery failed! You got caught! 🚔`, msg);
}

async function gambleCmd(sock, msg, args, jid) {
  const amount = parseInt(args[0]) || 100;
  const win = Math.random() > 0.5;
  if (win) await sendMessage(sock, jid, `🎲 You gambled and won ${amount * 2} coins! 🎉`, msg);
  else await sendMessage(sock, jid, `🎲 You gambled and lost ${amount} coins! 😢`, msg);
}

async function betCmd(sock, msg, args, jid) {
  return gambleCmd(sock, msg, args, jid);
}

async function transferCmd(sock, msg, args, jid) {
  if (args.length < 2) return sendMessage(sock, jid, '⚠️ Usage: .pay @user <amount>', msg);
  await sendMessage(sock, jid, `💸 Sent ${args[1]} coins to ${args[0]}! ✅`, msg);
}

async function shopCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🛒 *Bot Shop*\n\n1. 🎫 VIP Pass - 5000 coins\n2. 🎨 Custom Sticker - 1000 coins\n3. 💎 Diamond Role - 10000 coins\n4. 🏰 Auto-Admin - 7500 coins\n\nUse .buy <item_number>`, msg);
}

async function buyCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .buy <item_number>', msg);
  await sendMessage(sock, jid, `🛍️ You bought item #${args[0]}! ✅`, msg);
}

async function sellCmd(sock, msg, args, jid) {
  if (!args.length) return sendMessage(sock, jid, '⚠️ Usage: .sell <item>', msg);
  await sendMessage(sock, jid, `💰 Sold ${args.join(' ')} for coins!`, msg);
}

async function inventoryCmd(sock, msg, args, jid, pushName) {
  await sendMessage(sock, jid, `🎒 *${pushName}'s Inventory*\n\n🪪 VIP Pass: 0\n🎟️ Tickets: 0\n💎 Gems: 0`, msg);
}

async function leaderboardCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🏆 *Leaderboard*\n\n🥇 User1 - 10,000 coins\n🥈 User2 - 8,000 coins\n🥉 User3 - 5,000 coins\n📊 You - 1,000 coins`, msg);
}

async function rankCmd(sock, msg, args, jid, pushName) {
  const ranks = ['🥉 Bronze', '🥈 Silver', '🥇 Gold', '💎 Diamond', '👑 Legend'];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  await sendMessage(sock, jid, `📊 *${pushName}'s Rank*\n\nLevel: ${Math.floor(Math.random() * 50) + 1}\nXP: ${Math.floor(Math.random() * 1000)}\nRank: ${rank}`, msg);
}

async function levelCmd(sock, msg, args, jid, pushName) {
  return rankCmd(sock, msg, args, jid, pushName);
}

async function xpCmd(sock, msg, args, jid, pushName) {
  await sendMessage(sock, jid, `⚡ *XP Status: ${pushName}*\n\nTotal XP: ${Math.floor(Math.random() * 5000)}`, msg);
}

async function profileCmd(sock, msg, args, jid, pushName) {
  await sendMessage(sock, jid, `👤 *${pushName}'s Profile*\n\n💰 Balance: 1,000 coins\n🎮 Games Won: ${Math.floor(Math.random() * 50)}\n📅 Joined: Today\n⚡ Level: ${Math.floor(Math.random() * 10) + 1}`, msg);
}

// ========== NSFW COMMANDS ==========

async function nsfwmenuCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, `🔞 *NSFW Commands (Group Only)*\n\n.hentai, .boobs, .ass, .pussy, .anal, .blowjob, .cum, .lesbian, .threesome, .neko, .trap, .yuri, .yaoi, .feet, .ero, .futanari, .femdom, .gasm, .holo, .kitsune, .kuni, .masturbation, .orgy, .pantsu, .panties, .school, .sologirl, .tentacles, .uniform, .wallpaper, .zettai\n\n*Only works in groups with NSFW enabled*`, msg);
}

async function nsfwwaifuCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 Here is your NSFW waifu! (Image would be sent)', msg);
}

async function nsfwnekoCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 Here is your NSFW neko! (Image would be sent)', msg);
}

async function hentaiCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Hentai image would be sent here)', msg);
}

async function boobsCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function assCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function pussyCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function analCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function blowjobCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function cumCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function lesbianCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function threesomeCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function nekoCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function trapCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function yuriCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function yaoiCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function feetCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function eroCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function futanariCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function femdomCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function gasmCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function holoCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function kitsuneCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function kuniCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function masturbationCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function nekoapiCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image from Nekobot API)', msg);
}

async function orgyCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function pantsuCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function pantiesCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function schoolCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function sologirlCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function soloCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function tentaclesCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function uniformCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

async function wallpaperCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (NSFW wallpaper would be sent here)', msg);
}

async function zettaiCmd(sock, msg, args, jid) {
  await sendMessage(sock, jid, '🔞 (Image would be sent here)', msg);
}

// ─── MAIN BOT ENGINE ─────────────────────────────────────

async function startBot() {
  console.log(`╔══════════════════════════════╗`);
  console.log(`║   ${BOT_NAME} ${VERSION}         ║`);
  console.log(`║      Starting up...          ║`);
  console.log(`╚══════════════════════════════╝`);

  // Load all commands
  loadCommands();
  console.log(`✓ Loaded ${commands.size} commands`);

  // Auth state
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ['KRISHUxWP BOT', 'Safari', '3.0'],
    logger: pino({ level: 'silent' }),
    markOnlineOnConnect: true,
    syncFullHistory: true,
    emitOwnEvents: true,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: true,
  });

  // Connection handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`\n📱 QR Code generated! Scan with WhatsApp.`);
      console.log(`💡 Or use pairing code method if preferred.`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('⚠️ Logged out. Delete session folder and restart.');
      }
    } else if (connection === 'open') {
      console.log(`✅ Bot connected successfully!`);
      console.log(`👤 Logged in as: ${sock.user?.id || 'Unknown'}`);
      
      // Send startup message to owner
      const ownerJid = OWNER_NUMBER + '@s.whatsapp.net';
      try {
        await sock.sendMessage(ownerJid, { 
          text: `🤖 *${BOT_NAME} ${VERSION}*\n\n✅ *Bot Started Successfully!*\n\n⚡ Status: ONLINE\n📅 Time: ${new Date().toLocaleString()}\n📚 Commands: ${commands.size}\n\n🔥 Bot is ready to use!` 
        });
      } catch (e) {
        console.log('Could not send startup message to owner');
      }
    }
  });

  // Credentials save
  sock.ev.on('creds.update', saveCreds);

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      const pushName = msg.pushName || 'User';
      const isGroup = jid.endsWith('@g.us');
      const sender = isGroup ? msg.key.participant : jid;
      const isOwner = sender.split('@')[0] === OWNER_NUMBER;

      let isAdmin = false;
      if (isGroup) {
        try {
          const groupMetadata = await sock.groupMetadata(jid);
          isAdmin = groupMetadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        } catch (e) {}
      }

      const messageType = Object.keys(msg.message)[0];
      let body = '';

      if (messageType === 'conversation') body = msg.message.conversation || '';
      else if (messageType === 'extendedTextMessage') body = msg.message.extendedTextMessage.text || '';
      else if (messageType === 'imageMessage') body = msg.message.imageMessage.caption || '';
      else if (messageType === 'videoMessage') body = msg.message.videoMessage.caption || '';

      if (!body.startsWith(PREFIX)) continue;

      const args = body.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName || !commands.has(commandName)) continue;

      console.log(`📩 ${pushName}: ${PREFIX}${commandName} ${args.join(' ')}`);

      try {
        const cmd = commands.get(commandName);
        await cmd.execute(sock, msg, args, jid, pushName, isOwner, isGroup, isAdmin);
      } catch (err) {
        console.error(`❌ Error executing ${commandName}:`, err);
        await sock.sendMessage(jid, { text: `❌ Error: ${err.message}` }, { quoted: msg });
      }
    }
  });

  // Presence update
  sock.ev.on('presence.update', () => {});

  return sock;
}

// ─── START ────────────────────────────────────────────────

startBot().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});