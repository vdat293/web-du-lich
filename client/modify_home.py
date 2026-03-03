import re

with open('src/pages/Home.jsx', 'r') as f:
    content = f.read()

# 1. Add imports and state
import_replacement = """import React, { useEffect, useState, useRef } from 'react';
import { properties } from '../mockup_data/data';

export default function Home() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const featuredProperties = properties.slice(0, 10);

  const scrollToIndex = (index) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.property-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1);
  };
  
  const scrollNext = () => {
    if (activeIndex < featuredProperties.length - 1) scrollToIndex(activeIndex + 1);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.property-card');
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 24;
    const scrollPosition = containerRef.current.scrollLeft;
    setActiveIndex(Math.min(Math.round(scrollPosition / cardWidth), featuredProperties.length - 1));
  };
"""
content = re.sub(r"import React, { useEffect } from 'react';\n\nexport default function Home\(\) {", import_replacement, content)

# 2. Replace the carousel previous button
prev_btn_orig = """                <button id="carousel-prev"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-elegant flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>"""
prev_btn_new = """                <button id="carousel-prev" onClick={scrollPrev} disabled={activeIndex === 0}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-elegant flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>"""
content = content.replace(prev_btn_orig, prev_btn_new)

# 3. Replace the carousel container
container_orig = """                <div id="carousel-container" className="carousel-scroll flex overflow-x-auto scroll-smooth pb-4">
                  <div id="featured-properties" className="flex gap-6">
                    {/* Properties sẽ được render từ JavaScript */}
                  </div>
                </div>"""
container_new = """                <div id="carousel-container" ref={containerRef} onScroll={handleScroll} className="carousel-scroll flex overflow-x-auto scroll-smooth pb-4">
                  <div id="featured-properties" className="flex gap-6">
                    {featuredProperties.map((property) => (
                      <a key={property.id} href={`details.html?id=${property.id}`} className="property-card group flex-shrink-0 w-[320px] bg-white rounded-2xl overflow-hidden shadow-elegant hover-lift cursor-pointer">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={property.images.main} alt={property.name} className="image-zoom w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {property.isHot && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-full shadow-sm">
                              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                              <span className="text-xs font-semibold">Hot</span>
                            </div>
                          )}
                          {!property.isHot && property.host && property.host.superhost && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                              <span className="material-symbols-outlined text-accent text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                              <span className="text-xs font-semibold text-charcoal">Superhost</span>
                            </div>
                          )}
                          <button className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors duration-300">
                            <span className="material-symbols-outlined text-charcoal text-lg">favorite</span>
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-lg font-semibold text-charcoal leading-tight">{property.name}</h3>
                            <div className="flex items-center gap-1 text-charcoal">
                              <span className="material-symbols-outlined text-accent text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                              <span className="text-sm font-semibold">{property.rating}</span>
                            </div>
                          </div>
                          <p className="text-warm-gray text-sm mb-4">{property.location}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-light-border">
                            <div className="flex items-center gap-4 text-warm-gray text-xs">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">bed</span> {property.bedrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">bathtub</span> {property.bathrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">group</span> {property.maxGuests}
                              </span>
                            </div>
                            <p className="text-primary font-semibold">
                              {property.price}<span className="text-warm-gray text-xs font-normal">/đêm</span>
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>"""
content = content.replace(container_orig, container_new)

# 4. Replace next button
next_btn_orig = """                <button id="carousel-next"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-elegant flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>"""
next_btn_new = """                <button id="carousel-next" onClick={scrollNext} disabled={activeIndex === featuredProperties.length - 1}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-elegant flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>"""
content = content.replace(next_btn_orig, next_btn_new)

# 5. Indicators
indicators_orig = """                <div id="carousel-indicators" className="flex gap-2">
                  {/* Indicators sẽ được tạo động từ JavaScript */}
                </div>"""
indicators_new = """                <div id="carousel-indicators" className="flex gap-2">
                   {featuredProperties.map((_, idx) => (
                     <button key={idx} onClick={() => scrollToIndex(idx)} className={`carousel-indicator h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-primary w-8' : 'bg-warm-gray/30 w-2'}`}></button>
                   ))}
                </div>"""
content = content.replace(indicators_orig, indicators_new)

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)

