const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'booking-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
});

const producer = kafka.producer();
let isConnected = false;

const connect = async () => {
  try {
    await producer.connect();
    isConnected = true;
    console.log('Kafka producer connected');
  } catch (err) {
    console.error('Failed to connect Kafka producer', err);
    isConnected = false;
  }
};

const disconnect = async () => {
    try {
      await producer.disconnect();
      isConnected = false;
      console.log('Kafka producer disconnected');
    } catch (err) {
      console.error('Failed to disconnect Kafka producer', err);
    }
  };

const sendBookingRequest = async (booking) => {
    if (!isConnected) {
        console.error('Kafka producer is not connected. Cannot send message.');
        // Optionally, you could throw an error or implement a retry mechanism.
        return;
    }
  try {
    await producer.send({
      topic: 'booking-requests',
      messages: [{ value: JSON.stringify(booking) }],
    });
    console.log('Booking request sent to Kafka:', booking.id);
  } catch (err) {
    console.error('Error sending booking request to Kafka:', err);
  }
};

module.exports = {
  connect,
  disconnect,
  sendBookingRequest,
};
