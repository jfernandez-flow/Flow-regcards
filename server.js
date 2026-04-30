<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flow — Registration Card</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f0; min-height: 100vh; }
  .header { background: #1a1a1a; color: white; padding: 18px 30px; }
  .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 4px; text-transform: lowercase; }
  .header p { font-size: 12px; color: #aaa; margin-top: 2px; }
  .container { max-width: 860px; margin: 30px auto; padding: 0 20px 60px; }
  .card { background: white; border-radius: 12px; padding: 36px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); margin-bottom: 20px; }
  h2 { font-weight: 400; font-size: 22px; margin-bottom: 8px; }
  .sub { color: #666; font-size: 14px; margin-bottom: 24px; }
  .auth-step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
  .step-num { background: #1a1a1a; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 1px; }
  .step-text { font-size: 14px; color: #444; line-height: 1.6; }
  .step-text a { color: #1a73e8; }
  code { font-size: 12px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
  .token-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; margin-top: 8px; font-family: monospace; }
  .btn { background: #1a1a1a; color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; cursor: pointer; margin-top: 12px; }
  .btn:hover { background: #333; }
  .btn:disabled { background: #999; cursor: not-allowed; }
  .btn-outline { background: white; color: #1a1a1a; border: 1px solid #ddd; padding: 10px 20px; border-radius: 8px; font-size: 13px; cursor: pointer; }
  .btn-outline:hover { background: #f5f5f5; }
  .error { color: #c62828; font-size: 13px; margin-top: 12px; }
  .list-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .guest-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; }
  .guest-card:hover { border-color: #1a1a1a; background: #fafafa; }
  .guest-name { font-weight: 600; font-size: 16px; }
  .guest-meta { font-size: 12px; color: #888; margin-top: 3px; }
  .badge { background: #e8f5e9; color: #2e7d32; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
  .loading { text-align: center; padding: 40px; color: #888; }
  .err-box { background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 8px; padding: 16px; color: #c62828; font-size: 13px; }
  .back-btn { background: none; border: none; cursor: pointer; color: #666; font-size: 13px; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 6px; }
  .back-btn:hover { color: #000; }
  .reg-logo { font-size: 32px; font-weight: 300; letter-spacing: 6px; text-align: center; margin-bottom: 28px; color: #1a1a1a; text-transform: lowercase; border-bottom: 1px solid #eee; padding-bottom: 24px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; display: block; margin-bottom: 4px; }
  .field .value { font-size: 14px; font-weight: 600; color: #1a1a1a; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; min-height: 26px; }
  .policies { background: #f9f9f9; border-radius: 8px; padding: 18px 20px; margin: 24px 0; }
  .policies h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 12px; }
  .policies ul { list-style: none; }
  .policies ul li { font-size: 13px; color: #444; padding: 6px 0; border-bottom: 1px solid #eee; display: flex; gap: 10px; }
  .policies ul li:last-child { border-bottom: none; }
  .policies ul li::before { content: "•"; color: #999; }
  .sig-section { margin-top: 24px; }
  .sig-section h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 10px; }
  #sig-canvas { border: 1px solid #ddd; border-radius: 8px; width: 100%; height: 180px; touch-action: none; cursor: crosshair; background: white; display: block; }
  .sig-actions { display: flex; gap: 10px; margin-top: 10px; }
  .btn-sign { background: #1a1a1a; color: white; border: none; padding: 14px 30px; border-radius: 8px; font-size: 15px; cursor: pointer; flex: 1; }
  .btn-sign:hover { background: #333; }
  .btn-sign:disabled { background: #ccc; cursor: not-allowed; }
  .success-wrap { text-align: center; padding: 20px 0; }
  .success-icon { font-size: 52px; margin-bottom: 16px; }
  .success-wrap h2 { font-weight: 400; font-size: 24px; margin-bottom: 8px; }
  .success-wrap p { color: #666; margin-bottom: 10px; }
  .email-status { display: flex; flex-direction: column; gap: 8px; margin: 20px auto; max-width: 400px; }
  .email-badge { display: flex; align-items: center; gap: 10px; background: #f9f9f9; border-radius: 8px; padding: 10px 16px; font-size: 13px; }
  .success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
  .btn-dl { background: #1a1a1a; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .btn-next { background: white; color: #1a1a1a; border: 1px solid #ddd; padding: 14px 28px; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .btn-next:hover { background: #f5f5f5; }
  .screen { display: none; }
  .screen.active { display: block; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #ccc; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="header">
  <h1>flow</h1>
  <p>Electronic Registration Card System</p>
</div>
<div class="container">

  <!-- AUTH -->
  <div id="auth-screen" class="screen active">
    <div class="card">
      <h2>Connect to Cloudbeds</h2>
      <p class="sub">Do this once each morning when you start your shift.</p>
      <div class="auth-step">
        <div class="step-num">1</div>
        <div class="step-text">
          <a href="#" id="auth-link">Click here to authorize Cloudbeds →</a><br>
          Log in if prompted, then click <strong>Authorize</strong>.<br>
          You'll be brought back here automatically with today's arrivals loaded.
        </div>
      </div>
    </div>
  </div>

  <!-- GUEST LIST -->
  <div id="list-screen" class="screen">
    <div class="card">
      <div class="list-header">
        <div>
          <h2>Today's Arrivals</h2>
          <p class="sub" id="arrival-date"></p>
        </div>
        <button class="btn-outline" onclick="loadGuests()">↻ Refresh</button>
      </div>
      <div id="guest-list-content" class="loading">Loading reservations...</div>
    </div>
  </div>

  <!-- REG CARD -->
  <div id="card-screen" class="screen">
    <div class="card">
      <button class="back-btn" onclick="showScreen('list-screen')">← Back to arrivals</button>
      <div class="reg-logo">flow</div>
      <div class="grid-3">
        <div class="field"><label>Guest Name</label><div class="value" id="f-name"></div></div>
        <div class="field"><label>Reservation #</label><div class="value" id="f-res"></div></div>
        <div class="field"><label>Room Number</label><div class="value" id="f-room"></div></div>
      </div>
      <div class="grid-3">
        <div class="field"><label>Check-in Date</label><div class="value" id="f-checkin"></div></div>
        <div class="field"><label>Check-out Date</label><div class="value" id="f-checkout"></div></div>
        <div class="field"><label>Room Type</label><div class="value" id="f-roomtype"></div></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Email</label><div class="value" id="f-email"></div></div>
        <div class="field"><label>Phone</label><div class="value" id="f-phone"></div></div>
      </div>
      <div class="policies">
        <h4>Property Policies</h4>
        <ul>
          <li>A hold of $200/night (max $2,000) will be placed on your card for damages and incidentals.</li>
          <li>Resort fees may be collected at the time of check-in.</li>
          <li>Smoking in the apartment will result in a $500 fine.</li>
          <li>Daily cleaning is available upon request at $150/day.</li>
          <li>Key fob must be returned at checkout — $100 penalty if not returned.</li>
        </ul>
      </div>
      <div class="sig-section">
        <h4>Guest Signature — I have read and agree to the above policies</h4>
        <canvas id="sig-canvas"></canvas>
        <div class="sig-actions">
          <button class="btn-outline" onclick="clearSig()">Clear</button>
          <button class="btn-sign" id="sign-btn" onclick="submitSig()">Confirm & Sign</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SUCCESS -->
  <div id="success-screen" class="screen">
    <div class="card">
      <div class="success-wrap">
        <div class="success-icon">✅</div>
        <h2>Registration Complete</h2>
        <p id="success-name"></p>
        <div class="email-status" id="email-status"></div>
        <div class="success-actions">
          <button class="btn-dl" onclick="downloadPDF()">⬇ Download PDF</button>
          <button class="btn-next" onclick="showScreen('list-screen')">Next Guest →</button>
        </div>
      </div>
    </div>
  </div>

</div>
<script>
let cbToken = null, currentGuest = null, currentPdfB64 = null;
let sigCanvas, sigCtx, drawing = false, hasSig = false;

// Load auth URL from server and auto-read token from URL if redirected back
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
if (urlToken) {
  cbToken = urlToken;
  window.history.replaceState({}, '', '/');
  showScreen('list-screen');
  loadGuests();
}

fetch('/auth/url').then(r => r.json()).then(d => {
  document.getElementById('auth-link').href = d.url;
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function submitToken() {
  const code = document.getElementById('token-input').value.trim();
  const errEl = document.getElementById('auth-error');
  if (!code) { errEl.textContent = 'Please paste the authorization code.'; return; }
  errEl.textContent = 'Connecting...';
  try {
    const r = await fetch('/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const d = await r.json();
    if (d.access_token) {
      cbToken = d.access_token;
      errEl.textContent = '';
      showScreen('list-screen');
      loadGuests();
    } else {
      errEl.textContent = 'Error: ' + (d.error_description || d.message || JSON.stringify(d));
    }
  } catch(e) {
    errEl.textContent = 'Connection error: ' + e.message;
  }
}

async function loadGuests() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('arrival-date').textContent = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  document.getElementById('guest-list-content').innerHTML = '<div class="loading">Loading reservations...</div>';
  try {
    const r = await fetch(`/api/reservations?token=${cbToken}`);
    const d = await r.json();
    if (!d.success) throw new Error(d.message);
    renderGuests(d.data || []);
  } catch(e) {
    document.getElementById('guest-list-content').innerHTML = `<div class="err-box">Error: ${e.message}</div>`;
  }
}

function renderGuests(list) {
  const el = document.getElementById('guest-list-content');
  if (!list.length) { el.innerHTML = '<div class="loading">No arrivals found for today.</div>'; return; }
  el.innerHTML = list.map(r => `
    <div class="guest-card" onclick='openRegCard(${JSON.stringify(r).replace(/'/g,"&#39;")})'>
      <div>
        <div class="guest-name">${r.guestName||r.guest?.name||'Guest'}</div>
        <div class="guest-meta">Room ${r.roomNumber||r.assignedRoom||'—'} &nbsp;·&nbsp; Res# ${r.reservationID} &nbsp;·&nbsp; ${r.guestEmail||r.guest?.email||'no email'}</div>
      </div>
      <span class="badge">Arriving</span>
    </div>`).join('');
}

function openRegCard(r) {
  currentGuest = r;
  document.getElementById('f-name').textContent     = r.guestName||r.guest?.name||'—';
  document.getElementById('f-res').textContent      = r.reservationID||'—';
  document.getElementById('f-room').textContent     = r.roomNumber||r.assignedRoom||'—';
  document.getElementById('f-checkin').textContent  = r.startDate||'—';
  document.getElementById('f-checkout').textContent = r.endDate||'—';
  document.getElementById('f-roomtype').textContent = r.roomTypeName||r.roomType||'—';
  document.getElementById('f-email').textContent    = r.guestEmail||r.guest?.email||'—';
  document.getElementById('f-phone').textContent    = r.guestPhone||r.guest?.phone||'—';
  showScreen('card-screen');
  initCanvas();
}

function initCanvas() {
  sigCanvas = document.getElementById('sig-canvas');
  sigCanvas.width = sigCanvas.offsetWidth;
  sigCanvas.height = 180;
  sigCtx = sigCanvas.getContext('2d');
  sigCtx.strokeStyle = '#1a1a1a'; sigCtx.lineWidth = 2.5; sigCtx.lineCap = 'round';
  hasSig = false;
  const pos = e => { const rect = sigCanvas.getBoundingClientRect(), s = e.touches?e.touches[0]:e; return {x:s.clientX-rect.left,y:s.clientY-rect.top}; };
  sigCanvas.onmousedown  = sigCanvas.ontouchstart = e => { e.preventDefault(); drawing=true; const p=pos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x,p.y); };
  sigCanvas.onmousemove  = sigCanvas.ontouchmove  = e => { e.preventDefault(); if(!drawing)return; hasSig=true; const p=pos(e); sigCtx.lineTo(p.x,p.y); sigCtx.stroke(); };
  sigCanvas.onmouseup    = sigCanvas.ontouchend   = () => drawing=false;
}

function clearSig() { sigCtx.clearRect(0,0,sigCanvas.width,sigCanvas.height); hasSig=false; }

async function submitSig() {
  if (!hasSig) { alert('Please sign before confirming.'); return; }
  const btn = document.getElementById('sign-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Processing...';
  currentPdfB64 = buildPDFBase64();
  const name = currentGuest.guestName||currentGuest.guest?.name||'Guest';
  document.getElementById('success-name').textContent = `${name} — Room ${currentGuest.roomNumber||currentGuest.assignedRoom||'—'}`;
  showScreen('success-screen');
  await sendEmails(name);
  btn.disabled = false; btn.textContent = 'Confirm & Sign';
}

function buildPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'mm',format:'a4'});
  const r = currentGuest;
  const name = r.guestName||r.guest?.name||'—';
  doc.setFillColor(26,26,26); doc.rect(0,0,210,28,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(22); doc.setFont('helvetica','normal');
  doc.text('flow',105,17,{align:'center'});
  doc.setFontSize(8); doc.text('REGISTRATION CARD',105,23,{align:'center'});
  const fields = [
    ['GUEST NAME',name,14,42],['RESERVATION #',r.reservationID||'—',78,42],['ROOM NUMBER',r.roomNumber||r.assignedRoom||'—',148,42],
    ['CHECK-IN',r.startDate||'—',14,62],['CHECK-OUT',r.endDate||'—',78,62],['ROOM TYPE',r.roomTypeName||r.roomType||'—',148,62],
    ['EMAIL',r.guestEmail||r.guest?.email||'—',14,82],['PHONE',r.guestPhone||r.guest?.phone||'—',120,82],
  ];
  fields.forEach(([label,val,x,y]) => {
    doc.setFontSize(7); doc.setTextColor(153,153,153); doc.text(label,x,y);
    doc.setFontSize(10); doc.setTextColor(26,26,26); doc.text(String(val),x,y+6,{maxWidth:55});
    doc.setDrawColor(220,220,220); doc.line(x,y+9,x+55,y+9);
  });
  doc.setFillColor(249,249,249); doc.roundedRect(10,98,190,54,2,2,'F');
  doc.setFontSize(7); doc.setTextColor(153,153,153); doc.text('PROPERTY POLICIES',14,105);
  const policies = [
    'Hold of $200/night (max $2,000) on card for damages and incidentals.',
    'Resort fees may be collected at check-in.',
    'Smoking results in a $500 fine.',
    'Daily cleaning available upon request at $150/day.',
    'Key fob must be returned — $100 penalty if not returned.',
  ];
  doc.setTextColor(80,80,80); doc.setFontSize(8.5);
  policies.forEach((p,i) => doc.text('• '+p,14,113+i*7,{maxWidth:182}));
  doc.setFontSize(8); doc.setTextColor(153,153,153); doc.text('GUEST SIGNATURE',14,162);
  doc.setFontSize(8.5); doc.setTextColor(60,60,60);
  doc.text('I have read and agree to the above property policies.',14,168);
  const sigData = sigCanvas.toDataURL('image/png');
  doc.addImage(sigData,'PNG',10,171,120,26);
  doc.setDrawColor(200,200,200); doc.line(10,197,130,197);
  doc.setFontSize(7); doc.setTextColor(153,153,153);
  doc.text(`Signed: ${new Date().toLocaleString()}`,14,201);
  return doc;
}

function buildPDFBase64() { return buildPDF().output('datauristring').split(',')[1]; }

function downloadPDF() {
  const name = (currentGuest.guestName||currentGuest.guest?.name||'Guest').replace(/ /g,'_');
  buildPDF().save(`RegCard_${name}_${currentGuest.reservationID}.pdf`);
}

async function sendEmails(guestName) {
  const statusEl = document.getElementById('email-status');
  statusEl.innerHTML = `<div class="email-badge"><span class="spinner"></span> Sending emails...</div>`;
  try {
    const r = await fetch('/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        guestEmail: currentGuest.guestEmail||currentGuest.guest?.email||'',
        reservationID: currentGuest.reservationID,
        room: currentGuest.roomNumber||currentGuest.assignedRoom||'—',
        checkIn: currentGuest.startDate||'—',
        checkOut: currentGuest.endDate||'—',
        pdfBase64: currentPdfB64
      })
    });
    const d = await r.json();
    statusEl.innerHTML = d.results.map(res =>
      `<div class="email-badge">${res.ok?'📧':'❌'} ${res.ok?'Sent to':'Failed:'} <strong>${res.to}</strong>${res.error?' — '+res.error:''}</div>`
    ).join('');
  } catch(e) {
    statusEl.innerHTML = `<div class="email-badge">❌ Email error: ${e.message}</div>`;
  }
}
</script>
</body>
</html>
