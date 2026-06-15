import type { Property } from '../types';

const STOP_WORDS = new Set([
  'toi', 'muon', 'di', 'den', 'tim', 'kiem', 'cho', 'o', 'mot', 'noi', 'co',
  'the', 'duoc', 'please', 'want', 'go', 'to', 'find', 'stay',
]);

const SYNONYMS: Record<string, string> = {
  sea: 'bien',
  beach: 'bien',
  seaside: 'bien',
  coastal: 'bien',
  mountain: 'nui',
  island: 'dao',
};

function normalizeSearchText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesPropertySearch(property: Property, query: string) {
  const tokens = normalizeSearchText(query)
    .split(' ')
    .filter(Boolean)
    .filter(token => !STOP_WORDS.has(token))
    .map(token => SYNONYMS[token] || token);

  if (tokens.length === 0) return true;

  const searchDocument = normalizeSearchText([
    property.name,
    property.location,
    property.type,
    ...(property.searchTags || []),
    ...(property.amenities || []).map(amenity => amenity.name),
  ].filter(Boolean).join(' '));

  return tokens.every(token => searchDocument.includes(token));
}
