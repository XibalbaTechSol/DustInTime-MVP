const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200' });
const INDEX_NAME = 'cleaners';

const connect = async () => {
    try {
        await client.ping();
        console.log('Elasticsearch client connected');
        await createIndex();
    } catch (err) {
        console.error('Elasticsearch client connection error', err);
    }
};

const createIndex = async () => {
    try {
        const { body: indexExists } = await client.indices.exists({ index: INDEX_NAME });
        if (!indexExists) {
            await client.indices.create({ index: INDEX_NAME });
            console.log(`Created index: ${INDEX_NAME}`);
        }
    } catch (err) {
        console.error(`Error creating index ${INDEX_NAME}`, err);
    }
};

const indexCleaner = async (cleanerData) => {
    const { id, ...data } = cleanerData;
    await client.index({
        index: INDEX_NAME,
        id: id,
        body: data,
    });
};

const searchCleaners = async (query) => {
    if (!query) {
        return [];
    }
    const { body } = await client.search({
        index: INDEX_NAME,
        body: {
            query: {
                multi_match: {
                    query: query,
                    fields: ['name', 'services', 'bio', 'tagline'],
                },
            },
        },
    });
    return body.hits.hits.map(hit => ({ id: hit._id, ...hit._source }));
};

module.exports = {
    connect,
    indexCleaner,
    searchCleaners,
};
