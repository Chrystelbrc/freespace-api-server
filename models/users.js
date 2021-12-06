exports.createUser = function (userName) {
	return {
		userName,
		reported: 0,
		reporter: 0,
		bookings: [],
	};
};
