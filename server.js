const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let players = [];

io.on('connection', (socket) => {
    if (players.length < 2) {
        players.push(socket.id);
    }

    socket.emit('assign-roles', {
        role: players[0] === socket.id ? 'creator' : 'joiner',
        id: socket.id
    });

    socket.on('chat-message', (data) => io.emit('chat-message', data));
    socket.on('start-drawing', (data) => socket.broadcast.emit('start-drawing', data));
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('clear-canvas', () => io.emit('clear-canvas'));
    
    // 🎮 Synced Game Move Nodes
    socket.on('game-move', (data) => socket.broadcast.emit('game-move', data));
    socket.on('game-reset', () => io.emit('game-reset'));
    socket.on('c4-move', (data) => socket.broadcast.emit('c4-move', data));
    socket.on('c4-reset', () => io.emit('c4-reset'));

    // 📺 Media Channels (YouTube & TikTok)
    socket.on('cinema-control', (data) => {
        socket.broadcast.emit('cinema-control', data);
    });

    socket.on('disconnect', () => {
        players = players.filter(id => id !== socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🍇 ANIDEA Engine live on http://localhost:${PORT}`);
});