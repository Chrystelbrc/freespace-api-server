const http = require('http');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const { Server: SocketIOServer } = require('socket.io');

const { reportUser, resetUser } = require('./controllers/users');
const { updateRoomStatus } = require('./controllers/rooms');

const { generateQRCodeForRoom } = require('./controllers/qr-codes');
const { socketFirstConnection } = require('./controllers/sockets');

const app = express();

const httpsServer = https.createServer(
	{
		key: fs.readFileSync('./cert/server.key'),
		cert: fs.readFileSync('./cert/server.cert'),
	},
	app
);

const corsOptions = {
	origin: process.env.ORIGIN_URL,
	methods: ['GET', 'POST', 'PUT'],
};

const socketServer = new SocketIOServer(httpsServer, {
	cors: corsOptions,
});
socketServer.on('connection', socketFirstConnection);

app.use(cors());

app.use('/covers/', express.static(__dirname + '/covers'));

app.post('/report', (request, response) => {
	reportUser(request, response, socketServer);
});
app.post('/reset/:userName', (request, response) => {
	resetUser(request, response, socketServer);
});

app.put('/update-room-status/:roomIndex/:userName', (request, response) =>
	updateRoomStatus(request, response, socketServer)
);

app.get('/qr-code/:roomIndex.png', generateQRCodeForRoom);

httpsServer.listen(3000, () => {
	console.log('App listening on port 3000');
});
