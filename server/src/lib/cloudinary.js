import { v2 as cloudinary } from 'cloudinary';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

function assertCloudinaryConfig() {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length) {
        throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
    }
}

function configureCloudinary() {
    assertCloudinaryConfig();
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export async function uploadAvatar(dataUri, userId) {
    const match = dataUri?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match || !ALLOWED_IMAGE_TYPES.has(match[1].toLowerCase())) {
        throw new Error('INVALID_IMAGE_TYPE');
    }

    const imageBuffer = Buffer.from(match[2], 'base64');
    if (!imageBuffer.length || imageBuffer.length > MAX_IMAGE_SIZE) {
        throw new Error('INVALID_IMAGE_SIZE');
    }

    configureCloudinary();
    const rootFolder = process.env.CLOUDINARY_ASSET_FOLDER || 'web-du-lich';
    const result = await cloudinary.uploader.upload(dataUri, {
        public_id: `${rootFolder}/avatars/avatar_${userId}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
        ],
    });

    return result.secure_url;
}
