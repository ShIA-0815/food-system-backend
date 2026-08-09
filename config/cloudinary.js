const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const myStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads-images',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => {
            const foodName = req.body.foodName || 'unknown';
            const uniqueSuffix = Date.now();
            return `${foodName}_${uniqueSuffix}`;
        }
    }
});

const upload = multer({ storage: myStorage });

module.exports = upload;