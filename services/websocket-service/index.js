const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.userId = decoded.id; // Attach userId to the socket
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join a room specific to the user
  socket.join(socket.userId);

  socket.on('notification', ({ userId, message }) => {
    // This event is expected to be sent from internal services (e.g., notification-service)
    // and then broadcasted to the target user.
    io.to(userId).emit('notification', message);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).send('WebSocket service is healthy');
});

app.use(errorHandler);

server.listen(3008, () => {
  console.log('WebSocket service listening on *:3008');
});