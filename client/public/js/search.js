document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-page-input');
    const searchBtn = document.getElementById('search-page-btn');
    const resultsContainer = document.getElementById('search-results');
    const searchStatus = document.getElementById('search-status');
    const noResults = document.getElementById('no-results');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Filter Elements
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const typeRadios = document.getElementsByName('property-type');
    const amenityCheckboxes = document.querySelectorAll('input[type="checkbox"]');

    // State
    let currentFilters = {
        keyword: '',
        maxPrice: 10000000,
        type: 'all',
        amenities: []
    };

    // Initialize
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        searchInput.value = query;
        currentFilters.keyword = query;
    }

    // Initial search
    applyFilters();

    // --- Event Listeners ---

    // Search Input
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    function handleSearch() {
        const newQuery = searchInput.value.trim();
        currentFilters.keyword = newQuery;

        // Update URL
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(newQuery)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        applyFilters();
    }

    // Price Filter
    priceRange.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        currentFilters.maxPrice = value;
        priceValue.textContent = value === 10000000 ? '10.000.000đ+' : formatCurrency(value);
        applyFilters();
    });

    // Type Filter
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentFilters.type = e.target.value;
                applyFilters();
            }
        });
    });

    // Amenities Filter
    amenityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checked = Array.from(amenityCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            currentFilters.amenities = checked;
            applyFilters();
        });
    });

    // Clear/Reset Filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', resetFilters);
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

    function resetFilters() {
        // Reset UI
        priceRange.value = 10000000;
        priceValue.textContent = '10.000.000đ+';
        document.querySelector('input[name="property-type"][value="all"]').checked = true;
        amenityCheckboxes.forEach(cb => cb.checked = false);

        // Reset State
        currentFilters = {
            keyword: searchInput.value.trim(),
            maxPrice: 10000000,
            type: 'all',
            amenities: []
        };
        applyFilters();
    }

    // --- Core Logic ---

    function applyFilters() {
        if (typeof properties === 'undefined') {
            console.error('Data not loaded');
            return;
        }

        let filtered = properties;

        // 1. Keyword Filter
        if (currentFilters.keyword) {
            const term = currentFilters.keyword.toLowerCase();
            filtered = filtered.filter(prop =>
                prop.name.toLowerCase().includes(term) ||
                prop.location.toLowerCase().includes(term)
            );
        }

        // 2. Price Filter
        // Parse price string "2.500.000₫" to number
        filtered = filtered.filter(prop => {
            const priceNum = parseInt(prop.price.replace(/\./g, '').replace('₫', ''));
            // If maxPrice is 10m, treat as no limit (or 10m+)
            if (currentFilters.maxPrice === 10000000) return true;
            return priceNum <= currentFilters.maxPrice;
        });

        // 3. Type Filter
        if (currentFilters.type !== 'all') {
            filtered = filtered.filter(prop => prop.type === currentFilters.type);
        }

        // 4. Amenities Filter
        if (currentFilters.amenities.length > 0) {
            filtered = filtered.filter(prop => {
                // Map UI values to data values
                // wifi -> "Wifi" or "WiFi" or "Wifi (miễn phí)"
                // pool -> "Hồ bơi"
                // parking -> "Chỗ đậu xe" or "Bãi đậu xe"

                const propAmenities = prop.amenities.map(a => a.name.toLowerCase());
                // Also check detailed amenities for more coverage if needed, but simple amenities list is usually enough

                return currentFilters.amenities.every(filterAmenity => {
                    if (filterAmenity === 'wifi') {
                        return propAmenities.some(a => a.includes('wifi'));
                    }
                    if (filterAmenity === 'pool') {
                        return propAmenities.some(a => a.includes('hồ bơi'));
                    }
                    if (filterAmenity === 'parking') {
                        return propAmenities.some(a => a.includes('đậu xe') || a.includes('gửi xe'));
                    }
                    return false;
                });
            });
        }

        renderResults(filtered);
    }

    function renderResults(filteredProperties) {
        resultsContainer.innerHTML = '';

        if (filteredProperties.length === 0) {
            noResults.classList.remove('hidden');
            searchStatus.textContent = `Không tìm thấy kết quả phù hợp`;
        } else {
            noResults.classList.add('hidden');
            searchStatus.textContent = `Tìm thấy ${filteredProperties.length} kết quả`;

            filteredProperties.forEach((prop, index) => {
                const card = createPropertyCard(prop, index);
                resultsContainer.appendChild(card);
            });
        }
    }

    function createPropertyCard(prop, index) {
        const card = document.createElement('div');
        card.className = 'property-card group cursor-pointer';
        card.style.animationDelay = `${index * 0.05}s`; // Faster stagger

        card.innerHTML = `
            <div class="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
                <img src="${prop.images.main}" alt="${prop.name}"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
                <div class="flex items-center justify-between mb-1">
                    <h3 class="font-display text-lg font-semibold text-charcoal group-hover:text-primary transition-colors line-clamp-1">${prop.name}</h3>
                </div>
                <p class="text-warm-gray text-sm mb-2 line-clamp-1">${prop.location}</p>
                <div class="flex items-baseline gap-1">
                    <span class="font-bold text-primary">${prop.price}</span>
                    <span class="text-xs text-warm-gray">/ đêm</span>
                </div>
            </div>
`;

        card.addEventListener('click', () => {
            window.location.href = `details.html?id=${prop.id}`;
        });

        return card;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    }
});
