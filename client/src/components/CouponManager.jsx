import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { couponService } from '../utils/api';

const today = () => new Date().toISOString().slice(0, 10);

const dateAfter = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

const emptyForm = (hostMode) => ({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: today(),
    valid_until: dateAfter(30),
    is_enabled: true,
    property_ids: hostMode ? [] : undefined,
});

function getStatus(coupon) {
    const currentDate = today();
    if (!coupon.is_enabled) return { label: 'Đã tắt', className: 'bg-gray-100 text-gray-600' };
    if (coupon.valid_until < currentDate) return { label: 'Hết hạn', className: 'bg-red-100 text-red-700' };
    if (coupon.valid_from > currentDate) return { label: 'Sắp diễn ra', className: 'bg-blue-100 text-blue-700' };
    if (coupon.max_uses != null && Number(coupon.used_count) >= Number(coupon.max_uses)) {
        return { label: 'Hết lượt', className: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Đang chạy', className: 'bg-green-100 text-green-700' };
}

function errorMessage(error) {
    return error.response?.data?.message || 'Không thể hoàn tất yêu cầu.';
}

function normalizeCoupon(coupon) {
    return {
        ...coupon,
        discount_value: Number(coupon.discount_value),
        min_order_amount: coupon.min_order_amount == null ? null : Number(coupon.min_order_amount),
        max_uses: coupon.max_uses == null ? null : Number(coupon.max_uses),
        used_count: Number(coupon.used_count || 0),
        is_enabled: coupon.is_enabled !== false && coupon.is_enabled !== 0,
        properties: Array.isArray(coupon.properties) ? coupon.properties : [],
    };
}

export default function CouponManager({ mode = 'admin', properties = [] }) {
    const isHost = mode === 'host';
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm(isHost));

    const loadCoupons = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = isHost ? await couponService.listHost() : await couponService.listAdmin();
            const items = response.data?.coupons || response.data || [];
            setCoupons(items.map(normalizeCoupon));
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [isHost]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    const filteredCoupons = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return coupons.filter((coupon) => {
            const matchesSearch = !normalizedSearch
                || coupon.code.toLowerCase().includes(normalizedSearch)
                || (coupon.description || '').toLowerCase().includes(normalizedSearch)
                || coupon.properties.some((property) => property.name.toLowerCase().includes(normalizedSearch));
            const status = getStatus(coupon);
            const statusKey = status.label === 'Đang chạy'
                ? 'active'
                : status.label === 'Sắp diễn ra'
                    ? 'upcoming'
                    : status.label === 'Hết lượt'
                        ? 'exhausted'
                        : status.label === 'Hết hạn'
                            ? 'expired'
                            : 'disabled';
            return matchesSearch && (!statusFilter || statusFilter === statusKey);
        });
    }, [coupons, search, statusFilter]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm(isHost));
        setError('');
        setShowModal(true);
    };

    const openEdit = (coupon) => {
        setEditing(coupon);
        setForm({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_amount: coupon.min_order_amount ?? '',
            max_uses: coupon.max_uses ?? '',
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            is_enabled: coupon.is_enabled,
            property_ids: coupon.properties.map((property) => Number(property.id)),
        });
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        if (!saving) setShowModal(false);
    };

    const updateForm = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

    const toggleProperty = (propertyId) => {
        const id = Number(propertyId);
        setForm((previous) => ({
            ...previous,
            property_ids: previous.property_ids.includes(id)
                ? previous.property_ids.filter((currentId) => currentId !== id)
                : [...previous.property_ids, id],
        }));
    };

    const saveCoupon = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            code: form.code,
            description: form.description,
            discount_type: form.discount_type,
            discount_value: Number(form.discount_value),
            min_order_amount: form.min_order_amount === '' ? null : Number(form.min_order_amount),
            max_uses: form.max_uses === '' ? null : Number(form.max_uses),
            valid_from: form.valid_from,
            valid_until: form.valid_until,
            is_enabled: form.is_enabled,
        };
        if (isHost) payload.property_ids = form.property_ids;

        try {
            if (editing) {
                if (isHost) await couponService.updateHost(editing.id, payload);
                else await couponService.updateAdmin(editing.id, payload);
            } else if (isHost) {
                await couponService.createHost(payload);
            } else {
                await couponService.createAdmin(payload);
            }
            setShowModal(false);
            await loadCoupons();
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const deleteCoupon = async (coupon) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa mã ${coupon.code}?`)) return;
        setError('');
        try {
            if (isHost) await couponService.deleteHost(coupon.id);
            else await couponService.deleteAdmin(coupon.id);
            await loadCoupons();
        } catch (requestError) {
            setError(errorMessage(requestError));
        }
    };

    const formatPrice = (value) => Number(value || 0).toLocaleString('vi-VN');

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý khuyến mãi</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isHost ? 'Coupon chỉ áp dụng cho các chỗ nghỉ bạn sở hữu.' : 'Coupon phạm vi toàn hệ thống.'}
                    </p>
                </div>
                <button onClick={openCreate} className="px-4 py-2.5 bg-primary text-white rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90">
                    <span className="material-symbols-outlined">add</span>
                    Thêm khuyến mãi
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')} className="font-bold">&times;</button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm theo mã, mô tả hoặc property..."
                    className="flex-1 min-w-[220px] px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary"
                />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Đang chạy</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="exhausted">Hết lượt</option>
                    <option value="expired">Hết hạn</option>
                    <option value="disabled">Đã tắt</option>
                </select>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-500">Đang tải khuyến mãi...</div>
            ) : filteredCoupons.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
                    <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">local_offer</span>
                    {coupons.length === 0 ? 'Chưa có khuyến mãi nào.' : 'Không có khuyến mãi phù hợp.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredCoupons.map((coupon) => {
                        const status = getStatus(coupon);
                                        return (
                                            <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-black text-primary text-lg tracking-wide">{coupon.code}</span>
                                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">{coupon.scope_type === 'host' ? 'Host' : 'System'}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.className}`}>{status.label}</span>
                                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 min-h-5">{coupon.description || 'Chưa có mô tả.'}</p>
                                    </div>
                                    {(isHost || coupon.scope_type !== 'host') && <div className="flex gap-1 shrink-0">
                                        <button onClick={() => openEdit(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => deleteCoupon(coupon)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 text-sm">
                                    <div><p className="text-xs text-gray-400">Mức giảm</p><p className="font-bold text-gray-800">{coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `${formatPrice(coupon.discount_value)}₫`}</p></div>
                                    <div><p className="text-xs text-gray-400">Đơn tối thiểu</p><p className="font-bold text-gray-800">{coupon.min_order_amount == null ? 'Không' : `${formatPrice(coupon.min_order_amount)}₫`}</p></div>
                                    <div><p className="text-xs text-gray-400">Đã dùng</p><p className="font-bold text-gray-800">{coupon.used_count} / {coupon.max_uses == null ? '∞' : coupon.max_uses}</p></div>
                                    <div><p className="text-xs text-gray-400">Thời gian</p><p className="font-bold text-gray-800">{coupon.valid_from} → {coupon.valid_until}</p></div>
                                </div>
                                {coupon.properties.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {coupon.properties.map((property) => <span key={property.id} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold">{property.name}</span>)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <form onSubmit={saveCoupon} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{editing ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}</h3>
                                <p className="text-xs text-gray-500 mt-1">Phạm vi: {isHost ? 'Host' : 'Toàn hệ thống'}</p>
                            </div>
                            <button type="button" onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="sm:col-span-2 text-sm font-semibold text-gray-700">Mã khuyến mãi *
                                <input required value={form.code} onChange={(event) => updateForm('code', event.target.value.toUpperCase())} placeholder="VD: SUMMER2026" className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg uppercase" />
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Loại giảm giá *
                                <select value={form.discount_type} onChange={(event) => updateForm('discount_type', event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg">
                                    <option value="percent">Phần trăm (%)</option><option value="fixed">Số tiền (VND)</option>
                                </select>
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Mức giảm *
                                <input required min="0.01" max={form.discount_type === 'percent' ? 100 : undefined} step="0.01" type="number" value={form.discount_value} onChange={(event) => updateForm('discount_value', event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Đơn tối thiểu
                                <input min="0" step="1" type="number" value={form.min_order_amount} onChange={(event) => updateForm('min_order_amount', event.target.value)} placeholder="Không giới hạn" className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Số lượt tối đa
                                <input min="1" step="1" type="number" value={form.max_uses} onChange={(event) => updateForm('max_uses', event.target.value)} placeholder="Không giới hạn" className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Bắt đầu *
                                <input required type="date" value={form.valid_from} onChange={(event) => updateForm('valid_from', event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                            </label>
                            <label className="text-sm font-semibold text-gray-700">Kết thúc *
                                <input required type="date" value={form.valid_until} onChange={(event) => updateForm('valid_until', event.target.value)} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                            </label>
                            <label className="sm:col-span-2 text-sm font-semibold text-gray-700">Mô tả
                                <textarea rows="3" value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Điều kiện hoặc nội dung ưu đãi" className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg resize-none" />
                            </label>
                        </div>

                        {isHost && (
                            <fieldset className="mt-5">
                                <legend className="text-sm font-bold text-gray-700 mb-2">Áp dụng cho property * ({form.property_ids.length} đã chọn)</legend>
                                {properties.length === 0 ? <p className="text-sm text-red-600">Bạn chưa có property để gắn coupon.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-3">{properties.map((property) => <label key={property.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm"><input type="checkbox" checked={form.property_ids.includes(Number(property.id))} onChange={() => toggleProperty(property.id)} /><span>{property.name}</span></label>)}</div>}
                            </fieldset>
                        )}
                        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.is_enabled} onChange={(event) => updateForm('is_enabled', event.target.checked)} /> Đang bật và cho phép áp dụng</label>

                        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-600">Hủy</button>
                            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu khuyến mãi'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
