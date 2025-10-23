const { Kafka } = require('kafkajs');
const axios = require('axios');
const redis = require('redis');
const Redlock = require('redlock');
const axiosRetry = require('axios-retry');

const kafka = new Kafka({
  clientId: 'booking-processing-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'booking-processing-group' });
const producer = kafka.producer();

axiosRetry(axios, { retries: 3 });

const redisClient = redis.createClient({ host: 'redis' });
const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200
});

const run = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'booking-requests', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const booking = JSON.parse(message.value.toString());
      console.log('Processing booking:', booking);

      try {
        // 1. Find available cleaners within a certain radius
        const locationResponse = await axios.get('http://cleaner-location-service:3004/api/cleaners/locations');
        const cleanerLocations = locationResponse.data;

        // In a real application, you would use the booking location and a geohash library to find cleaners within a certain radius.
        // For now, we'll just consider all cleaners.

        // 2. Get the full profile of the cleaners
        const cleanerIds = cleanerLocations.map(location => location.cleanerid);
        const cleanersResponse = await axios.get('http://cleaner-service:3002/api/cleaners', { params: { ids: cleanerIds } });
        const cleaners = cleanersResponse.data;

        // 3. Find an available cleaner and lock them
        for (const cleaner of cleaners) {
          const lock = await redlock.lock(`locks:cleaner:${cleaner.id}`, 60000).catch(err => console.error(err));

          if (lock) {
            console.log(`Locked cleaner: ${cleaner.name}`);

            // 4. Notify the cleaner
            await axios.post('http://notification-service:3005/api/notify', {
              userId: cleaner.id,
              message: `New booking request: ${booking.id}`,
            });

            console.log(`Notified cleaner: ${cleaner.name}`);

            // In a real application, you would wait for the cleaner to accept or reject the booking.
            // If the cleaner rejects, you would release the lock and try the next cleaner.
            // For now, we'll just assume the cleaner accepts.

            // 5. Update the booking status
            await axios.put(`http://booking-service:3003/api/bookings/${booking.id}`, { status: 'confirmed' });

            // 6. Log the job history
            await axios.post('http://ranking-analyzer-service:3006/api/rankings/log-job', {
              jobId: booking.id,
              cleanerId: cleaner.id,
              status: 'confirmed',
            });

            return; // Exit the loop once a cleaner is found and notified
          }
        }

        console.log('No available cleaners found for booking:', booking.id);
        // Handle case where no cleaner is available (e.g., put booking in a retry queue)

      } catch (error) {
        console.error('Error processing booking:', error.message);

        // Send to dead-letter queue
        await producer.send({
          topic: 'booking-requests-dlq',
          messages: [message],
        });
      }
    },
  });
};

run().catch(console.error);
