const elasticsearchService = require('../services/elasticsearchService');
const aiMatchmakingService = require('../services/aiMatchmakingService');

exports.indexCleaner = async (req, res, next) => {
    try {
        await elasticsearchService.indexCleaner(req.body);
        res.status(200).json({ message: 'Cleaner indexed successfully' });
    } catch (err) {
        next(err);
    }
};

exports.searchCleaners = async (req, res, next) => {
    try {
        const useAIMatchmaking = process.env.AI_MATCHMAKING_ENABLED === 'true';

        if (useAIMatchmaking) {
            const results = await aiMatchmakingService.findMatches(req.query);
            res.json(results);
        } else {
            const results = await elasticsearchService.searchCleaners(req.query.q);
            res.json(results);
        }
    } catch (err) {
        next(err);
    }
};
