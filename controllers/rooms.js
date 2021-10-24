const { database } = require('../database');

exports.fetchAllRooms = function(request, response) {
    response.json(database);
}

exports.fetchFreeRooms = function(request, response) {

    const freeRooms = database.filter((room) => {
        return room.isFree
    });

    response.json(freeRooms);
}

exports.updateRoomStatus = function(request, response) {
    
    const roomIndex = request.params.roomIndex;
    const userName = request.params.userName;

    // Find room from request parameter
    const selectedRoom = database[roomIndex];

    if(!selectedRoom) {
        // No room found for given index
        response.status(404).json({ code: 404 });
        return;
    }

    const isSelectedRoomFree = selectedRoom.isFree;
    const selectedRoomCurrentUserName = selectedRoom.userName;

    if(isSelectedRoomFree) {
        // Room is free we add current user to the room
        database[roomIndex] = { ...selectedRoom, isFree: false, userName };
        response.json(database[roomIndex]);
        return;
    }

    if(selectedRoomCurrentUserName === userName) {
        // Room is occupied by current user who is doing the request
        // User should be removed from the selected room
        database[roomIndex] = { ...selectedRoom, isFree: true, userName: null };
        response.json(database[roomIndex]);
        return;
    }

    response.status(400).json({ code: 400 });

}