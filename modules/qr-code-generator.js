const axios = require('axios');
const { AwesomeQR, QRErrorCorrectLevel, QRMaskPattern } = require('awesome-qr');
const coolImages = require('cool-images');

const fs = require('fs');

const QR_CODE_PREFIX = 'freespace-room#';

const fetchRandomCoolImage = ({ size }) => {
	const backgroundImageUrl = coolImages.one(size, size, false, false);
	return axios
		.get(backgroundImageUrl, { responseType: 'arraybuffer' })
		.catch((error) => {
			if (error.response.status === 404) {
				// Retry if failed due to not found error
				return fetchRandomCoolImage({ size });
			}
			return Promise.reject(error);
		});
};

exports.generateQRCodeForRoom = ({ roomIndex, size, margin }) => {
	const qrCodeText = `${QR_CODE_PREFIX}${roomIndex}`;

	return fetchRandomCoolImage({ size }).then((response) => {
		const backgroundImageBuffer = Buffer.from(response.data, 'base64');

		const qrCode = new AwesomeQR({
			text: qrCodeText,
			size,
			margin,
			correctLevel: QRErrorCorrectLevel.H,
			// maskPattern: QRMaskPattern.PATTERN000,
			// version: 1,
			components: {
				data: {
					scale: 0.4,
					protectors: true,
				},
				timing: {
					scale: 0.4,
					protectors: true,
				},
				alignment: {
					scale: 0.4,
					protectors: true,
				},
				cornerAlignment: {
					scale: 0.4,
					protectors: true,
				},
			},

			// colorDark: '#000000', // Color of the blocks on the QR code
			// colorLight: '#ffffff', // Color of the empty areas on the QR code

			autoColor: true,

			backgroundImage: backgroundImageBuffer,

			backgroundDimming: 'rgba(255, 255, 255, 0.33)',
			// gifBackground: undefined,
			whiteMargin: false,
			// logoImage: undefined,
			// logoScale: 0.2,
			// logoMargin: 6,
			// logoCornerRadius: 8,
			// dotScale: 0.4; // DEPRECATED!!,
		});

		return qrCode.draw();
	});
};
