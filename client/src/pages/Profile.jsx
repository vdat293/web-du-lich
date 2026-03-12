import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarBase64, setAvatarBase64] = useState('');
    const [favoriteProperties, setFavoriteProperties] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const activeSection = location.hash === '#favorites' ? 'favorites' : 'info';

    useEffect(() => {
        // Lấy thông tin user từ local storage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setName(parsedUser.name || '');
            setPhone(parsedUser.phone || '');
            setAvatarBase64('');
        } else {
            // Nếu chưa đăng nhập thì đẩy về trang chủ
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const loadFavorites = () => {
            const stored = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
            setFavoriteProperties(stored);
        };

        loadFavorites();
        window.addEventListener('favoritesUpdated', loadFavorites);
        return () => window.removeEventListener('favoritesUpdated', loadFavorites);
    }, []);

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
        setFavoriteProperties(storedFavorites);

        const handleStorageUpdate = () => {
            const updated = JSON.parse(localStorage.getItem('favoriteProperties') || '[]');
            setFavoriteProperties(updated);
        };

        window.addEventListener('favoritesUpdated', handleStorageUpdate);
        return () => window.removeEventListener('favoritesUpdated', handleStorageUpdate);
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, phone, avatarBase64 })
            });

            const data = await response.json();

            if (response.ok) {
                // Thành công
                setMessage('Cập nhật thông tin thành công!');
                setUser(data.user);
                // Cập nhật lại local storage để App và Header nhận diện
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                // Kích phát sự kiện cho component Header tự động reload
                window.dispatchEvent(new Event('userUpdated'));
            } else {
                setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật:', err);
            setError('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Tạo một ảnh để lấy kích thước
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    // Resize lại ảnh cho nhẹ (tối đa 300px)
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Xuất ra base64 với chất lượng giảm bằng JPEG (0.7) để tránh lỗi quá tải server
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setAvatarBase64(compressedBase64);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null; // đang check chuyển trang

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-20">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="bg-primary/5 px-6 py-8 border-b border-neutral-100 text-center">
                        <div className="inline-block relative group cursor-pointer">
                            <label htmlFor="avatar-upload" className="cursor-pointer block">
                                <img
                                    src={avatarBase64 || user.avatar}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover group-hover:opacity-75 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-md">Thay đổi</span>
                                </div>
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-charcoal">{user.name}</h2>
                        <p className="text-neutral-500">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
                            {user.role}
                        </span>
                        <div className="mt-4">
                            <Link
                                to="/bookings"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-neutral-200 text-charcoal rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined !text-base">calendar_month</span>
                                Lịch sử đặt phòng
                            </Link>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        {activeSection === 'info' ? (
                            <>
                                <h3 className="text-xl font-semibold text-charcoal mb-6">Thông tin cá nhân</h3>

                                {message && (
                                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                                        {message}
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl text-sm border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">
                                                Họ và tên
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder="Nhập họ và tên..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder="Nhập số điện thoại..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            Địa chỉ Email (Không thể thay đổi)
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end pt-4 border-t border-neutral-100">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-8 py-3 bg-primary text-white rounded-xl font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-charcoal">Phòng yêu thích</h3>
                                    <span className="text-sm text-neutral-400">
                                        {favoriteProperties.length} mục
                                    </span>
                                </div>

                                {favoriteProperties.length === 0 ? (
                                    <div className="border border-dashed border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
                                        <span className="material-symbols-outlined !text-5xl mb-3">favorite</span>
                                        <p className="text-sm">Bạn chưa lưu phòng nào.</p>
                                        <Link
                                            to="/"
                                            className="inline-flex mt-4 items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            Khám phá chỗ ở
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {favoriteProperties.map((fav) => (
                                            <Link
                                                key={fav.id}
                                                to={`/details/${fav.id}`}
                                                className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="relative h-40 bg-neutral-100">
                                                    {fav.image ? (
                                                        <img
                                                            src={fav.image}
                                                            alt={fav.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                            <span className="material-symbols-outlined !text-5xl">home</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                                                        {fav.name}
                                                    </h4>
                                                    <p className="text-sm text-neutral-500 mt-1">{fav.location}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <p className="text-primary font-semibold text-sm">{fav.price}</p>
                                                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                                                            <span className="material-symbols-outlined text-accent text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                                star
                                                            </span>
                                                            <span>{fav.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
