const elasticsearchService = require('./elasticsearchService');

// --- Helper Functions ---

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in kilometers.
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


// --- Scoring Logic ---

const calculateMatchScore = (cleaner, clientNeeds) => {
    let score = 0;
    const weights = {
        distance: 0.4,
        services: 0.3,
        rating: 0.3,
    };

    // 1. Distance Score (lower is better)
    if (clientNeeds.lat && clientNeeds.lng && cleaner.location) {
        const distance = haversineDistance(clientNeeds.lat, clientNeeds.lng, cleaner.location.lat, cleaner.location.lng);
        // Normalize distance score: 1 for 0km, decaying to 0 for 50km+
        score += weights.distance * Math.max(0, 1 - (distance / 50));
    }

    // 2. Services Score
    if (clientNeeds.services && cleaner.services) {
        const requestedServices = new Set(clientNeeds.services.split(','));
        const matchingServices = cleaner.services.filter(s => requestedServices.has(s)).length;
        const serviceMatchRatio = matchingServices / requestedServices.size;
        score += weights.services * serviceMatchRatio;
    }

    // 3. Rating Score (normalized from 1-5 to 0-1)
    if (cleaner.rating) {
        score += weights.rating * ((cleaner.rating - 1) / 4);
    }

    return score;
};


// --- Main Service Function ---

/**
 * Finds the best cleaner matches for a client using a scoring system.
 * @param {object} queryParams - The client's requirements from the search query.
 * @returns {Promise<Array<object>>} A promise that resolves to a sorted list of cleaner profiles.
 */
const findMatches = async (queryParams) => {
    console.log('AI Matchmaking activated with params:', queryParams);

    // 1. Fetch all cleaners from Elasticsearch as the data source
    const allCleaners = await elasticsearchService.searchCleaners('*'); // Use a wildcard to get all

    // 2. Score each cleaner based on the client's needs
    const scoredCleaners = allCleaners.map(cleaner => ({
        ...cleaner,
        matchScore: calculateMatchScore(cleaner, queryParams),
    }));

    // 3. Sort cleaners by their match score in descending order
    scoredCleaners.sort((a, b) => b.matchScore - a.matchScore);

    return scoredCleaners;
};

module.exports = {
    findMatches,
};
