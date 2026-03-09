import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const propertyId = parseInt(searchParams.get('id'));
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const roomTypeParam = searchParams.get('roomType');

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountMessage, setDiscountMessage] = useState({ text: '', type: '' });

    const [specialRequests, setSpecialRequests] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            if (propertyId) {
                try {
                    const res = await fetch('http://localhost:3000/api/properties');
                    if (res.ok) {
                        const data = await res.json();
                        const p = data.find(p => p.id === propertyId);
                        if (p) {
                            setProperty(p);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi tải thông tin chỗ ở:', error);
                }
            }
            setLoading(false);
        };
        fetchProperties();
    }, [propertyId]);

    const discountCodes = {
        'GIAM10': { type: 'percent', value: 10 },
        'GIAM20': { type: 'percent', value: 20 },
        'GIAM50K': { type: 'fixed', value: 50000 },
        'WELCOME': { type: 'percent', value: 15 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display bg-background-light text-neutral-700">
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-display bg-background-light text-neutral-700">
                <h2 className="text-2xl font-bold text-red-600">Không tìm thấy thông tin đặt phòng</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold">
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    // Price calculations
    const priceString = property.price.replace(/\./g, '').replace('₫', '');
    const pricePerNightBase = parseInt(priceString);

    let checkInDate = checkInParam ? new Date(checkInParam) : new Date();
    let checkOutDate = checkOutParam ? new Date(checkOutParam) : new Date(Date.now() + 86400000); // 1 night default

    if (isNaN(checkInDate.getTime())) checkInDate = new Date();
    if (isNaN(checkOutDate.getTime())) checkOutDate = new Date(Date.now() + 86400000);

    const timeDiff = checkOutDate - checkInDate;
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    let roomMultiplier = 1;
    let roomTypeText = 'Phòng đơn';
    if (roomTypeParam === 'double') {
        roomMultiplier = 1.3;
        roomTypeText = 'Phòng đôi';
    } else if (roomTypeParam === 'quad') {
        roomMultiplier = 1.5;
        roomTypeText = 'Phòng 4 người';
    }

    const pricePerNight = Math.round(pricePerNightBase * roomMultiplier);
    const totalBase = pricePerNight * nights;
    const serviceFee = Math.round(totalBase * 0.1);
    const initialTotal = totalBase + serviceFee;

    let discountAmount = 0;
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percent') {
            discountAmount = Math.round(initialTotal * (appliedDiscount.value / 100));
        } else {
            discountAmount = appliedDiscount.value;
        }
    }

    const total = initialTotal - discountAmount;

    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleApplyDiscount = () => {
        const code = discountCode.trim().toUpperCase();
        if (!code) {
            setDiscountMessage({ text: 'Vui lòng nhập mã giảm giá', type: 'error' });
            return;
        }
        if (discountCodes[code]) {
            setAppliedDiscount({ code, ...discountCodes[code] });
            setDiscountMessage({ text: `Áp dụng mã "${code}" thành công!`, type: 'success' });
            setDiscountCode('');
        } else {
            setDiscountMessage({ text: 'Mã giảm giá không hợp lệ hoặc đã hết hạn', type: 'error' });
            setAppliedDiscount(null);
        }
    };

    const handleConfirmPayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPaymentError('Bạn chưa đăng nhập. Vui lòng đăng nhập để đặt phòng.');
            return;
        }

        setIsProcessing(true);
        setPaymentError('');

        // Lấy room_type_id thực từ property.rooms
        const rooms = property.rooms || [];
        let roomTypeId = null;
        if (rooms.length > 0) {
            const idx = roomTypeParam === 'double' ? 1 : roomTypeParam === 'quad' ? 2 : 0;
            roomTypeId = rooms[Math.min(idx, rooms.length - 1)]?.id || rooms[0]?.id;
        }

        const formatDateForDB = (date) => {
            const y = date.getFullYear();
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const d = date.getDate().toString().padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        try {
            const res = await fetch('http://localhost:3000/api/user/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    room_type_id: roomTypeId,
                    check_in: formatDateForDB(checkInDate),
                    check_out: formatDateForDB(checkOutDate),
                    number_of_rooms: 1,
                    total_price: total,
                    special_requests: specialRequests || null,
                }),
            });

            const data = await res.json();
            setIsProcessing(false);

            if (res.ok) {
                setBookingId(data.booking_id);
                setIsSuccess(true);
            } else {
                setPaymentError(data.message || 'Đặt phòng thất bại, vui lòng thử lại.');
            }
        } catch (err) {
            setIsProcessing(false);
            setPaymentError('Lỗi kết nối máy chủ.');
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-neutral-700 dark:text-neutral-100 min-h-screen">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">

                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        <span className="material-symbols-outlined !text-2xl text-neutral-700 dark:text-white">arrow_back</span>
                    </button>
                    <h1 className="text-neutral-700 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                        Xác nhận và thanh toán
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <div className="flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-700 dark:text-white mb-4">Chuyến đi của bạn</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-neutral-700 dark:text-white">Ngày</p>
                                        <p className="text-neutral-500 dark:text-neutral-200">
                                            {formatDate(checkInDate)} – {formatDate(checkOutDate)}
                                        </p>
                                    </div>
                                    <button onClick={() => navigate(`/details/${propertyId}?checkIn=${checkInParam || ''}&checkOut=${checkOutParam || ''}&roomType=${roomTypeParam || ''}`)}
                                        className="font-bold underline text-neutral-700 dark:text-white hover:text-primary">Sửa</button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-neutral-700 dark:text-white">Loại phòng</p>
                                        <p className="text-neutral-500 dark:text-neutral-200">{roomTypeText}</p>
                                    </div>
                                    <button onClick={() => navigate(`/details/${propertyId}?checkIn=${checkInParam || ''}&checkOut=${checkOutParam || ''}&roomType=${roomTypeParam || ''}`)}
                                        className="font-bold underline text-neutral-700 dark:text-white hover:text-primary">Sửa</button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700"></div>

                        <div>
                            <h2 className="text-2xl font-bold text-neutral-700 dark:text-white mb-4">Chọn phương thức thanh toán</h2>
                            <div className="flex flex-col gap-4">
                                <div onClick={() => setPaymentMethod('card')}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-neutral-700 dark:border-white' : 'border-neutral-200 dark:border-neutral-700'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-neutral-700 dark:text-white">credit_card</span>
                                            </div>
                                            <p className="font-bold text-neutral-700 dark:text-white">Thẻ tín dụng/ghi nợ</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-neutral-500 dark:border-neutral-200'}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                                        </div>
                                    </div>
                                </div>

                                <div onClick={() => setPaymentMethod('momo')}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-neutral-700 dark:border-white' : 'border-neutral-200 dark:border-neutral-700'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded-md bg-white flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                                <img src="/assets/MoMo_Logo_Primary/MOMO-Logo-App.png" alt="MoMo Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="font-bold text-neutral-700 dark:text-white">Ví MoMo</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'momo' ? 'border-primary' : 'border-neutral-500 dark:border-neutral-200'}`}>
                                            {paymentMethod === 'momo' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700"></div>

                        <div>
                            <h2 className="text-2xl font-bold text-neutral-700 dark:text-white mb-4">Thông tin cần thiết cho chuyến đi</h2>
                            <div>
                                <p className="font-bold text-neutral-700 dark:text-white mb-1">Tin nhắn cho chủ nhà</p>
                                <p className="text-neutral-500 dark:text-neutral-200 text-sm">Cho chủ nhà biết lý do bạn đi du lịch và bạn sẽ đi cùng ai.</p>
                                <textarea
                                    className="mt-2 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent p-3 focus:ring-primary focus:border-primary text-neutral-700 dark:text-white"
                                    placeholder="Xin chào, chúng tôi rất mong được ở lại đây..."
                                    rows="4"
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}></textarea>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700"></div>

                        <div>
                            <h2 className="text-2xl font-bold text-neutral-700 dark:text-white mb-4">Chính sách hủy</h2>
                            <p className="text-neutral-500 dark:text-neutral-200 leading-relaxed">
                                Miễn phí hủy trước 14:00 ngày 14/08. Hủy trước 14:00 ngày 15/08 để được hoàn lại 50%. <a className="font-bold underline text-neutral-700 dark:text-white hover:text-primary" href="#">Tìm hiểu thêm</a>
                            </p>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700"></div>

                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-200">
                                Bằng việc chọn nút bên dưới, tôi đồng ý với <a className="font-bold underline text-neutral-700 dark:text-white hover:text-primary" href="#">Quy tắc nhà</a>, <a className="font-bold underline text-neutral-700 dark:text-white hover:text-primary" href="#">Chính sách hủy</a> và <a className="font-bold underline text-neutral-700 dark:text-white hover:text-primary" href="#">Điều khoản dịch vụ</a>.
                            </p>
                            {paymentError && (
                                <p className="mt-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    {paymentError}
                                </p>
                            )}
                            <button onClick={handleConfirmPayment}
                                className="mt-6 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 sm:w-auto">
                                <span>Xác nhận và thanh toán</span>
                            </button>
                        </div>
                    </div>

                    <div className="lg:sticky top-12 self-start">
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 flex flex-col gap-5">
                            <div className="flex gap-4 pb-5 border-b border-neutral-200 dark:border-neutral-700">
                                <div className="w-28 h-24 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url('/${property.images.main}')` }}>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-200">Biệt thự nghỉ dưỡng</p>
                                    <p className="font-bold text-neutral-700 dark:text-white mt-1">{property.name}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-accent-gold !text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="font-bold text-sm text-neutral-700 dark:text-white">{property.rating}</span>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-200">({property.reviews} đánh giá)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pb-5 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-xl font-bold text-neutral-700 dark:text-white mb-4">Chi tiết giá</h3>
                                <div className="flex flex-col gap-3 text-neutral-500 dark:text-neutral-200">
                                    <div className="flex justify-between">
                                        <span>{pricePerNight.toLocaleString('vi-VN')}₫ x {nights} đêm</span>
                                        <span>{totalBase.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí dịch vụ</span>
                                        <span>{serviceFee.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giảm giá ({appliedDiscount.code})</span>
                                            <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pb-5 border-b border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-lg font-bold text-neutral-700 dark:text-white mb-3">Mã giảm giá</h3>
                                <div className="flex gap-2">
                                    <input type="text"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                        disabled={!!appliedDiscount}
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-700 dark:text-white placeholder-neutral-400 focus:ring-primary focus:border-primary uppercase"
                                        placeholder="Nhập mã giảm giá" />
                                    <button onClick={handleApplyDiscount} disabled={!!appliedDiscount}
                                        className={`px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors ${appliedDiscount ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {appliedDiscount ? 'Đã áp dụng' : 'Áp dụng'}
                                    </button>
                                </div>
                                {discountMessage.text && (
                                    <p className={`mt-2 text-sm ${discountMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                        {discountMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between font-bold text-neutral-700 dark:text-white text-lg">
                                <span>Tổng cộng (VND)</span>
                                <span>{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Modal */}
            {isProcessing && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-neutral-700 dark:text-white mb-2">Đang xử lý thanh toán</h3>
                            <p className="text-neutral-500 dark:text-neutral-300">Vui lòng không tắt trình duyệt...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 transform transition-all scale-100 animate-fade-in-up">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 !text-5xl">check_circle</span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-neutral-700 dark:text-white mb-2">Thanh toán thành công!</h3>
                            <p className="text-neutral-500 dark:text-neutral-300">Cảm ơn bạn đã đặt phòng. Mã đặt phòng của bạn là <span className="font-bold text-primary">#{bookingId}</span></p>
                        </div>
                        <button onClick={() => navigate('/')}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                            Quay về trang chủ
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
