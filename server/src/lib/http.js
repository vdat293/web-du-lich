export function getRequestOrigin(req) {
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = forwardedHost || req.headers.get('host');

    if (host) {
        return `${forwardedProto || 'http'}://${host}`;
    }

    return process.env.API_URL || 'http://localhost:3000';
}

export function toAbsoluteMediaUrl(req, value) {
    if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) {
        return value || '';
    }

    const normalizedPath = value.replace(/^\/+/, '');
    if (normalizedPath.startsWith('assets/')) {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
            const rootFolder = process.env.CLOUDINARY_ASSET_FOLDER || 'web-du-lich';
            const encodedPath = normalizedPath.split('/').map(encodeURIComponent).join('/');
            return `https://res.cloudinary.com/${cloudName}/image/upload/${rootFolder}/${encodedPath}`;
        }

        return `${getRequestOrigin(req)}/api/media/${encodeURI(normalizedPath)}`;
    }

    return `${getRequestOrigin(req)}/${normalizedPath}`;
}
