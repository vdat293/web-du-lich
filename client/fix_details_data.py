import re

with open('src/pages/Details.jsx', 'r') as f:
    content = f.read()

# Fix Name
content = re.sub(r'id="property-name"[^>]*>.*?</h1>', 'id="property-name" className="text-neutral-700 dark:text-white text-3xl font-bold leading-tight tracking-tight">{property.name}</h1>', content, flags=re.DOTALL)
content = re.sub(r'id="breadcrumb-name">.*?</span>', 'id="breadcrumb-name">{property.name}</span>', content)
content = re.sub(r'id="breadcrumb-location">.*?</a>', 'id="breadcrumb-location">{property.location}</a>', content)
content = re.sub(r'id="property-location-link">.*?</a>', 'id="property-location-link">{property.location}</a>', content)

# Fix Rating and Reviews
content = re.sub(r'id="property-rating">.*?</span>', 'id="property-rating">{property.rating}</span>', content)
content = re.sub(r'id="property-reviews">.*?</span>', 'id="property-reviews">({property.reviews} đánh giá)</span>', content)


# Fix Location map text
content = re.sub(r'id="map-location-text">.*?</p>', 'id="map-location-text">{property.location}</p>', content)

# Fix Price
content = re.sub(r'id="price-display"[^>]*>.*?</span>', 'id="price-display" className="text-2xl font-bold text-neutral-700 dark:text-white">{property.price}</span>', content, flags=re.DOTALL)

# Fix Images
content = re.sub(r'id="img-main"[^>]*>', 'id="img-main" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{backgroundImage: `url(/${property.images.main})`}}>', content)
content = re.sub(r'id="img-gallery-0"[^>]*>', 'id="img-gallery-0" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{backgroundImage: `url(/${property.images.gallery[0] || property.images.main})`}}>', content)
content = re.sub(r'id="img-gallery-1"[^>]*>', 'id="img-gallery-1" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{backgroundImage: `url(/${property.images.gallery[1] || property.images.main})`}}>', content)
content = re.sub(r'id="img-gallery-2"[^>]*>', 'id="img-gallery-2" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{backgroundImage: `url(/${property.images.gallery[2] || property.images.main})`}}>', content)
content = re.sub(r'id="img-gallery-3"[^>]*>', 'id="img-gallery-3" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{backgroundImage: `url(/${property.images.gallery[3] || property.images.main})`}}>', content)


# Fix Host Info
content = re.sub(r'id="host-info">.*?</h2>', 'id="host-info">Toàn bộ {property.type}. Chủ nhà {property.host?.name || "Minh"}</h2>', content, flags=re.DOTALL)
content = re.sub(r'10 khách · 5 phòng ngủ · 6\s*giường · 5 phòng tắm</p>', '{property.maxGuests} khách · {property.bedrooms} phòng ngủ · {property.bathrooms} phòng tắm</p>', content)
content = re.sub(r'id="host-avatar"[^>]*src="" />', 'id="host-avatar" className="w-14 h-14 rounded-full object-cover" src={property.host?.avatar || "https://placekitten.com/200/200"} />', content)

# Fix map image
content = re.sub(r'id="map-image"[^>]*>', 'id="map-image" className="w-full h-96 rounded-xl bg-cover bg-center bg-neutral-200" style={{backgroundImage: `url(${property.mapImage || ""})`}}>', content)

# Fix reviews-summary
content = re.sub(r'id="reviews-summary">\s*.*?\s*</h2>', 'id="reviews-summary">{property.rating} ({property.reviews} đánh giá)</h2>', content, flags=re.DOTALL)

with open('src/pages/Details.jsx', 'w') as f:
    f.write(content)

