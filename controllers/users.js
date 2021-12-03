const { users } = require('../database/users');
const { rooms } = require('../database/rooms');

const { createUser } = require('../models/users');

const { getAutoBookingsTimeoutIdByUserName } = require('./rooms');

exports.reportUser = function (request, response, socketServer) {
	const { reportedUserName, reporterUserName, roomIndex } = request.query;
	const autoBookingsTimeoutIdByUserName = getAutoBookingsTimeoutIdByUserName();
	const currentTimestamp = Date.now();
	if (
		!users[reporterUserName] ||
		!users[reportedUserName] ||
		users[reporterUserName] === users[reportedUserName]
	) {
		response.status(400).json({ code: 400 });
		return;
	}

	const reportedUserCurrentRoomIndex = rooms.findIndex((room) => {
		return room.userName === reportedUserName;
	});

	users[reportedUserName].reported++;
	users[reporterUserName].reporter++;

	// Remove reporter user from rooms
	if (autoBookingsTimeoutIdByUserName[reporterUserName]) {
		clearTimeout(autoBookingsTimeoutIdByUserName[reporterUserName]);
	}
	if (autoBookingsTimeoutIdByUserName[reportedUserName]) {
		clearTimeout(autoBookingsTimeoutIdByUserName[reportedUserName]);
	}

	if (reportedUserCurrentRoomIndex >= 0) {
		delete rooms[reportedUserCurrentRoomIndex].userName;
		users[reportedUserName].bookings[
			users[reportedUserName].bookings.length - 1
		].end = currentTimestamp;
	}

	delete rooms[roomIndex].userName;
	// Add unbooking action date to user history
	users[reporterUserName].bookings[
		users[reporterUserName].bookings.length - 1
	].end = currentTimestamp;

	// Add reported user to room
	rooms[roomIndex].userName = reportedUserName;
	// Add booking action date to user history
	users[reportedUserName].bookings.push({
		start: currentTimestamp,
		roomIndex,
	});

	// Handle auto unbooking
	autoBookingsTimeoutIdByUserName[reportedUserName] = setTimeout(() => {
		if (rooms[roomIndex].userName === reportedUserName) {
			delete rooms[roomIndex].userName;
			// Add unbooking action date to user history
			users[reportedUserName].bookings[
				users[reportedUserName].bookings.length - 1
			].end = Date.now();
		}
	}, 1000 * 60 * 30);

	response.json({
		reporter: users[reporterUserName],
		reported: users[reportedUserName],
	});

	// Notify user update
	if (reportedUserCurrentRoomIndex >= 0) {
		socketServer.sockets.emit(
			'roomUpdate',
			rooms[reportedUserCurrentRoomIndex],
			reportedUserCurrentRoomIndex,
			reportedUserName
		);
	}

	socketServer.sockets.emit(
		'roomUpdate',
		rooms[roomIndex],
		roomIndex,
		reporterUserName
	);

	socketServer.sockets.emit(
		'userUpdate',
		users[reportedUserName],
		users[reporterUserName]
	);
};

exports.resetUser = function (request, response, socketServer) {
	const resetUserName = request.params.userName;

	// Preserve lastConnection and lastDisconnection
	users[resetUserName] = {
		...createUser(resetUserName),
		lastConnection: users[resetUserName].lastConnection,
		lastDisconnection: users[resetUserName].lastDisconnection,
	};

	response.json(users[resetUserName]);

	// Notify user update
	socketServer.sockets.emit('userUpdate', users[resetUserName]);
};
