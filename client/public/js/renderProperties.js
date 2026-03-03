// Render Featured Properties từ data
document.addEventListener('DOMContentLoaded', function () {
    const featuredPropertiesContainer = document.getElementById('featured-properties');
    const carouselIndicatorsContainer = document.getElementById('carousel-indicators');

    if (!featuredPropertiesContainer || !window.properties) {
        console.error('Featured properties container hoặc data không tồn tại');
        return;
    }

    // Xóa nội dung cũ
    featuredPropertiesContainer.innerHTML = '';

    // Render tất cả properties từ data
    // Render top 8 properties từ data
    const featuredProperties = window.properties.slice(0, 10);
    featuredProperties.forEach((property, index) => {
        const propertyCard = createPropertyCard(property, index);
        featuredPropertiesContainer.appendChild(propertyCard);
    });

    // Tạo carousel indicators dựa trên số lượng properties
    if (carouselIndicatorsContainer) {
        carouselIndicatorsContainer.innerHTML = '';
        const totalProperties = featuredProperties.length;

        for (let i = 0; i < totalProperties; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-primary w-8' : 'bg-warm-gray/30'}`;
            indicator.setAttribute('data-index', i);
            indicator.addEventListener('click', () => scrollToProperty(i));
            carouselIndicatorsContainer.appendChild(indicator);
        }
    }
});

function createPropertyCard(property, index) {
    const card = document.createElement('a');
    card.href = `details.html?id=${property.id}`;
    card.className = 'property-card group flex-shrink-0 w-[320px] bg-white rounded-2xl overflow-hidden shadow-elegant hover-lift cursor-pointer';

    // Determine badge
    let badge = '';
    if (property.isHot) {
        badge = `
            <div class="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-full shadow-sm">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
                <span class="text-xs font-semibold">Hot</span>
            </div>
        `;
    } else if (property.host.superhost) {
        badge = `
            <div class="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                <span class="material-symbols-outlined text-accent text-sm" style="font-variation-settings: 'FILL' 1;">verified</span>
                <span class="text-xs font-semibold text-charcoal">Superhost</span>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="relative aspect-[4/3] overflow-hidden">
            <img
                src="${property.images.main}"
                alt="${property.name}"
                class="image-zoom w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            ${badge}
            <button class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors duration-300">
                <span class="material-symbols-outlined text-charcoal text-lg">favorite</span>
            </button>
        </div>
        <div class="p-5">
            <div class="flex items-start justify-between mb-2">
                <h3 class="font-display text-lg font-semibold text-charcoal leading-tight">${property.name}</h3>
                <div class="flex items-center gap-1 text-charcoal">
                    <span class="material-symbols-outlined text-accent text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="text-sm font-semibold">${property.rating}</span>
                </div>
            </div>
            <p class="text-warm-gray text-sm mb-4">${property.location}</p>
            <div class="flex items-center justify-between pt-4 border-t border-light-border">
                <div class="flex items-center gap-4 text-warm-gray text-xs">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">bed</span> ${property.bedrooms}
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">bathtub</span> ${property.bathrooms}
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">group</span> ${property.maxGuests}
                    </span>
                </div>
                <p class="text-primary font-semibold">
                    ${property.price}<span class="text-warm-gray text-xs font-normal">/đêm</span>
                </p>
            </div>
        </div>
    `;

    return card;
}

// Function để scroll tới property theo index
function scrollToProperty(index) {
    const container = document.getElementById('carousel-container');
    const propertyCards = container.querySelectorAll('.property-card');

    if (propertyCards[index]) {
        propertyCards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        updateIndicators(index);
    }
}

// Function để update active indicator
function updateIndicators(activeIndex) {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
            indicator.className = 'carousel-indicator w-8 h-2 rounded-full bg-primary transition-all duration-300';
        } else {
            indicator.className = 'carousel-indicator w-2 h-2 rounded-full bg-warm-gray/30 transition-all duration-300';
        }
    });
}

// Thêm scroll listener để tự động cập nhật indicators khi scroll
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('carousel-container');
    if (!container) return;

    let scrollTimeout;
    container.addEventListener('scroll', function () {
        // Debounce để tránh gọi quá nhiều lần
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
            const propertyCards = container.querySelectorAll('.property-card');
            if (propertyCards.length === 0) return;

            const cardWidth = propertyCards[0].offsetWidth + 24; // 24 = gap-6 (1.5rem = 24px)
            const scrollPosition = container.scrollLeft;
            const activeIndex = Math.round(scrollPosition / cardWidth);

            updateIndicators(Math.min(activeIndex, propertyCards.length - 1));
        }, 50);
    });
});
