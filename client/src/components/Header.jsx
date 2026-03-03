import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form states
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            } else {
                setCurrentUser(null);
            }
        };

        // Check initially
        checkUser();

        // Listen for dynamic updates (like from the Profile page)
        window.addEventListener('userUpdated', checkUser);

        return () => {
            window.removeEventListener('userUpdated', checkUser);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Save to local storage
                setCurrentUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('token', data.token); // Store JWT token
                setIsLoginOpen(false);
                setLoginEmail('');
                setLoginPassword('');
            } else {
                setLoginError(data.message || 'Email hoặc mật khẩu không chính xác.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Lỗi kết nối máy chủ');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        if (!regFirstName || !regLastName || !regEmail || !regPassword) {
            setRegError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: regFirstName,
                    lastName: regLastName,
                    email: regEmail,
                    password: regPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setRegSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
                setTimeout(() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                    setRegSuccess('');
                }, 1500);
            } else {
                setRegError(data.message || 'Có lỗi xảy ra.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setRegError('Lỗi kết nối máy chủ');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        if (location.pathname === '/profile') {
            navigate('/');
        }
    };

    const openLogin = () => {
        setIsLoginOpen(true);
        setIsRegisterOpen(false);
        setIsMobileMenuOpen(false);
    };

    const openRegister = () => {
        setIsRegisterOpen(true);
        setIsLoginOpen(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 z-50 w-full bg-cream/95 backdrop-blur-lg border-b border-light-border transition-all duration-500">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary rounded-lg transform rotate-45 group-hover:rotate-[50deg] transition-transform duration-500"></div>
                                <span className="relative text-white font-display font-bold text-lg">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-xl font-semibold text-primary tracking-tight">Aoklevart</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-warm-gray font-medium -mt-0.5">Luxury Stays</span>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden lg:flex items-center gap-10">
                            <a href="/#featured-properties-section" className="nav-link text-sm font-medium text-charcoal hover:text-primary transition-colors duration-300">
                                Chỗ ở
                            </a>
                            <a href="/#destinations-section" className="nav-link text-sm font-medium text-charcoal hover:text-primary transition-colors duration-300">
                                Điểm đến
                            </a>
                            <a href="/#about-section" className="nav-link text-sm font-medium text-charcoal hover:text-primary transition-colors duration-300">
                                Về chúng tôi
                            </a>
                        </nav>

                        {/* Action Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <a href="#" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-charcoal hover:text-primary transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">home_work</span>
                                <span>Đăng cho thuê</span>
                            </a>
                            {!currentUser ? (
                                <>
                                    <button onClick={openLogin} className="px-5 py-2.5 text-sm font-medium text-charcoal hover:text-primary transition-colors duration-300">
                                        Đăng nhập
                                    </button>
                                    <button onClick={openRegister} className="btn-premium px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light hover:shadow-elegant transition-all duration-300">
                                        Đăng ký
                                    </button>
                                </>
                            ) : (
                                <div className="relative group cursor-pointer">
                                    <div className="flex items-center gap-3 py-2">
                                        <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-neutral-200" />
                                        <span className="text-sm font-medium text-charcoal">{currentUser.name}</span>
                                    </div>
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                        <div className="p-2 flex flex-col">
                                            <Link to="/profile" className="px-4 py-2 hover:bg-neutral-50 rounded-lg text-sm text-charcoal font-medium">Thông tin</Link>
                                            <a href="#" className="px-4 py-2 hover:bg-neutral-50 rounded-lg text-sm text-charcoal font-medium">Lịch sử</a>
                                            <hr className="my-1 border-neutral-100" />
                                            <button onClick={handleLogout} className="px-4 py-2 hover:bg-red-50 text-left rounded-lg text-sm text-red-500 font-medium transition-colors">
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-charcoal hover:bg-neutral-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 z-50 bg-white transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 lg:hidden`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <span className="font-display text-xl font-bold text-primary">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-charcoal hover:bg-neutral-100 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <nav className="flex flex-col gap-4">
                                <a href="/#featured-properties-section" className="text-lg font-medium text-charcoal hover:text-primary">Chỗ ở</a>
                                <a href="/#destinations-section" className="text-lg font-medium text-charcoal hover:text-primary">Điểm đến</a>
                                <a href="/#about-section" className="text-lg font-medium text-charcoal hover:text-primary">Về chúng tôi</a>
                            </nav>
                            <hr className="border-neutral-100" />
                            <div className="flex flex-col gap-4">
                                <a href="#" className="flex items-center gap-3 text-lg font-medium text-charcoal hover:text-primary">
                                    <span className="material-symbols-outlined">home_work</span>
                                    Đăng cho thuê
                                </a>
                                {!currentUser ? (
                                    <>
                                        <button onClick={openLogin} className="w-full py-3 text-center border border-neutral-200 rounded-xl font-medium text-charcoal hover:bg-neutral-50">
                                            Đăng nhập
                                        </button>
                                        <button onClick={openRegister} className="w-full py-3 text-center bg-primary text-white rounded-xl font-medium hover:bg-primary-light shadow-lg shadow-primary/20">
                                            Đăng ký
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 py-3">
                                            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-neutral-200" />
                                            <span className="text-lg font-medium text-charcoal">{currentUser.name}</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Link to="/profile" className="w-full py-3 text-center border border-neutral-200 text-charcoal rounded-xl font-medium hover:bg-neutral-50 transition-colors">
                                                Thông tin
                                            </Link>
                                            <a href="#" className="w-full py-3 text-center border border-neutral-200 text-charcoal rounded-xl font-medium hover:bg-neutral-50 transition-colors">
                                                Lịch sử
                                            </a>
                                            <hr className="border-neutral-100" />
                                            <button onClick={handleLogout} className="w-full py-3 text-center border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors">
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Modal */}
            {isLoginOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsLoginOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in-up">
                        <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors">
                            <span className="material-symbols-outlined text-neutral-500">close</span>
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-charcoal mb-2">Chào mừng trở lại</h2>
                                <p className="text-warm-gray text-sm">Đăng nhập để tiếp tục trải nghiệm</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleLogin}>
                                {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="name@example.com" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-1.5">Mật khẩu</label>
                                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-neutral-300 text-primary focus:ring-primary" />
                                        <span className="text-warm-gray">Ghi nhớ đăng nhập</span>
                                    </label>
                                    <a href="#" className="text-primary font-medium hover:underline">Quên mật khẩu?</a>
                                </div>

                                <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
                                    Đăng nhập
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                        <span className="text-sm font-medium text-charcoal">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                                        <span className="text-sm font-medium text-charcoal">Facebook</span>
                                    </button>
                                </div>
                            </div>

                            <p className="mt-8 text-center text-sm text-warm-gray">
                                Chưa có tài khoản?{' '}
                                <button onClick={openRegister} className="text-primary font-bold hover:underline">Đăng ký ngay</button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {isRegisterOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsRegisterOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in-up">
                        <button onClick={() => setIsRegisterOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors">
                            <span className="material-symbols-outlined text-neutral-500">close</span>
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-charcoal mb-2">Tạo tài khoản mới</h2>
                                <p className="text-warm-gray text-sm">Tham gia cộng đồng Aoklevart ngay hôm nay</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleRegister}>
                                {regError && <p className="text-red-500 text-sm text-center">{regError}</p>}
                                {regSuccess && <p className="text-green-500 text-sm text-center">{regSuccess}</p>}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1.5">Họ</label>
                                        <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required placeholder="Nguyễn" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1.5">Tên</label>
                                        <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} required placeholder="Văn A" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="name@example.com" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-1.5">Mật khẩu</label>
                                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-primary transition-colors bg-neutral-50" />
                                </div>

                                <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
                                    Đăng ký tài khoản
                                </button>
                            </form>

                            <p className="mt-6 text-center text-xs text-warm-gray px-4">
                                Bằng việc đăng ký, bạn đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a> & <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> của chúng tôi.
                            </p>

                            <p className="mt-8 text-center text-sm text-warm-gray">
                                Đã có tài khoản?{' '}
                                <button onClick={openLogin} className="text-primary font-bold hover:underline">Đăng nhập</button>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
