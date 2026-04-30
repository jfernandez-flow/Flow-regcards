const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const CLIENT_ID     = process.env.CB_CLIENT_ID;
const CLIENT_SECRET = process.env.CB_CLIENT_SECRET;
const PROPERTY_ID   = process.env.CB_PROPERTY_ID;
const REDIRECT_URI  = process.env.CB_REDIRECT_URI;
const GMAIL_USER    = process.env.GMAIL_USER;
const GMAIL_PASS    = process.env.GMAIL_PASS;
const HOTEL_EMAIL   = process.env.HOTEL_EMAIL;

// ── OAuth Token Exchange ──
app.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code
    });
    const r = await fetch('https://hotels.cloudbeds.com/api/v1.1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Cloudbeds API Proxy ──
app.get('/api/reservations', async (req, res) => {
  try {
    const { token } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const r = await fetch(`https://hotels.cloudbeds.com/api/v1.1/getReservations?propertyID=${PROPERTY_ID}&startDate=${today}&endDate=${today}&type=arrivals`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Send Email with PDF ──
app.post('/send-email', async (req, res) => {
  try {
    const { guestName, guestEmail, reservationID, room, checkIn, checkOut, pdfBase64 } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    const filename = `RegCard_${guestName.replace(/ /g,'_')}_${reservationID}.pdf`;
    const attachment = { filename, content: Buffer.from(pdfBase64, 'base64'), contentType: 'application/pdf' };

    const mailOptions = {
      from: `Flow Miami <${GMAIL_USER}>`,
      subject: `Flow Miami — Registration Card: ${guestName} (Res# ${reservationID})`,
      text: `Dear ${guestName},\n\nThank you for choosing Flow Miami! Please find your signed registration card attached.\n\nReservation: ${reservationID}\nRoom: ${room}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\n\nWe hope you enjoy your stay!\n\nFlow Miami\n${GMAIL_USER}`,
      attachments: [attachment]
    };

    const recipients = [HOTEL_EMAIL];
    if (guestEmail && guestEmail !== '—') recipients.push(guestEmail);

    const results = [];
    for (const to of recipients) {
      try {
        await transporter.sendMail({ ...mailOptions, to });
        results.push({ to, ok: true });
      } catch(e) {
        results.push({ to, ok: false, error: e.message });
      }
    }
    res.json({ results });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Auth URL ──
app.get('/auth/url', (req, res) => {
  const url = `https://hotels.cloudbeds.com/api/v1.1/oauth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=read:reservation`;
  res.json({ url });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flow RegCard server running on port ${PORT}`));
