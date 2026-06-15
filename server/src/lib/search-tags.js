const COASTAL_PROPERTY_IDS = new Set([
    31, 32, 33, 34, 35,
    41, 42, 43,
    103, 104,
    107, 108,
    113, 114,
    115, 116,
    117, 118,
    119, 120,
]);

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
}

export function buildPropertySearchTags(property) {
    const text = normalizeText(`${property.name} ${property.location} ${property.type}`);
    const tags = new Set([property.type]);

    if (COASTAL_PROPERTY_IDS.has(Number(property.id)) || /bien|beach|mui ne|nha trang|phu quoc|ha long|quy nhon|vung tau|da nang|hoi an/.test(text)) {
        ['biển', 'bãi biển', 'ven biển', 'beach', 'coastal', 'nghỉ dưỡng biển'].forEach(tag => tags.add(tag));
    }
    if (/phu quoc|dao/.test(text)) {
        ['đảo', 'đảo ngọc', 'island'].forEach(tag => tags.add(tag));
    }
    if (/sapa|da lat|dalat/.test(text)) {
        ['núi', 'cao nguyên', 'khí hậu mát', 'mountain'].forEach(tag => tags.add(tag));
    }
    if (/ha noi|ho chi minh|can tho|hue|hoi an/.test(text)) {
        ['thành phố', 'city break', 'văn hóa'].forEach(tag => tags.add(tag));
    }
    if (property.type === 'resort') {
        ['resort', 'nghỉ dưỡng', 'thư giãn'].forEach(tag => tags.add(tag));
    }
    if (property.type === 'villa') {
        ['villa', 'biệt thự', 'nguyên căn', 'gia đình', 'nhóm bạn'].forEach(tag => tags.add(tag));
    }

    return [...tags].filter(Boolean);
}

export function parseSearchTags(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
