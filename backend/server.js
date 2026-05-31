require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const { initDb } = require('./db');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });
}

app.use('/api/auth',                    require('./routes/auth'));
app.use('/api/posts',                   require('./routes/posts'));
app.use('/api/posts/:postId/comments',  require('./routes/comments'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => app.listen(PORT, () => console.log(`Inkwell API running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to init DB:', err); process.exit(1); });
