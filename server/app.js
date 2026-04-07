const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

const dashboardRouter = require('./routes/dashboard.js');
const recommendCropsRouter = require('./routes/recommend-crop.js');

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API: Serve crops list
app.get('/api/crops', (req, res) => {
  const crops = JSON.parse(fs.readFileSync('./json_files/crops.json', 'utf-8'));
  res.json(crops);
});

// API routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/recommend-crop', recommendCropsRouter);

// Create one HTTP server for Express + WebSocket
const server = http.createServer(app);

// Attach WebSocket server
const wss = new WebSocket.Server({ server });
app.set("wss", wss);

wss.on("connection", (ws, req) => {
  console.log("ESP32 Connected:", req.socket.remoteAddress);
  ws.send("Welcome ESP32!");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("ESP32 disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
