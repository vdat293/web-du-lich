const POINT_VALUE_VND = 1000;

export const MEMBERSHIP_TIERS = [
    { name: 'diamond', minPoints: 100000 },
    { name: 'platinum', minPoints: 50000 },
    { name: 'gold', minPoints: 10000 },
    { name: 'classic', minPoints: 0 },
];

export function getMembershipTier(points) {
    const totalPoints = Math.max(0, Number(points) || 0);
    return MEMBERSHIP_TIERS.find((tier) => totalPoints >= tier.minPoints).name;
}

export async function awardLoyaltyPoints(db, bookingId) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [bookings] = await connection.execute(
            `SELECT id, customer_id, total_price
             FROM bookings
             WHERE id = ?
             FOR UPDATE`,
            [bookingId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return null;
        }

        const booking = bookings[0];
        const amount = Math.max(0, Number(booking.total_price) || 0);
        const points = Math.floor(amount / POINT_VALUE_VND);

        const [result] = await connection.execute(
            `INSERT IGNORE INTO loyalty_transactions (user_id, booking_id, points, amount)
             VALUES (?, ?, ?, ?)`,
            [booking.customer_id, booking.id, points, amount]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        await connection.execute(
            'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?',
            [points, booking.customer_id]
        );

        const [users] = await connection.execute(
            'SELECT loyalty_points FROM users WHERE id = ? FOR UPDATE',
            [booking.customer_id]
        );
        const loyaltyPoints = Number(users[0]?.loyalty_points) || 0;
        const membershipTier = getMembershipTier(loyaltyPoints);

        await connection.execute(
            'UPDATE users SET membership_tier = ? WHERE id = ?',
            [membershipTier, booking.customer_id]
        );

        await connection.commit();
        return { pointsAwarded: points, loyaltyPoints, membershipTier };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
