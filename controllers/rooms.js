const { rooms } = require('../database/rooms');
const { users } = require('../database/users');

const AUTO_UNBOOKING_TIMEOUT = 1000 * 60 * 30; // 30 minutes

const autoBookingsTimeoutIdByUserName = {};

exports.getAutoBookingsTimeoutIdByUserName = () =>
	autoBookingsTimeoutIdByUserName;

exports.updateRoomStatus = function (request, response, socketServer) {
	const roomIndex = request.params.roomIndex;
	const userName = request.params.userName;

	// Find room from request parameter
	const selectedRoom = rooms[roomIndex];

	if (!selectedRoom) {
		// No room found for given index
		response.status(404).json({ code: 404 });
		return;
	}

	const selectedRoomCurrentUserName = selectedRoom.userName;

	if (selectedRoomCurrentUserName && selectedRoomCurrentUserName !== userName) {
		// User has selected a non free room
		response.status(400).json({ code: 400 });
		return;
	}

	const isUserBooking = !selectedRoomCurrentUserName;
	const currentTimestamp = Date.now();
	const previousRoomUserName = rooms[roomIndex].userName;

	rooms[roomIndex].lastUpdate = currentTimestamp;

	if (autoBookingsTimeoutIdByUserName[userName]) {
		clearTimeout(autoBookingsTimeoutIdByUserName[userName]);
	}

	if (isUserBooking) {
		// Room is free we add current user to the room
		rooms[roomIndex].userName = userName;
		// Add booking action date to user history
		users[userName].bookings.push({
			start: currentTimestamp,
			roomIndex,
		});

		// Handle auto unbooking
		autoBookingsTimeoutIdByUserName[userName] = setTimeout(() => {
			if (rooms[roomIndex].userName === userName) {
				delete rooms[roomIndex].userName;
				// Add unbooking action date to user history
				users[userName].bookings[users[userName].bookings.length - 1].end =
					Date.now();
				socketServer.sockets.emit(
					'roomUpdate',
					rooms[roomIndex],
					roomIndex,
					userName
				);
				socketServer.sockets.emit('userUpdate', users[userName]);
			}
		}, AUTO_UNBOOKING_TIMEOUT);
	}

	if (!isUserBooking) {
		// Room is occupied by current user who is doing the request
		// User should be removed from the selected room
		delete rooms[roomIndex].userName;
		// Add unbooking action date to user history
		users[userName].bookings[users[userName].bookings.length - 1].end =
			currentTimestamp;
	}

	response.json(rooms[roomIndex]);
	// Notify data change
	socketServer.sockets.emit(
		'roomUpdate',
		rooms[roomIndex],
		roomIndex,
		previousRoomUserName
	);
	socketServer.sockets.emit('userUpdate', users[userName]);
};
