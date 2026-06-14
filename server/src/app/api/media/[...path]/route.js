import { readFile } from 'fs/promises';
import path from 'path';

const contentTypes = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

export async function GET(_req, { params }) {
    const { path: segments = [] } = await params;
    const publicRoot = path.resolve(process.env.MEDIA_ROOT || path.join(process.cwd(), '..', 'client', 'public'));
    const requestedFile = path.resolve(publicRoot, ...segments);

    if (!requestedFile.startsWith(`${publicRoot}${path.sep}`)) {
        return new Response('Invalid media path', { status: 400 });
    }

    try {
        const file = await readFile(requestedFile);
        const contentType = contentTypes[path.extname(requestedFile).toLowerCase()] || 'application/octet-stream';
        return new Response(file, {
            headers: {
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
                'Content-Type': contentType,
            },
        });
    } catch {
        return new Response('Media not found', { status: 404 });
    }
}
