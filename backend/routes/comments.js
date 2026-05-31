const router = require('express').Router({ mergeParams: true });
const { run, get, all } = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/posts/:postId/comments
router.get('/', async (req, res) => {
  const comments = await all(
    `SELECT c.*, u.username AS author_name
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [req.params.postId]
  );
  res.json({ comments });
});

// POST /api/posts/:postId/comments
router.post('/', authenticate, async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim())
    return res.status(400).json({ error: 'Comment body is required' });
  const post = await get('SELECT id FROM posts WHERE id = ?', [req.params.postId]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { lastID } = await run(
    'INSERT INTO comments (body, post_id, author_id) VALUES (?, ?, ?)',
    [body.trim(), req.params.postId, req.user.id]
  );
  const comment = await get(
    `SELECT c.*, u.username AS author_name FROM comments c
     JOIN users u ON u.id = c.author_id WHERE c.id = ?`,
    [lastID]
  );
  res.status(201).json({ comment });
});

// DELETE /api/posts/:postId/comments/:id
router.delete('/:id', authenticate, async (req, res) => {
  const comment = await get(
    'SELECT * FROM comments WHERE id = ? AND post_id = ?',
    [req.params.id, req.params.postId]
  );
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const post = await get('SELECT author_id FROM posts WHERE id = ?', [req.params.postId]);
  if (comment.author_id !== req.user.id && post.author_id !== req.user.id)
    return res.status(403).json({ error: 'Not authorized' });
  await run('DELETE FROM comments WHERE id = ?', [req.params.id]);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;
