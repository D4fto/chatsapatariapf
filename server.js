const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {connection} = require('./mysql/connection')

const app = express();
const server = http.createServer(app);


app.use(cors({
    origin: 'https://sapatariapf.onrender.com',
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type']
}));

const io = new Server(server, {
    cors: {
        origin: "https://sapatariapf.onrender.com", 
        methods: ["GET", "POST"]
    }
});

const users = {}; 

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);
    socket.on('connect', () => {
        console.log('Conectado ao servidor');
    });

    socket.on('connect_error', (err) => {
        console.log('Erro de conexão:', err);
    });
    
    socket.on('message', (msg) => {
        console.log('Mensagem recebida:', msg);
        message = JSON.parse(msg)
        connection.execute('SELECT Funcionario.*, Nome_Pessoa, telefone_Pessoa FROM Funcionario, Pessoa WHERE Pessoa_cpf_Pessoa = ? and Pessoa_cpf_Pessoa = cpf_Pessoa',[message.cpf],(err,result)=>{
            if(err===null){
                if (!users[socket.id]) {
                    users[socket.id] = message.cpf; 
                    console.log('Mensagem:', message.msg); 
                }
                connection.execute('INSERT INTO `sapatariapf`.`Mensagem`(`TXT_Mensagem`,`Funcionario_Pessoa_cpf_Pessoa`)VALUES(?,?);',[message.msg,message.cpf])
                io.emit('message', JSON.stringify({
                    msg: message.msg,
                    nome: result[0].Nome_Pessoa,
                    cpf: message.cpf,
                    esuporte: result[0].Cargo_id_Cargo==9
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