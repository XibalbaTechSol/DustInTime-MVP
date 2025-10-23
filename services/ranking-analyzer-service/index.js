const express = require('express');
const setupDb = require('./db');
const errorHandler = require('./middleware/errorHandler');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3006;

app.use(express.json());

let dbPool;

async function initializeApp() {
  dbPool = await setupDb();

  app.post('/api/rankings/log-job', async (req, res) => {
    const { jobId, cleanerId, status } = req.body;

    if (!jobId || !cleanerId || !status) {
      return res.status(400).json({ error: 'jobId, cleanerId, and status are required' });
    }

    try {
      await dbPool.query(
        'INSERT INTO job_history (jobId, cleanerId, status, completed_at) VALUES ($1, $2, $3, $4) ON CONFLICT (jobId) DO UPDATE SET status = $3, completed_at = $4',
        [jobId, cleanerId, status, status === 'completed' ? new Date() : null]
      );
      res.status(200).send({ message: 'Job history logged' });
    } catch (error) {
      console.error('Error logging job history:', error);
      res.status(500).send({ message: 'Error logging job history' });
    }
  });

  app.get('/api/rankings', async (req, res) => {
    try {
      const cleanersResult = await dbPool.query('SELECT * FROM cleaners');
      let cleaners = cleanersResult.rows;

      // Fetch reviews for each cleaner and calculate average rating
      for (let i = 0; i < cleaners.length; i++) {
        try {
          const reviewsResponse = await axios.get(`http://review-service:3007/api/reviews/cleaner/${cleaners[i].id}`);
          const reviews = reviewsResponse.data;
          const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : cleaners[i].rating; // Fallback to existing rating if no reviews
          cleaners[i].averageRating = averageRating;
          cleaners[i].reviewCount = reviews.length;
        } catch (error) {
          console.error(`Error fetching reviews for cleaner ${cleaners[i].id}:`, error.message);
          cleaners[i].averageRating = cleaners[i].rating; // Fallback
          cleaners[i].reviewCount = 0;
        }
      }

      // Incorporate job completion rate (from job_history) and average rating into ranking
      const rankingsResult = await dbPool.query(`
        SELECT c.id, c.name, c.picture, c.hourlyRate, c.services, c.location_lat, c.location_lng, 
               COUNT(CASE WHEN j.status = 'completed' THEN 1 ELSE NULL END) as completed_jobs,
               COUNT(j.jobId) as total_jobs
        FROM cleaners c
        LEFT JOIN job_history j ON c.id = j.cleanerId
        GROUP BY c.id, c.name, c.picture, c.hourlyRate, c.services, c.location_lat, c.location_lng
      `);

      const rankedCleaners = rankingsResult.rows.map(rankedCleaner => {
        const originalCleaner = cleaners.find(c => c.id === rankedCleaner.id);
        const completionRate = rankedCleaner.total_jobs > 0 ? (rankedCleaner.completed_jobs / rankedCleaner.total_jobs) : 0;
        
        // Simple ranking formula: (averageRating * 0.6) + (completionRate * 0.4)
        const finalScore = (originalCleaner.averageRating * 0.6) + (completionRate * 0.4 * 5); // Scale completion rate to match rating scale

        return {
          ...originalCleaner,
          ...rankedCleaner,
          finalScore,
        };
      }).sort((a, b) => b.finalScore - a.finalScore);

      res.json(rankedCleaners);
    } catch (error) {
      console.error('Error getting cleaner rankings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Ranking analyzer service started on port ${port}`);
  });
}

initializeApp();
