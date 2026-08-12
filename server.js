const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;

// HTTP Server to serve camera.html, viewer.html, and root redirect
const server = http.createServer((req, res) => {
  let filePath = '.';
  if (req.url === '/' || req.url === '/viewer') {
    filePath = './viewer.html';
  } else if (req.url === '/camera') {
    filePath = './camera.html';
  } else {
    filePath = '.' + req.url;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// WebSocket Signaling Server
const wss = new WebSocketServer({ server });

// Track active connections
const cameras = new Map(); // socket -> { name, id }
const viewers = new Set(); // set of sockets

function broadcastToViewers(message) {
  const jsonStr = JSON.stringify(message);
  for (const viewer of viewers) {
    if (viewer.readyState === 1) { // OPEN
      viewer.send(jsonStr);
    }
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (messageRaw) => {
    let data;
    try {
      data = JSON.parse(messageRaw);
    } catch (e) {
      return;
    }

    switch (data.type) {
      // Camera Registration
      case 'register-camera':
        ws.isCamera = true;
        ws.cameraId = data.id || Math.random().toString(36).substring(2, 9);
        ws.cameraName = data.name || 'Unnamed Camera';
        cameras.set(ws, { id: ws.cameraId, name: ws.cameraName });

        // Notify all viewers a new camera is available
        broadcastToViewers({
          type: 'camera-list',
          cameras: Array.from(cameras.values())
        });
        break;

      // Viewer Registration
      case 'register-viewer':
        ws.isViewer = true;
        viewers.add(ws);

        // Send active camera list to the new viewer
        ws.send(JSON.stringify({
          type: 'camera-list',
          cameras: Array.from(cameras.values())
        }));
        break;

      // Signaling Relays (Offer, Answer, ICE Candidates, Motion Alerts)
      case 'offer':
      case 'answer':
      case 'candidate':
      case 'motion-alert':
        // Relay message to targeted client
        wss.clients.forEach((client) => {
          if (client.readyState === 1 && client !== ws) {
            if (data.targetId && (client.cameraId === data.targetId || client.viewerId === data.targetId)) {
              client.send(JSON.stringify({ ...data, senderId: ws.cameraId || ws.viewerId }));
            } else if (!data.targetId && ws.isCamera && client.isViewer) {
              // Broadcast camera motion alerts to all viewers
              client.send(JSON.stringify({ ...data, senderId: ws.cameraId }));
            }
          }
        });
        break;
    }
  });

  ws.on('close', () => {
    if (ws.isCamera) {
      cameras.delete(ws);
      broadcastToViewers({
        type: 'camera-disconnected',
        cameraId: ws.cameraId
      });
    } else if (ws.isViewer) {
      viewers.delete(ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`CCTV Signaling Server running on port ${PORT}`);
});
