const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const io = require('socket.io-client');

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

const socket = io('http://websocket-service:3008'); // Connect to the WebSocket service

app.post('/api/notify', (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  console.log(`Sending notification to user ${userId}: ${message}`);
  
  // Emit a WebSocket event
  socket.emit('notification', { userId, message });

  res.status(200).send({ message: 'Notification sent' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Notification service started on port ${port}`);
});