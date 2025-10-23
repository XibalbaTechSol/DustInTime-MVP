const express = require('express');
const cors = require('cors');
const setupDb = require('./db');

const app = express();
const port = 3011;

app.use(cors());
app.use(express.json());

let pool;

setupDb().then(p => pool = p).catch(err => console.error(err));

app.get('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT cleaner_id FROM favorites WHERE user_id = $1', [userId]);
    res.json(result.rows.map(row => row.cleaner_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/favorites', async (req, res) => {
  const { userId, cleanerId } = req.body;
  try {
    await pool.query('INSERT INTO favorites (user_id, cleaner_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, cleanerId]);
    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/favorites/:userId/:cleanerId', async (req, res) => {
  const { userId, cleanerId } = req.params;
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND cleaner_id = $2', [userId, cleanerId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Favorites service listening at http://localhost:${port}`);
});
