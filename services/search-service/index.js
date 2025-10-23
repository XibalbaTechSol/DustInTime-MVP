const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const esClient = new Client({ node: 'http://elasticsearch:9200' });

app.use(express.json());

async function createIndex() {
  try {
    const index = 'cleaners';
    const indexExists = await esClient.indices.exists({ index });

    if (!indexExists.body) {
      await esClient.indices.create({ index });
      console.log(`Created index ${index}`);
    }
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

app.post('/api/search/index-cleaner', async (req, res) => {
  try {
    const { id, ...cleanerData } = req.body;
    await esClient.index({
      index: 'cleaners',
      id,
      body: cleanerData,
    });
    res.status(200).send({ message: 'Cleaner indexed successfully' });
  } catch (error) {
    console.error('Error indexing cleaner:', error);
    res.status(500).send({ message: 'Error indexing cleaner' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const { body } = await esClient.search({
      index: 'cleaners',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['name', 'services', 'bio'],
          },
        },
      },
    });
    res.json(body.hits.hits.map(hit => ({ id: hit._id, ...hit._source })));
  } catch (error) {
    console.error('Error searching for cleaners:', error);
    res.status(500).send({ message: 'Error searching for cleaners' });
  }
});

app.use(errorHandler);

app.listen(3001, () => {
  console.log('Search service started on port 3001');
  createIndex();
});
