const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {connection} = require('./mysql/connection')

const app = express();
const server = http.createServer(app);

// Habilitar CORSk
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
    socket.on('connect', () => {
        console.log('Conectado ao servidor');
    });

    socket.on('connect_error', (err) => {
        console.log('Erro de conexão:', err);
    });
    // Quando o usuário envia uma mensagem
    socket.on('message', (msg) => {
        console.log('Mensagem recebida:', msg);
        message = JSON.parse(msg)
        connection.execute('SELECT Funcionario.*, Nome_Pessoa, telefone_Pessoa FROM Funcionario, Pessoa WHERE Pessoa_cpf_Pessoa = ? and Pessoa_cpf_Pessoa = cpf_Pessoa',[message.cpf],(err,result)=>{
            if(err===null){
                if (!users[socket.id]) {
                    users[socket.id] = message.cpf;
                    console.log('Mensagem:', message.msg); // Adicione este log
                }
                io.emit('message', JSON.stringify({
                    msg: message.msg,
                    nome: result.Nome_Pessoa,
                    cpf: message.cpf
                }));
            }
        })

    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('message', `${users[socket.id]} saiu do chat.`);
            delete users[socket.id];
        }
    });
});

server.listen(process.env.PORT,() => {
    console.log('Servidor rodando na porta 3000');
});