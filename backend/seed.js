require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDb, run, get } = require('./db');

async function seed() {
  await initDb();
  console.log('🌱 Seeding database…');

  await run('DELETE FROM comments');
  await run('DELETE FROM posts');
  await run('DELETE FROM users');

  const hash = await bcrypt.hash('password123', 10);

  const { lastID: u1 } = await run(
    'INSERT INTO users (username, email, password, bio) VALUES (?,?,?,?)',
    ['editor', 'editor@inkwell.com', hash, 'Editor-in-chief at Inkwell.']
  );
  const { lastID: u2 } = await run(
    'INSERT INTO users (username, email, password, bio) VALUES (?,?,?,?)',
    ['reader', 'reader@inkwell.com', hash, 'Avid reader and occasional writer.']
  );

  const { lastID: p1 } = await run(
    'INSERT INTO posts (title, content, tag, author_id) VALUES (?,?,?,?)',
    ['The Quiet Revolution of Analog Note-Taking',
     'There is something deeply satisfying about the scratch of a pen on paper. In an age of frictionless digital capture, the deliberate slowness of handwriting forces a kind of synthesis that typing never demands.\n\nCognitive science confirms what writers have long suspected: the act of forming letters by hand engages different neural pathways than typing.\n\nThe Bullet Journal method, Field Notes notebooks, even the humble legal pad — these are tools that put the author in command of attention.',
     'Culture', u1]
  );
  const { lastID: p2 } = await run(
    'INSERT INTO posts (title, content, tag, author_id) VALUES (?,?,?,?)',
    ['On the Aesthetics of Constraint',
     "The Japanese concept of wabi-sabi finds beauty in imperfection and impermanence. Constraint is not the enemy of beauty — it is often its source.\n\nThe sonnet's fourteen lines do not limit Shakespeare; they focus him. The haiku's seventeen syllables do not diminish Bashō; they discipline him.\n\nThis principle extends beyond art. The startup with limited runway often ships a better product than the corporation with unlimited resources.",
     'Philosophy', u1]
  );
  const { lastID: p3 } = await run(
    'INSERT INTO posts (title, content, tag, author_id) VALUES (?,?,?,?)',
    ['Why I Read the Same Books Every Year',
     "Some books are not meant to be read once. They are meant to be lived with — returned to at different ages, in different moods, with different losses behind you.\n\nThe annotations in the margins are a diary of past selves. The passages that once moved you to tears and now seem obvious tell you everything about how you have changed.\n\nMy annual list: Meditations, a few Chekhov stories, something by Woolf.",
     'Literature', u2]
  );

  await run('INSERT INTO comments (body, post_id, author_id) VALUES (?,?,?)',
    ['This resonates deeply. I switched back to paper notes last year and my recall improved noticeably.', p1, u2]);
  await run('INSERT INTO comments (body, post_id, author_id) VALUES (?,?,?)',
    ['The synthesis argument is key. Digital note-taking became a graveyard for ideas I never returned to.', p1, u1]);
  await run('INSERT INTO comments (body, post_id, author_id) VALUES (?,?,?)',
    ['Sonnet structure as creative constraint — Oulipo would agree wholeheartedly.', p2, u2]);
  await run('INSERT INTO comments (body, post_id, author_id) VALUES (?,?,?)',
    ['Meditations reads completely differently after any major life event.', p3, u1]);

  console.log('✅ Seeded: 2 users, 3 posts, 4 comments');
  console.log('   editor@inkwell.com / password123');
  console.log('   reader@inkwell.com / password123');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
