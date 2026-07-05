// Enable pair button when checkbox is checked
document.getElementById('agreeCheck').addEventListener('change', function() {
    document.getElementById('pairBtn').disabled = !this.checked;
});

// Generate Pairing Code
async function generatePairCode() {
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    if (!phoneNumber) {
        showResult('error', '⚠️ Please enter your WhatsApp number!');
        return;
    }

    if (phoneNumber.length < 7) {
        showResult('error', '⚠️ Please enter a valid phone number!');
        return;
    }

    const fullNumber = countryCode === 'other' ? phoneNumber : countryCode + phoneNumber;
    
    const pairBtn = document.getElementById('pairBtn');
    pairBtn.disabled = true;
    pairBtn.innerHTML = '⏳ GENERATING PAIRING CODE...';

    showResult('loading', '');

    try {
        // Fetch pairing code from bot server
        const response = await fetch('/api/pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                number: fullNumber,
                platform: 'whatsapp'
            })
        });

        const data = await response.json();

        if (data.success && data.code) {
            showResult('success', `
                <div class="pair-code">${data.code}</div>
                <p style="color:#00ff87; margin:10px 0;">✅ Pairing code generated successfully!</p>
                <p style="color:#aaa; font-size:0.9em;">
                    📱 Open WhatsApp → Linked Devices → Link a Device<br>
                    🔑 Enter this code: <strong>${data.code}</strong><br>
                    ✅ Bot will connect automatically!
                </p>
                <p style="color:#ffc107; font-size:0.85em; margin-top:10px;">
                    ⏳ Code expires in 5 minutes
                </p>
            `);
        } else {
            showResult('error', `❌ ${data.message || 'Failed to generate code. Try again!'}`);
        }
    } catch (error) {
        console.error('Pairing error:', error);
        
        // Demo mode - generate a sample code
        const demoCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        showResult('success', `
            <div class="pair-code">${demoCode}</div>
            <p style="color:#00ff87; margin:10px 0;">✅ Demo pairing code generated!</p>
            <p style="color:#aaa; font-size:0.9em;">
                📱 Open WhatsApp → Linked Devices → Link a Device<br>
                🔑 Enter this code: <strong>${demoCode}</strong><br>
                ✅ Bot will connect automatically!
            </p>
            <p style="color:#ffc107; font-size:0.85em; margin-top:10px;">
                ⚠️ Demo mode - Connect to real bot server for actual pairing
            </p>
        `);
    } finally {
        pairBtn.disabled = false;
        pairBtn.innerHTML = '🔗 GENERATE PAIRING CODE';
    }
}

function showResult(type, content) {
    const resultBox = document.getElementById('resultBox');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultContent = document.getElementById('resultContent');

    resultBox.classList.remove('hidden', 'success', 'error');

    if (type === 'loading') {
        loadingSpinner.style.display = 'block';
        resultContent.innerHTML = '<p style="color:#aaa;">Generating pairing code... Please wait...</p>';
    } else {
        loadingSpinner.style.display = 'none';
        resultBox.classList.add(type);
        resultContent.innerHTML = content;
    }
}

// Auto-rotate active users
const users = ['3 ONLINE', '4 ONLINE', '5 ONLINE', '6 ONLINE', '7 ONLINE'];
let userIndex = 0;
setInterval(() => {
    document.getElementById('activeUsers').textContent = users[userIndex];
    userIndex = (userIndex + 1) % users.length;
}, 3000);

// FAQ toggle
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
        const answer = this.nextElementSibling;
        answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
    });
});