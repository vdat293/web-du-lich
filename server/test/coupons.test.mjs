import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// The server uses Next's ESM route compilation while package.json remains
// CommonJS for migration scripts. Loading this dependency-free helper through
// a data URL keeps these tests lightweight and avoids a test transpiler.
const source = fs.readFileSync(new URL('../src/lib/coupons.js', import.meta.url), 'utf8');
const coupons = await import(`data:text/javascript,${encodeURIComponent(source)}`);

test('validates real calendar dates, not only YYYY-MM-DD shape', () => {
    const valid = coupons.validateCoupon({
        code: 'SPRING-2026',
        discount_type: 'percent',
        discount_value: 10,
        valid_from: '2026-02-28',
        valid_until: '2026-03-31',
    });
    assert.equal(valid.error, undefined);

    const invalid = coupons.validateCoupon({
        code: 'SPRING-2026',
        discount_type: 'percent',
        discount_value: 10,
        valid_from: '2026-02-30',
        valid_until: '2026-03-31',
    });
    assert.match(invalid.error, /Khoảng ngày/);
});

test('enforces minimum order and caps the discount at the order amount', () => {
    const coupon = { discount_type: 'fixed', discount_value: 5000, min_order_amount: 1000 };
    assert.equal(coupons.calculateCouponDiscount(coupon, 999).valid, false);
    assert.deepEqual(coupons.calculateCouponDiscount(coupon, 3000), {
        valid: true,
        discount_amount: 3000,
        final_price: 0,
    });
});

test('preserves disabled state and scopes host validation by property owner', async () => {
    const disabled = coupons.attachCouponProperties(
        [{ id: 1, is_enabled: 0, discount_value: 10, used_count: 0 }],
        new Map([[1, []]])
    );
    assert.equal(disabled[0].is_enabled, false);

    let query = '';
    let params = [];
    const connection = {
        execute: async (sql, values) => {
            query = sql;
            params = values;
            return [[{
                id: 2,
                code: 'HOST10',
                discount_type: 'percent',
                discount_value: 10,
                min_order_amount: 0,
            }]];
        },
    };
    const result = await coupons.findApplicableCoupon(connection, {
        code: 'host10',
        propertyId: 42,
        amount: 100000,
        userId: 7,
    });

    assert.equal(result.discount_amount, 10000);
    assert.deepEqual(params, ['HOST10', 42, 42, 7, 100000]);
    assert.match(query, /coupon_properties/);
    assert.match(query, /p_scope\.host_id = c\.owner_id/);
    assert.match(query, /COALESCE\(c\.is_enabled, 1\) = 1/);
});
