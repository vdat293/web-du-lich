import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { properties } from '../mockup_data/data';
import Header from '../components/Header';

export default function Details() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [roomType, setRoomType] = useState('single');

    useEffect(() => {
        // Fetch property by id
        // Since properties is an array, let's find the matching one
        const p = properties.find(p => p.id.toString() === id);
        if (p) {
            setProperty(p);
        } else {
            // Default to first property if not found (just for demo purposes)
            setProperty(properties[0]);
        }
    }, [id]);

    if (!property) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Price calculations
    const priceString = property.price.replace(/\./g, '').replace('₫', '');
    const pricePerNightBase = parseInt(priceString) || 0;

    let checkInDate = checkIn ? new Date(checkIn) : new Date();
    let checkOutDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 86400000); // 1 night default

    if (isNaN(checkInDate.getTime())) checkInDate = new Date();
    if (isNaN(checkOutDate.getTime())) checkOutDate = new Date(Date.now() + 86400000);

    const timeDiff = checkOutDate - checkInDate;
    const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Fix negative nights returning 0

    let roomMultiplier = 1;
    if (roomType === 'double') roomMultiplier = 1.3;
    if (roomType === 'quad') roomMultiplier = 1.5;

    const pricePerNight = Math.round(pricePerNightBase * roomMultiplier);
    const totalBase = pricePerNight * nights;
    const serviceFee = Math.round(totalBase * 0.1);
    const total = totalBase + serviceFee;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            {/* The body content from details.html goes here */}

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <Header />
                <main className="flex h-full grow flex-col pt-20">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                        <div id="loading" className="text-center py-20 hidden">
                            <p>Đang tải thông tin...</p>
                        </div>
                        <div id="error-message" className="text-center py-20 hidden">
                            <h2 className="text-2xl font-bold text-red-600">Không tìm thấy chỗ ở</h2>
                            <p className="mt-4">Xin lỗi, chúng tôi không tìm thấy thông tin chỗ ở bạn yêu cầu.</p>
                            <a href="/"
                                className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold">Quay
                                lại trang
                                chủ</a>
                        </div>

                        <div id="property-content" className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-2">
                                    <a className="text-neutral-500 dark:text-neutral-200 text-sm font-medium leading-normal hover:text-primary"
                                        href="/">Trang chủ</a>
                                    <span
                                        className="text-neutral-500 dark:text-neutral-200 text-sm font-medium leading-normal">/</span>
                                    <a className="text-neutral-500 dark:text-neutral-200 text-sm font-medium leading-normal hover:text-primary"
                                        href="#" id="breadcrumb-location">{property.location}</a>
                                    <span
                                        className="text-neutral-500 dark:text-neutral-200 text-sm font-medium leading-normal">/</span>
                                    <span className="text-neutral-700 dark:text-white text-sm font-medium leading-normal"
                                        id="breadcrumb-name">{property.name}</span>
                                </div>
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h1 id="property-name" className="text-neutral-700 dark:text-white text-3xl font-bold leading-tight tracking-tight">{property.name}</h1>
                                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-200">
                                            <span className="material-symbols-outlined text-accent-gold !text-lg"
                                            >star</span>
                                            <span className="font-bold text-neutral-700 dark:text-white"
                                                id="property-rating">{property.rating}</span>
                                            <span id="property-reviews">({property.reviews} đánh giá)</span>
                                            <span className="font-bold">·</span>
                                            <a className="font-bold underline text-neutral-700 dark:text-white hover:text-primary"
                                                href="#" id="property-location-link">{property.location}</a>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                            <span className="material-symbols-outlined !text-xl">ios_share</span>
                                            <span className="text-sm font-medium">Chia sẻ</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                            <span className="material-symbols-outlined !text-xl">favorite</span>
                                            <span className="text-sm font-medium">Lưu</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[550px]">
                                    <div className="col-span-4 sm:col-span-2 row-span-2 rounded-xl overflow-hidden">
                                        <div id="img-main" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{ backgroundImage: `url(/${property.images.main})` }}>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 row-span-1 rounded-xl overflow-hidden hidden sm:block">
                                        <div id="img-gallery-0" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{ backgroundImage: `url(/${property.images.gallery[0] || property.images.main})` }}>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 row-span-1 rounded-xl overflow-hidden hidden sm:block">
                                        <div id="img-gallery-1" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{ backgroundImage: `url(/${property.images.gallery[1] || property.images.main})` }}>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 row-span-1 rounded-xl overflow-hidden hidden sm:block">
                                        <div id="img-gallery-2" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{ backgroundImage: `url(/${property.images.gallery[2] || property.images.main})` }}>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 row-span-1 rounded-xl overflow-hidden hidden sm:block">
                                        <div id="img-gallery-3" className="w-full h-full bg-center bg-no-repeat bg-cover bg-neutral-200" style={{ backgroundImage: `url(/${property.images.gallery[3] || property.images.main})` }}>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4">
                                    <button id="view-all-photos-btn"
                                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white text-charcoal gap-2 text-sm font-bold leading-normal tracking-[0.015em] border border-neutral-300 shadow-sm hover:shadow-md">
                                        <span className="material-symbols-outlined !text-xl">collections</span>
                                        <span>Xem tất cả ảnh</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 mt-6">
                                <div className="lg:col-span-2 flex flex-col gap-8">
                                    <div className="flex flex-col gap-4 pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xl font-bold text-neutral-700 dark:text-white" id="host-info">Toàn bộ {property.type}. Chủ nhà {property.host?.name || "Minh"}</h2>
                                                <p className="text-neutral-500 dark:text-neutral-200">{property.maxGuests} khách · {property.bedrooms} phòng ngủ · {property.bathrooms} phòng tắm</p>
                                            </div>
                                            <img id="host-avatar" className="w-14 h-14 rounded-full object-cover" src={property.host?.avatar || "https://placekitten.com/200/200"} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2" id="superhost-badge">
                                            <span
                                                className="inline-flex items-center justify-center rounded-full bg-accent-gold/10 px-3 py-1 text-xs font-bold text-accent-gold">
                                                Chủ nhà siêu cấp
                                            </span>
                                            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-200 text-sm">
                                                <span className="material-symbols-outlined text-accent-gold !text-base"
                                                >workspace_premium</span>
                                                <span>Đánh giá xuất sắc</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                        <p className="text-neutral-500 dark:text-neutral-200 leading-relaxed whitespace-pre-line"
                                            id="property-description">
                                            {property.description}
                                        </p>
                                        <a id="description-toggle-btn"
                                            className="mt-4 inline-flex items-center gap-1 font-bold text-neutral-700 dark:text-white hover:text-primary hidden cursor-pointer">
                                            <span>Hiển thị thêm</span>
                                            <span className="material-symbols-outlined !text-xl">chevron_right</span>
                                        </a>
                                    </div>
                                    <div className="pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                        <h2 className="text-xl font-bold text-neutral-700 dark:text-white mb-4">Tiện ích chính</h2>
                                        <div className="grid grid-cols-2 gap-4" id="amenities-list">
                                        </div>
                                        <button id="show-amenities-btn"
                                            className="mt-6 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent text-neutral-700 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] border border-neutral-700 dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                            <span>Hiển thị tất cả tiện nghi</span>
                                        </button>
                                    </div>
                                    <div className="pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="material-symbols-outlined text-accent-gold !text-2xl"
                                            >star</span>
                                            <h2 className="text-xl font-bold text-neutral-700 dark:text-white" id="reviews-summary">{property.rating} ({property.reviews} đánh giá)</h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-neutral-500 dark:text-neutral-200">Sạch sẽ</span>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                                                        <div className="bg-neutral-700 dark:bg-white h-1 rounded-full"
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className="font-medium text-sm text-neutral-700 dark:text-white">5.0</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-neutral-500 dark:text-neutral-200">Độ chính xác</span>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                                                        <div className="bg-neutral-700 dark:bg-white h-1 rounded-full"
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className="font-medium text-sm text-neutral-700 dark:text-white">5.0</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-neutral-500 dark:text-neutral-200">Giao tiếp</span>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                                                        <div className="bg-neutral-700 dark:bg-white h-1 rounded-full"
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className="font-medium text-sm text-neutral-700 dark:text-white">{property.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-neutral-500 dark:text-neutral-200">Vị trí</span>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                                                        <div className="bg-neutral-700 dark:bg-white h-1 rounded-full"
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className="font-medium text-sm text-neutral-700 dark:text-white">{property.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-700 dark:text-white mb-4">Vị trí chỗ ở</h2>
                                        <div id="map-image" className="w-full h-96 rounded-xl bg-cover bg-center bg-neutral-200" style={{ backgroundImage: `url(${property.mapImage || ""})` }}>
                                        </div>
                                        <p className="mt-4 font-bold text-neutral-700 dark:text-white" id="map-location-text">Vị trí
                                        </p>
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24">
                                        <div
                                            className="rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-6 flex flex-col gap-5">
                                            <div className="flex items-baseline gap-1">
                                                <span id="price-display" className="text-2xl font-bold text-neutral-700 dark:text-white">{property.price}</span>
                                                <span className="text-neutral-500 dark:text-neutral-200">/
                                                    đêm</span>
                                            </div>
                                            <div
                                                className="grid grid-cols-2 gap-px border border-neutral-500 dark:border-neutral-200 rounded-lg overflow-hidden">
                                                <div className="p-3 bg-background-light dark:bg-background-dark">
                                                    <label
                                                        className="block text-xs font-bold uppercase text-neutral-700 dark:text-white"
                                                        htmlFor="check-in">Nhận phòng</label>
                                                    <input
                                                        className="w-full border-0 p-0 text-sm bg-transparent focus:ring-0 text-neutral-500 dark:text-neutral-200"
                                                        id="check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                                                </div>
                                                <div className="p-3 bg-background-light dark:bg-background-dark">
                                                    <label
                                                        className="block text-xs font-bold uppercase text-neutral-700 dark:text-white"
                                                        htmlFor="check-out">Trả phòng</label>
                                                    <input
                                                        className="w-full border-0 p-0 text-sm bg-transparent focus:ring-0 text-neutral-500 dark:text-neutral-200"
                                                        id="check-out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="p-3 border border-neutral-500 dark:border-neutral-200 rounded-lg">
                                                <label
                                                    className="block text-xs font-bold uppercase text-neutral-700 dark:text-white"
                                                    htmlFor="room-type">Loại phòng</label>
                                                <select
                                                    className="w-full border-0 p-0 text-sm bg-transparent focus:ring-0 text-neutral-500 dark:text-neutral-200"
                                                    id="room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                                                    <option value="single">Phòng đơn</option>
                                                    <option value="double">Phòng đôi</option>
                                                    <option value="quad">Phòng 4 người</option>
                                                </select>
                                            </div>
                                            <Link to={`/payment?id=${property.id}&checkIn=${checkIn}&checkOut=${checkOut}&roomType=${roomType}`} className="w-full">
                                                <button
                                                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90">
                                                    <span>Đặt ngay</span>
                                                </button>
                                            </Link>
                                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-200">
                                                Bạn chưa bị
                                                trừ tiền</p>
                                            <div
                                                className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                <div className="flex justify-between text-neutral-500 dark:text-neutral-200">
                                                    <span id="price-calculation">{pricePerNight.toLocaleString('vi-VN')}₫ x {nights} đêm</span>
                                                    <span id="price-total-base">{totalBase.toLocaleString('vi-VN')}₫</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-500 dark:text-neutral-200">
                                                    <span>Phí dịch vụ 10%</span>
                                                    <span id="service-fee">{serviceFee.toLocaleString('vi-VN')}₫</span>
                                                </div>
                                            </div>
                                            <div
                                                className="flex justify-between font-bold text-neutral-700 dark:text-white pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                <span>Tổng cộng</span>
                                                <span id="total-price">{total.toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer id="about-section" className="bg-charcoal text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
                            {/*  Brand Column  */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-accent rounded-lg transform rotate-45"></div>
                                        <span className="relative text-charcoal font-display font-bold text-lg">A</span>
                                    </div>
                                    <span className="font-display text-xl font-semibold">Aoklevart</span>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                                    Nền tảng đặt phòng nghỉ dưỡng hàng đầu Việt Nam, kết nối bạn với những trải nghiệm lưu trú
                                    độc
                                    đáo và đáng
                                    nhớ.
                                </p>
                                <div className="flex items-center gap-4">
                                    <a href="#"
                                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-accent hover:text-charcoal transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                    <a href="#"
                                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-accent hover:text-charcoal transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/*  Links Columns  */}
                            <div>
                                <h4 className="font-semibold text-white mb-5">Về Aoklevart</h4>
                                <ul className="space-y-3">
                                    <li><a href="about.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Giới
                                        thiệu</a></li>
                                    <li><a href="careers.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Tuyển
                                        dụng</a></li>
                                    <li><a href="#"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Báo
                                        chí</a>
                                    </li>
                                    <li><a href="#"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Blog</a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-5">Hỗ trợ</h4>
                                <ul className="space-y-3">
                                    <li><a href="support.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Trung
                                        tâm
                                        trợ giúp</a></li>
                                    <li><a href="support.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Câu
                                        hỏi
                                        thường gặp</a></li>
                                    <li><a href="support.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Liên
                                        hệ</a>
                                    </li>
                                    <li><a href="support.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Chính
                                        sách
                                        hủy phòng</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-5">Pháp lý</h4>
                                <ul className="space-y-3">
                                    <li><a href="terms.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Điều
                                        khoản
                                        dịch vụ</a></li>
                                    <li><a href="terms.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Chính
                                        sách
                                        bảo mật</a></li>
                                    <li><a href="terms.html"
                                        className="text-white/60 text-sm hover:text-accent transition-colors duration-300">Cookie</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/*  Bottom Bar  */}
                        <div
                            className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-white/40 text-sm">© 2024 Aoklevart. Nhóm 8386.</p>
                            <div className="flex items-center gap-6">
                                <span className="text-white/40 text-sm">Ngôn ngữ: Tiếng Việt</span>
                                <span className="text-white/40 text-sm">VND (₫)</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <div id="gallery-modal" className="fixed inset-0 z-50 hidden bg-black/90 overflow-y-auto">
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="fixed top-4 right-4 z-50">
                        <button id="close-gallery-btn"
                            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                            <span className="material-symbols-outlined !text-2xl">close</span>
                        </button>
                    </div>

                    <div className="relative w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col gap-2">
                        <div id="gallery-main-image-container"
                            className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                        </div>

                        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                            <button id="gallery-prev"
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto">
                                <span className="material-symbols-outlined !text-2xl">chevron_left</span>
                            </button>
                            <button id="gallery-next"
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto">
                                <span className="material-symbols-outlined !text-2xl">chevron_right</span>
                            </button>
                        </div>
                        <div
                            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
                            <span id="gallery-counter">1 / 1</span>
                        </div>

                        <div id="gallery-thumbnails" className="flex-shrink-0 h-16 flex gap-2 overflow-x-auto py-1 justify-center">
                        </div>
                    </div>
                </div>
            </div>

            <div id="amenities-modal" className="fixed inset-0 z-50 hidden bg-black/50 overflow-y-auto">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div
                        className="bg-white dark:bg-background-dark w-full max-w-4xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-xl font-bold text-neutral-700 dark:text-white">Tiện nghi</h2>
                            <button id="close-amenities-btn"
                                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                                <span className="material-symbols-outlined text-neutral-700 dark:text-white">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div id="amenities-modal-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            </div>
                        </div>
                    </div>
                </div>
            </div>








        </div>
    );
}
