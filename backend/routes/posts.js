const router = require('express').Router();
const { run, get, all } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const POST_SELECT = `
  SELECT p.*, u.username AS author_name,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
  FROM posts p JOIN users u ON u.id = p.author_id
`;

// GET /api/posts
router.get('/', optionalAuth, async (req, res) => {
  const { tag, author, q } = req.query;
  let sql = POST_SELECT + ' WHERE 1=1';
  const params = [];
  if (tag)    { sql += ' AND p.tag = ?';                          params.push(tag); }
  if (author) { sql += ' AND u.username = ?';                     params.push(author); }
  if (q)      { sql += ' AND (p.title LIKE ? OR p.content LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY p.created_at DESC';
  const posts = await all(sql, params);
  res.json({ posts });
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const post = await get(POST_SELECT + ' WHERE p.id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

// POST /api/posts
router.post('/', authenticate, async (req, res) => {
  const { title, content, tag = '' } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: 'title and content are required' });
  const { lastID } = await run(
    'INSERT INTO posts (title, content, tag, author_id) VALUES (?, ?, ?, ?)',
    [title.trim(), content.trim(), tag.trim(), req.user.id]
  );
  const post = await get(POST_SELECT + ' WHERE p.id = ?', [lastID]);
  res.status(201).json({ post });
});

// PUT /api/posts/:id
router.put('/:id', authenticate, async (req, res) => {
  const existing = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  if (existing.author_id !== req.user.id) return res.status(403).json({ error: 'Not your post' });
  const { title, content, tag } = req.body;
  await run(
    `UPDATE posts SET
       title   = COALESCE(?, title),
       content = COALESCE(?, content),
       tag     = COALESCE(?, tag),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title ?? null, content ?? null, tag ?? null, req.params.id]
  );
  const post = await get(POST_SELECT + ' WHERE p.id = ?', [req.params.id]);
  res.json({ post });
});

// DELETE /api/posts/:id
router.delete('/:id', authenticate, async (req, res) => {
  const existing = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  if (existing.author_id !== req.user.id) return res.status(403).json({ error: 'Not your post' });
  await run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.json({ message: 'Post deleted' });
});

module.exports = router;
