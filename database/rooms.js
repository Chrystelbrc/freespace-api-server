const rooms = require('../rooms.json');

const currentTimestamp = Date.now();
exports.rooms = rooms.map((room, roomIndex) => {
	return {
		...room,
		lastUpdate: currentTimestamp,
		id: roomIndex,
	};
});
