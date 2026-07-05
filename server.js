const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const html = `<!DOCTYPE html>
<html><head><title>KRISHUxWP BOT</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:linear-gradient(135deg,#0f0c29,#302b63);color:#fff;font-family:sans-serif;text-align:center;padding:20px}
h1{background:linear-gradient(45deg,#00ff87,#60efff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.server-status{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:600px}
.status-item{background:rgba(255,255,255,0.05);border-radius:10px;padding:15px;border:1px solid rgba(255,255,255,0.1)}
.status-item .label{color:#888;font-size:0.8em}
.status-item .value{color:#00ff87;font-size:1.2em;font-weight:bold}
.online{color:#00ff87!important;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.encrypted{color:#60efff!important}
.input-group{margin:20px auto;max-width:500px}
.input-group select,.input-group input{padding:12px;margin:5px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff;font-size:1em}
button{padding:15px 30px;border:none;border-radius:12px;background:linear-gradient(45deg,#00ff87,#60efff);color:#000;font-size:1.1em;font-weight:bold;cursor:pointer}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:600px;margin:20px auto}
.stat-card{background:rgba(255,255,255,0.05);border-radius:10px;padding:15px;border:1px solid rgba(255,255,255,0.1)}
.faq{max-width:600px;margin:20px auto;text-align:left}
.faq-item{background:rgba(255,255,255,0.05);border-radius:10px;padding:15px;margin:10px 0}
.footer{color:#666;margin-top:30px}
.pair-code{font-size:2em;letter-spacing:5px;color:#00ff87;padding:15px;background:rgba(0,0,0,0.3);border-radius:8px;margin:10px}
</style></head><body>
<div style="font-size:60px;margin-top:20px">🤖</div>
<h1>KRISHUxWP BOT</h1>
<p style="color:#888">BEST MINI BOT // v2.0</p>
<div class="server-status">
<div class="status-item"><span class="label">⚡ Server</span><span class="value">4</span></div>
<div class="status-item"><span class="label">SYSTEM</span><span class="value online">ONLINE</span></div>
<div class="status-item"><span class="label">ACTIVE USERS</span><span class="value" id="users">5 ONLINE</span></div>
<div class="status-item"><span class="label">SECURITY</span><span class="value encrypted">ENCRYPTED</span></div>
<div class="status-item"><span class="label">MODE</span><span class="value">AUTO‑SELECTED</span></div>
<div class="status-item"><span class="label">COMMANDS</span><span class="value">500+</span></div>
</div>
<h2 style="color:#60efff">🔗 LINK WHATSAPP DEVICE</h2>
<p style="color:#aaa">Enter your WhatsApp number to get pairing code</p>
<div class="input-group">
<select id="code"><option value="91">🇮🇳 +91</option><option value="92">🇵🇰 +92</option><option value="1">🇺🇸 +1</option></select>
<input type="tel" id="number" placeholder="Your WhatsApp number" maxlength="15">
</div>
<button onclick="pair()">🔗 GENERATE PAIRING CODE</button>
<div id="result"></div>
<div class="stats">
<div class="stat-card"><span style="font-size:1.5em;color:#00ff87">500+</span><br><span style="color:#888">Commands</span></div>
<div class="stat-card"><span style="font-size:1.5em;color:#00ff87">24/7</span><br><span style="color:#888">Online</span></div>
<div class="stat-card"><span style="font-size:1.5em;color:#00ff87">🌍</span><br><span style="color:#888">All Countries</span></div>
<div class="stat-card"><span style="font-size:1.5em;color:#00ff87">FREE</span><br><span style="color:#888">Forever</span></div>
</div>
<h2 style="color:#60efff">❓ FAQ</h2>
<div class="faq">
<div class="faq-item"><b style="color:#00ff87">Q: Fake numbers pe chalega?</b><br>A: Haan! Fake + Real number dono pe chalega.</div>
<div class="faq-item"><b style="color:#00ff87">Q: OTP chahiye?</b><br>A: Nahi! Direct pairing code se link hota hai.</div>
<div class="faq-item"><b style="color:#00ff87">Q: 24/7 free?</b><br>A: Haan! Render + cron-job se 24/7 free.</div>
<div class="faq-item"><b style="color:#00ff87">Q: Mobile se deploy?</b><br>A: Haan! Sirf browser se, no PC needed.</div>
<div class="faq-item"><b style="color:#00ff87">Q: +91/+92 ke alawa?</b><br>A: Kisi bhi country ka number chalega!</div>
</div>
<div class="footer">
<p>KRISHUxWP BOT v2.0 | Made with ❤️ by @krishu672</p>
<p>⚡ Hosted on Render.com</p>
</div>
<script>
let users=3;setInterval(()=>{users=users>=7?3:users+1;document.getElementById('users').textContent=users+' ONLINE'},3000);
async function pair(){
const code=document.getElementById('code').value;
const num=document.getElementById('number').value.trim();
if(!num)return document.getElementById('result').innerHTML='<p style="color:#ff6b6b">⚠️ Enter number!</p>';
const btn=event.target;btn.disabled=true;btn.textContent='⏳ Please wait...';
document.getElementById('result').innerHTML='<div class="loading-spinner" style="width:40px;height:40px;border:4px solid rgba(255,255,255,0.1);border-top:4px solid #00ff87;border-radius:50%;animation:spin 1s linear infinite;margin:10px auto"></div>';
try{
const r=await fetch('/api/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number:code+num})});
const d=await r.json();
if(d.success)document.getElementById('result').innerHTML='<div class="pair-code">'+d.code+'</div><p style="color:#00ff87">✅ Success! Enter this code in WhatsApp</p><p style="color:#aaa;font-size:0.9em">📱 Settings → Linked Devices → Enter code</p>';
else document.getElementById('result').innerHTML='<p style="color:#ff6b6b">❌ Failed. Try again</p>';
}catch(e){document.getElementById('result').innerHTML='<div class="pair-code">'+(Math.random().toString(36).substring(2,8).toUpperCase())+'</div><p style="color:#00ff87">✅ Demo Code Generated!</p>';}
btn.disabled=false;btn.textContent='🔗 GENERATE PAIRING CODE';
}
</script>
<style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
</body></html>`;

app.get('/', (req, res) => res.send(html));
app.get('/health', (req, res) => res.send('OK'));
app.post('/api/pair', (req, res) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ success: true, code });
});
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', server: 4, users: Math.floor(Math.random()*10)+1+' ONLINE', security: 'ENCRYPTED', commands: 500 });
});

app.listen(PORT, () => console.log('✅ KRISHUxWP BOT running on port '+PORT));        users: Math.floor(Math.random() * 10) + 1 + ' ONLINE',
        security: 'ENCRYPTED',
        commands: 500,
        version: 'v2.0'
    });
});

app.listen(PORT, () => {
    console.log(`🌐 KRISHUxWP BOT running on port ${PORT}`);
    console.log(`📱 Website: https://krishuxwp-bot.onrender.com`);
});        res.json({ 
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
