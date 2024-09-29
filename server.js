const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Habilitar CORS
app.use(cors({
    origin: 'https://sapatariapf.onrender.com', // Permite apenas requisições de pipoca.com
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const io = new Server(server, {
    cors: {
        origin: "https://sapatariapf.onrender.com", // O domínio que pode se conectar via WebSocket
        methods: ["GET", "POST"]
    }
});

const users = {}; // Para armazenar os usuários

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Quando o usuário envia uma mensagem
    socket.on('message', (msg) => {
        // Se não houver nome do usuário, definir a primeira mensagem como nome de usuário
        if (!users[socket.id]) {
            users[socket.id] = msg;
            io.emit('message', `${msg} entrou no chat.`);
        } else {
            io.emit('message', `${users[socket.id]}: ${msg}`);
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('message', `${users[socket.id]} saiu do chat.`);
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});