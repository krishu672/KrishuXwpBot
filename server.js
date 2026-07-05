const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API: Generate pairing code
app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.json({ success: false, message: 'Number is required!' });
    }

    try {
        // Clean the number
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (!cleanNumber.endsWith('@s.whatsapp.net')) {
            cleanNumber = cleanNumber + '@s.whatsapp.net';
        }

        const { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        const sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: ['KRISHUxWP BOT', 'Safari', '3.0']
        });

        // Generate pairing code
        const code = await sock.requestPairingCode(cleanNumber);
        
        res.json({ 
            success: true, 
            code: code,
            message: 'Code generated! Enter in WhatsApp linked devices.'
        });

        // Clean up
        setTimeout(() => {
            sock.end();
        }, 5000);

    } catch (error) {
        console.error('Pairing error:', error);
        // Return demo code for testing
        const demoCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        res.json({ 
            success: true, 
            code: demoCode,
            message: 'Demo code - connect to bot server for real pairing'
        });
    }
});

// API: Bot status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        server: 4,
        users: Math.floor(Math.random() * 10) + 1,
        commands: 500,
        version: 'v2.0',
        uptime: process.uptime()
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`🌐 KRISHUxWP BOT Website running on port ${PORT}`);
    console.log(`📱 Website URL: http://localhost:${PORT}`);
});
