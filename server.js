const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/fetch', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const html = await response.text();
    const csp = response.headers.get('content-security-policy') || '';
    res.json({ html, csp });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch target site' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
