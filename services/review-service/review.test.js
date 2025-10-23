const request = require('supertest');
const express = require('express');
const app = express();

// Mock the db module
jest.mock('./db', () => () => Promise.resolve({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

// Mock the middleware
jest.mock('./middleware/errorHandler', () => (err, req, res, next) => {
  res.status(500).send('Something broke!');
});

app.use(express.json());

// Require the routes from index.js and pass the app
require('./index');

describe('Review Service API', () => {
  it('should create a new review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        cleanerId: 'cleaner1',
        clientId: 'client1',
        bookingId: 'booking1',
        rating: 5,
        comment: 'Great service!',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get reviews for a cleaner', async () => {
    const res = await request(app).get('/api/reviews/cleaner/cleaner1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
