const { rooms } = require('../database/rooms');
const { generateQRCodeForRoom } = require('../modules/qr-code-generator');

exports.generateQRCodeForRoom = function (request, response) {
	const roomIndex = request.params.roomIndex;
	const { size: sizeFromQuery, margin: marginFromQuery } = request.query;

	const sizeAsIntegerOrNaN = parseInt(sizeFromQuery, 10);
	const size = isNaN(sizeAsIntegerOrNaN) ? 500 : sizeAsIntegerOrNaN;

	const marginAsIntegerOrNaN = parseInt(marginFromQuery, 10);
	const margin = isNaN(marginAsIntegerOrNaN) ? size / 4 : marginAsIntegerOrNaN;

	const selectedRoom = rooms[roomIndex];

	generateQRCodeForRoom({
		size,
		margin,
		roomIndex,
	})
		.then((qrCodeBuffer) => {
			response.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': qrCodeBuffer.length,
			});
			response.end(qrCodeBuffer);
		})
		.catch((error) => {
			response.status(500).json({
				code: 500,
				message: error.message,
			});
		});
};
