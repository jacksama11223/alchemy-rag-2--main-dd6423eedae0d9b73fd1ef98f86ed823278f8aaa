
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const { PeerServer } = require('peer');
const { initSRNotificationJob } = require('./utils/srNotificationJob');
const { startImapListener } = require('./utils/imapListener');

// Load env vars
dotenv.config();
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

// Connect Database
connectDB().then(() => {
    // Initialize Spaced Repetition Notification Job
    initSRNotificationJob();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Setup PeerServer for WebRTC (Running on port 9000 to avoid conflict)
const peerServer = PeerServer({ port: 9000, path: '/myapp' });

// Inject io into req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Store users in voice channels: { socketId: { userId, peerId, roomId } }
const voiceUsers = {};

// Track online users for admin
const onlineUsers = new Map();

// Socket Connection Logic
io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // User explicitly joins their own room (User ID) for DMs
  socket.on('join_user', (userId) => {
    if (userId) {
        socket.join(userId);
    }
  });

  socket.on('join_admin', () => {
      socket.join('admin_room');
      // Send current online users to the newly joined admin
      const usersArray = Array.from(onlineUsers.values()).map(u => {
          const { sockets, ...rest } = u;
          return rest;
      });
      socket.emit('online_users_update', usersArray);
  });

  socket.on('user_online', (user) => {
      if (user && user.id) {
          if (!onlineUsers.has(user.id)) {
              onlineUsers.set(user.id, { ...user, sockets: new Set([socket.id]), lastActive: Date.now() });
          } else {
              const existing = onlineUsers.get(user.id);
              existing.sockets.add(socket.id);
              existing.lastActive = Date.now();
              existing.name = user.name;
              existing.role = user.role;
          }
          
          const usersArray = Array.from(onlineUsers.values()).map(u => {
              const { sockets, ...rest } = u;
              return rest;
          });
          io.to('admin_room').emit('online_users_update', usersArray);
      }
  });

  // User joins a specific public channel (text)
  socket.on('join_channel', (channelId) => {
      if (channelId) {
          socket.join(channelId);
          console.log(`📢 Socket ${socket.id} joined TEXT channel: ${channelId}`);
      }
  });

  // --- VOICE/VIDEO LOGIC ---
  socket.on('join-voice', (roomId, userId, peerId) => {
      socket.join(roomId);
      voiceUsers[socket.id] = { userId, peerId, roomId };
      
      // Notify others in room that a user connected (sending their PeerID)
      socket.to(roomId).emit('user-connected-voice', userId, peerId);
      
      console.log(`🎙️ User ${userId} (Peer: ${peerId}) joined VOICE ${roomId}`);
  });

  socket.on('leave-voice', (roomId, userId) => {
      socket.leave(roomId);
      if (voiceUsers[socket.id]) delete voiceUsers[socket.id];
      socket.to(roomId).emit('user-disconnected-voice', userId);
  });

  // User leaves a channel
  socket.on('leave_channel', (channelId) => {
      if (channelId) {
          socket.leave(channelId);
      }
  });

  // Sync data
  socket.on('sync-data', (data) => {
      // Broadcast to all other connected clients
      socket.broadcast.emit('data-updated', data);
  });

  socket.on('disconnect', () => {
    // Cleanup voice user if they disconnect abruptly
    if (voiceUsers[socket.id]) {
        const { roomId, userId } = voiceUsers[socket.id];
        socket.to(roomId).emit('user-disconnected-voice', userId);
        delete voiceUsers[socket.id];
    }
    
    let updated = false;
    for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.sockets.has(socket.id)) {
            userData.sockets.delete(socket.id);
            if (userData.sockets.size === 0) {
                onlineUsers.delete(userId);
            }
            updated = true;
            break;
        }
    }
    
    if (updated) {
        const usersArray = Array.from(onlineUsers.values()).map(u => {
            const { sockets, ...rest } = u;
            return rest;
        });
        io.to('admin_room').emit('online_users_update', usersArray);
    }
  });
});

// Middleware to track API requests for admin
app.use((req, res, next) => {
    res.on('finish', () => {
        if (req.user) {
            io.to('admin_room').emit('api_request_log', {
                userId: req.user._id,
                userName: req.user.name,
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                timestamp: new Date()
            });
        }
    });
    next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/user/settings', require('./routes/userSettingsRoutes'));
app.use('/api/nodes', require('./routes/nodeRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/drawings', require('./routes/drawingRoutes')); 
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/clusters', require('./routes/clusterRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/flashcardsets', require('./routes/flashcardSetRoutes'));
app.use('/api/savedurls', require('./routes/savedUrlRoutes'));
app.use('/api/savedyoutubevideos', require('./routes/savedYoutubeVideoRoutes'));
app.use('/api/savedrecordings', require('./routes/savedRecordingRoutes'));
app.use('/api/pasted-texts', require('./routes/pastedTextRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/alchemy', require('./routes/alchemyRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/learning-paths', require('./routes/learningPathRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));
app.use('/api/global-knowledge', require('./routes/globalKnowledgeRoutes'));
app.use('/api/user-memory', require('./routes/userMemoryRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/drive-authoring', require('./routes/driveAuthoringRoutes'));

// Initialize IMAP Listener
startImapListener(io);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Backend Error:', err.message);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces so mobile on same WiFi can connect

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log(`📱 Mobile devices on same WiFi can connect via: http://[YOUR_PC_IP]:${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Do not exit process, just log it
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Do not exit process, just log it
});
