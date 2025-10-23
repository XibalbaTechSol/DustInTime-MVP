const express = require('express');
const setupDb = require('./db');
const ngeohash = require('ngeohash');
const errorHandler = require('./middleware/errorHandler');
const io = require('socket.io-client');

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());

let dbPool;

const socket = io('http://websocket-service:3008'); // Connect to the WebSocket service

async function initializeApp() {
  dbPool = await setupDb();

  app.post('/api/cleaners/:id/location', async (req, res) => {
    const { lat, lng } = req.body;
    const { id } = req.params;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const geohash = ngeohash.encode(lat, lng);

    try {
      await dbPool.query(
        'INSERT INTO cleaner_locations (cleanerId, lat, lng, geohash) VALUES ($1, $2, $3, $4) ON CONFLICT (cleanerId) DO UPDATE SET lat = $2, lng = $3, geohash = $4, updated_at = CURRENT_TIMESTAMP',
        [id, lat, lng, geohash]
      );
      
      // Emit real-time location update
      socket.emit('cleanerLocationUpdate', { cleanerId: id, lat, lng });

      res.status(200).send({ message: 'Cleaner location updated' });
    } catch (error) {
      console.error('Error updating cleaner location:', error);
      res.status(500).send({ message: 'Error updating cleaner location' });
    }
  });

  app.get('/api/cleaners/locations', async (req, res) => {
    try {
      const locationsResult = await dbPool.query('SELECT * FROM cleaner_locations');
      res.json(locationsResult.rows);
    } catch (error) {
      console.error('Error getting cleaner locations:', error);
      res.status(500).send({ message: 'Error getting cleaner locations' });
    }
  });

  app.get('/api/cleaners/locations/nearby', async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'lat, lng, and radius are required' });
    }

    const geohash = ngeohash.encode(parseFloat(lat), parseFloat(lng));
    const neighbors = ngeohash.neighbors(geohash);

    try {
      const locationsResult = await dbPool.query(
        'SELECT * FROM cleaner_locations WHERE geohash = ANY($1)',
        [[geohash, ...neighbors]]
      );
      res.json(locationsResult.rows);
    } catch (error) {
      console.error('Error getting nearby cleaner locations:', error);
      res.status(500).send({ message: 'Error getting nearby cleaner locations' });
    }
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Cleaner location service started on port ${port}`);
  });
}

initializeApp();
