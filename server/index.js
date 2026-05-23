require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const analyzeRouter = require('./routes/analyze');
const historyRouter = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// In dev, allow the Vite dev server origin; in prod, same-origin only
if (!IS_PROD) {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React build in production
if (IS_PROD) {
  const clientBuild = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    // SPA fallback — all non-API routes serve index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Resumai server running on http://localhost:${PORT} [${IS_PROD ? 'production' : 'development'}]`);
});
