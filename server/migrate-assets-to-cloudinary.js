const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');

dotenv.config({ path: path.join(__dirname, '.env') });

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const assetsRoot = path.resolve(__dirname, '..', 'client', 'public', 'assets');
const cloudRoot = process.env.CLOUDINARY_ASSET_FOLDER || 'web-du-lich';

function collectFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? collectFiles(fullPath) : [fullPath];
    });
}

async function main() {
    const files = collectFiles(assetsRoot);
    console.log(`Uploading ${files.length} assets to Cloudinary...`);

    for (const [index, filePath] of files.entries()) {
        const relativePath = path.relative(assetsRoot, filePath).replaceAll(path.sep, '/');
        const pathWithoutExtension = relativePath.slice(0, -path.extname(relativePath).length);
        const publicId = `${cloudRoot}/assets/${pathWithoutExtension}`;

        await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            overwrite: true,
            invalidate: true,
            resource_type: 'image',
        });
        console.log(`[${index + 1}/${files.length}] ${relativePath}`);
    }

    console.log('Asset migration completed.');
}

main().catch((error) => {
    console.error('Asset migration failed:', error.message);
    process.exit(1);
});
