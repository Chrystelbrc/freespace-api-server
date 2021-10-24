const express = require('express');
const { fetchAllRooms, fetchFreeRooms, updateRoomStatus } = require('./controllers/rooms');
const cors = require('cors');

const app = express()
app.use(cors());
const port = 3001

app.get('/fetch-all-rooms', fetchAllRooms);
app.get('/fetch-free-rooms', fetchFreeRooms);
app.put('/update-room-status/:roomIndex/:userName', updateRoomStatus);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})