const express = require('express');
const cors = require('cors');

const {
	fetchAllRooms,
	fetchFreeRooms,
	updateRoomStatus,
} = require('./controllers/rooms');

const { generateQRCodeForRoom } = require('./controllers/qr-codes');

const app = express();

app.use(cors());

app.get('/fetch-all-rooms', fetchAllRooms);
app.get('/fetch-free-rooms', fetchFreeRooms);
app.put('/update-room-status/:roomIndex/:userName', updateRoomStatus);

app.get('/qr-code/:roomIndex.png', generateQRCodeForRoom);

app.listen(3001, () => {
	console.log('App listening on port 3001');
});
