const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
