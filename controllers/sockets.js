const { rooms } = require('../database/rooms');
const { users } = require('../database/users');
const { createUser } = require('../models/users');

exports.socketFirstConnection = (socket) => {
	const { user: userName, isBoard } = socket.request._query;

	if (isBoard) {
		// New board joined
		console.log('A board is connected');

		socket.on('disconnect', () => {
			console.log(`A board is disconnected`);
		});

		// Feed th board
		socket.emit('getAllUsers', users);
		socket.emit('getAllRooms', rooms);

		return;
	}

	// Add new user connection ocket to user room
	socket.join(userName);

	console.log(
		`${userName} is ${
			socket.client.sockets.size === 1 ? 'connected' : 'reconnected'
		}`
	);

	socket.on('disconnect', () => {
		if (socket.client.sockets.size) {
			// Current user is still connected with some sockets
			return;
		}
		console.log(`${userName} is disconnected`);
		// Update user
		if (!users[userName]) {
			// Should never happen
			return;
		}
		// Update user last disconnection
		users[userName].lastDisconnection = Date.now();
		// Broadcast user disconnection
		socket.broadcast.emit('userUpdate', users[userName]);
	});

	// Find user
	let user = users[userName];

	// Handle create user if needed
	if (!user) {
		user = createUser(userName);
		users[userName] = user;
	}

	// Update user last connection
	user.lastConnection = Date.now();

	// Broadcast user connection only if first connection
	if (socket.client.sockets.size === 1) {
		socket.broadcast.emit('userUpdate', user);
	}

	// Send all users to user including himself
	socket.emit('getAllUsers', users);

	socket.emit('getAllRooms', rooms);
};
