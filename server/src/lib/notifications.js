import db from './db';

const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const TOKEN_PREFIXES = ['ExponentPushToken[', 'ExpoPushToken['];

let tablesReady = false;

export function isExpoPushToken(token) {
    return typeof token === 'string' && TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}

export async function ensureNotificationTables() {
    if (tablesReady) return;

    await db.execute(`
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            expo_push_token VARCHAR(255) NOT NULL UNIQUE,
            platform VARCHAR(30),
            device_id VARCHAR(120),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_push_tokens_user_active (user_id, is_active)
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS notification_campaigns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            audience VARCHAR(50) NOT NULL DEFAULT 'all',
            data_json TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'sent',
            created_by INT,
            sent_count INT NOT NULL DEFAULT 0,
            failed_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            campaign_id INT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'general',
            data_json TEXT,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            sent_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL,
            FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_notifications_user_created (user_id, created_at),
            INDEX idx_notifications_user_read (user_id, is_read)
        )
    `);

    tablesReady = true;
}

function safeJson(value) {
    if (!value) return null;
    return JSON.stringify(value);
}

function parseJson(value) {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

export async function registerPushToken(userId, payload) {
    await ensureNotificationTables();

    const token = payload?.expo_push_token || payload?.expoPushToken;
    if (!isExpoPushToken(token)) {
        const error = new Error('Expo push token khong hop le.');
        error.status = 400;
        throw error;
    }

    await db.execute(
        `INSERT INTO push_tokens (user_id, expo_push_token, platform, device_id, is_active)
         VALUES (?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            platform = VALUES(platform),
            device_id = VALUES(device_id),
            is_active = TRUE,
            last_seen_at = CURRENT_TIMESTAMP`,
        [userId, token, payload?.platform || null, payload?.device_id || payload?.deviceId || null]
    );

    return { expo_push_token: token };
}

export async function unregisterPushToken(userId, token) {
    await ensureNotificationTables();

    if (!token) return;
    await db.execute(
        'UPDATE push_tokens SET is_active = FALSE WHERE user_id = ? AND expo_push_token = ?',
        [userId, token]
    );
}

export async function listNotifications(userId) {
    await ensureNotificationTables();

    const [rows] = await db.execute(
        `SELECT id, title, body, type, data_json, is_read, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
    );

    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        data: parseJson(row.data_json),
        unread: !row.is_read,
        created_at: row.created_at,
    }));
}

export async function markNotificationsRead(userId, ids = []) {
    await ensureNotificationTables();

    if (Array.isArray(ids) && ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        await db.execute(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND id IN (${placeholders})`,
            [userId, ...ids.map(Number)]
        );
        return;
    }

    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
}

async function getActiveTokens(userIds) {
    if (!userIds.length) return [];

    const placeholders = userIds.map(() => '?').join(',');
    const [tokens] = await db.execute(
        `SELECT user_id, expo_push_token
         FROM push_tokens
         WHERE is_active = TRUE AND user_id IN (${placeholders})`,
        userIds
    );
    return tokens.filter((row) => isExpoPushToken(row.expo_push_token));
}

async function deactivateToken(token) {
    await db.execute('UPDATE push_tokens SET is_active = FALSE WHERE expo_push_token = ?', [token]);
}

async function sendExpoMessages(messages) {
    if (!messages.length) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        const headers = {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        };
        if (process.env.EXPO_PUSH_ACCESS_TOKEN) {
            headers.Authorization = `Bearer ${process.env.EXPO_PUSH_ACCESS_TOKEN}`;
        }

        try {
            const response = await fetch(PUSH_ENDPOINT, {
                method: 'POST',
                headers,
                body: JSON.stringify(chunk),
            });
            const result = await response.json().catch(() => ({}));
            const tickets = Array.isArray(result.data) ? result.data : [];

            tickets.forEach((ticket, index) => {
                if (ticket.status === 'ok') {
                    sent += 1;
                    return;
                }
                failed += 1;
                if (ticket.details?.error === 'DeviceNotRegistered') {
                    void deactivateToken(chunk[index].to);
                }
            });

            if (!response.ok || result.errors) {
                failed += Math.max(0, chunk.length - tickets.length);
            }
        } catch (err) {
            console.error('[push] Expo send failed:', err);
            failed += chunk.length;
        }
    }

    return { sent, failed };
}

export async function createNotificationForUsers(userIds, notification) {
    await ensureNotificationTables();

    const uniqueUserIds = [...new Set(userIds.map(Number).filter(Boolean))];
    if (!uniqueUserIds.length) return { sent: 0, failed: 0, recipients: 0 };

    const values = uniqueUserIds.map((userId) => [
        userId,
        notification.campaign_id || null,
        notification.title,
        notification.body,
        notification.type || 'general',
        safeJson(notification.data),
        notification.sent_by || null,
    ]);

    await db.query(
        `INSERT INTO notifications (user_id, campaign_id, title, body, type, data_json, sent_by)
         VALUES ?`,
        [values]
    );

    const tokens = await getActiveTokens(uniqueUserIds);
    const messages = tokens.map((row) => ({
        to: row.expo_push_token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: {
            type: notification.type || 'general',
            ...(notification.data || {}),
        },
    }));
    const result = await sendExpoMessages(messages);

    if (global.io) {
        uniqueUserIds.forEach((userId) => {
            global.io.to(`user_${userId}`).emit('notificationCreated', {
                title: notification.title,
                body: notification.body,
                type: notification.type || 'general',
            });
        });
    }

    return { ...result, recipients: uniqueUserIds.length };
}

export async function sendBookingStatusNotification(bookingId, status, sentBy = null) {
    await ensureNotificationTables();

    const [rows] = await db.execute(
        `SELECT b.customer_id, b.id, p.name AS property_name
         FROM bookings b
         LEFT JOIN properties p ON b.property_id = p.id
         WHERE b.id = ?`,
        [bookingId]
    );
    const booking = rows[0];
    if (!booking?.customer_id) return { sent: 0, failed: 0, recipients: 0 };

    const statusLabel = status || 'updated';
    return createNotificationForUsers([booking.customer_id], {
        title: `Booking #${booking.id} da cap nhat`,
        body: `Trang thai dat phong tai ${booking.property_name || 'Aoklevart'}: ${statusLabel}.`,
        type: 'booking_status',
        data: { bookingId: Number(booking.id), status: statusLabel },
        sent_by: sentBy,
    });
}

export async function sendAdminNotification({ title, body, audience = 'all', userIds = [], sentBy }) {
    await ensureNotificationTables();

    let recipients = [];
    if (audience === 'selected') {
        recipients = userIds.map(Number).filter(Boolean);
    } else if (audience === 'customers') {
        const [rows] = await db.execute("SELECT id FROM users WHERE role = 'customer'");
        recipients = rows.map((row) => row.id);
    } else if (audience === 'hosts') {
        const [rows] = await db.execute("SELECT id FROM users WHERE role = 'host'");
        recipients = rows.map((row) => row.id);
    } else {
        const [rows] = await db.execute('SELECT id FROM users');
        recipients = rows.map((row) => row.id);
    }

    const [campaign] = await db.execute(
        `INSERT INTO notification_campaigns (title, body, audience, data_json, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [title, body, audience, safeJson({ userIds }), sentBy || null]
    );

    const result = await createNotificationForUsers(recipients, {
        campaign_id: campaign.insertId,
        title,
        body,
        type: 'admin_broadcast',
        data: { campaignId: campaign.insertId, audience },
        sent_by: sentBy,
    });

    await db.execute(
        'UPDATE notification_campaigns SET sent_count = ?, failed_count = ? WHERE id = ?',
        [result.sent, result.failed, campaign.insertId]
    );

    return { ...result, campaign_id: campaign.insertId };
}
