// // server.js
// const WebSocket = require('ws');
// const server = new WebSocket.Server({ port: 8080 });

// // Store room and client information
// const rooms = new Map(); // roomId -> { clients: [], videoStates: Map }

// function broadcastToRoom(roomId, message, excludeClient = null) {
//   if (rooms.has(roomId)) {
//     const room = rooms.get(roomId);
//     room.clients.forEach(client => {
//       if (client !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
//         client.ws.send(JSON.stringify(message));
//       }
//     });
//   }
// }

// function updateRoomStatus(roomId) {
//   const room = rooms.get(roomId);
//   if (room) {
//     const roomStatus = {
//       type: 'roomStatus',
//       clients: room.clients.map(client => ({
//         id: client.id,
//         username: client.username,
//         hasFile: client.hasFile,
//         fileName: client.fileName
//       })),
//       totalMembers: room.clients.length
//     };
//     broadcastToRoom(roomId, roomStatus);
//   }
// }

// server.on('connection', (ws) => {
//   console.log('New client connected');
//   let clientInfo = {
//     roomId: null,
//     id: Math.random().toString(36).substr(2, 9),
//     ws: ws,
//     hasFile: false,
//     fileName: null,
//     username: null
//   };

//   ws.on('message', (message) => {
//     const data = JSON.parse(message);
//     console.log('Received message:', data.type);

//     switch (data.type) {
//       case 'joinRoom':
//         const roomId = data.roomId;
//         const username = data.username;
//         clientInfo.roomId = roomId;
//         clientInfo.username = username;

//         if (!rooms.has(roomId)) {
//           rooms.set(roomId, {
//             clients: [],
//             videoStates: new Map()
//           });
//         }

//         rooms.get(roomId).clients.push(clientInfo);
//         updateRoomStatus(roomId);

//         // Send current video state to new client
//         const room = rooms.get(roomId);
//         if (room.videoStates.size > 0) {
//           const currentState = Array.from(room.videoStates.values())[0];
//           ws.send(JSON.stringify({
//             type: 'syncState',
//             ...currentState
//           }));
//         }
//         break;

//       case 'fileSelected':
//         if (clientInfo.roomId) {
//           clientInfo.hasFile = true;
//           clientInfo.fileName = data.fileName;
//           updateRoomStatus(clientInfo.roomId);
//         }
//         break;

//       case 'play':
//       case 'pause':
//       case 'seek':
//       case 'timeUpdate':
//         if (clientInfo.roomId) {
//           const room = rooms.get(clientInfo.roomId);
//           room.videoStates.set(clientInfo.id, {
//             isPlaying: data.isPlaying,
//             currentTime: data.currentTime,
//             duration: data.duration
//           });
//           broadcastToRoom(clientInfo.roomId, data, ws);
//         }
//         break;
//     }
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//     if (clientInfo.roomId && rooms.has(clientInfo.roomId)) {
//       const room = rooms.get(clientInfo.roomId);
//       room.clients = room.clients.filter(client => client.id !== clientInfo.id);
//       room.videoStates.delete(clientInfo.id);
      
//       if (room.clients.length === 0) {
//         rooms.delete(clientInfo.roomId);
//       } else {
//         updateRoomStatus(clientInfo.roomId);
//       }
//     }
//   });
// });

// console.log('WebSocket server running on port 8080');

// server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Video Sync Server is running');
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store room and client information
const rooms = new Map();

function broadcastToRoom(roomId, message, excludeClient = null) {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.clients.forEach(client => {
      if (client !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }
}

function updateRoomStatus(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    const roomStatus = {
      type: 'roomStatus',
      clients: room.clients.map(client => ({
        id: client.id,
        username: client.username,
        hasFile: client.hasFile,
        fileName: client.fileName
      })),
      totalMembers: room.clients.length
    };
    broadcastToRoom(roomId, roomStatus);
  }
}

wss.on('connection', (ws) => {
  console.log('New client connected');
  let clientInfo = {
    roomId: null,
    id: Math.random().toString(36).substr(2, 9),
    ws: ws,
    hasFile: false,
    fileName: null,
    username: null
  };

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type);

      switch (data.type) {
        case 'joinRoom':
          const roomId = data.roomId;
          const username = data.username;
          clientInfo.roomId = roomId;
          clientInfo.username = username;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, {
              clients: [],
              videoStates: new Map()
            });
          }

          rooms.get(roomId).clients.push(clientInfo);
          updateRoomStatus(roomId);

          // Send current video state to new client
          const room = rooms.get(roomId);
          if (room.videoStates.size > 0) {
            const currentState = Array.from(room.videoStates.values())[0];
            ws.send(JSON.stringify({
              type: 'syncState',
              ...currentState
            }));
          }
          break;

        case 'fileSelected':
          if (clientInfo.roomId) {
            clientInfo.hasFile = true;
            clientInfo.fileName = data.fileName;
            updateRoomStatus(clientInfo.roomId);
          }
          break;

        case 'play':
        case 'pause':
        case 'seek':
        case 'timeUpdate':
          if (clientInfo.roomId) {
            const room = rooms.get(clientInfo.roomId);
            room.videoStates.set(clientInfo.id, {
              isPlaying: data.isPlaying,
              currentTime: data.currentTime,
              duration: data.duration
            });
            broadcastToRoom(clientInfo.roomId, data, ws);
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (clientInfo.roomId && rooms.has(clientInfo.roomId)) {
      const room = rooms.get(clientInfo.roomId);
      room.clients = room.clients.filter(client => client.id !== clientInfo.id);
      room.videoStates.delete(clientInfo.id);
      
      if (room.clients.length === 0) {
        rooms.delete(clientInfo.roomId);
      } else {
        updateRoomStatus(clientInfo.roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});