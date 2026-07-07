import db from './db';

const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const TOKEN_PREFIXES = ['ExponentPushToken[', 'ExpoPushToken['];
const DEFAULT_CHANNEL = 'default';

let tablesReady = false;

export function isExpoPushToken(token) {
    return typeof token === 'string' && TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}

async function columnExists(table, column) {
    const [rows] = await db.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1`,
        [table, column]
    );
    return rows.length > 0;
}

async function indexExists(table, indexName) {
    const [rows] = await db.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND INDEX_NAME = ?
         LIMIT 1`,
        [table, indexName]
    );
    return rows.length > 0;
}

async function addColumn(table, column, definition) {
    if (await columnExists(table, column)) return;
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function addIndex(table, indexName, columns) {
    if (await indexExists(table, indexName)) return;
    await db.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columns})`);
}

export async function ensureNotificationTables() {
    if (tablesReady) return;

    await db.execute(`
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            expo_push_token VARCHAR(255) NOT NULL UNIQUE,
            provider VARCHAR(30) NOT NULL DEFAULT 'expo',
            expo_project_id VARCHAR(120),
            platform VARCHAR(30),
            device_id VARCHAR(120),
            app_version VARCHAR(40),
            permission_status VARCHAR(30),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            disabled_at TIMESTAMP NULL,
            last_error TEXT,
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
            delivered_count INT NOT NULL DEFAULT 0,
            opened_count INT NOT NULL DEFAULT 0,
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
            read_at TIMESTAMP NULL,
            opened_at TIMESTAMP NULL,
            deep_link VARCHAR(255),
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            channel VARCHAR(50) NOT NULL DEFAULT 'default',
            sent_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL,
            FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_notifications_user_created (user_id, created_at),
            INDEX idx_notifications_user_read (user_id, is_read)
        )
    `);

    await addColumn('push_tokens', 'provider', "VARCHAR(30) NOT NULL DEFAULT 'expo' AFTER expo_push_token");
    await addColumn('push_tokens', 'expo_project_id', 'VARCHAR(120) NULL AFTER provider');
    await addColumn('push_tokens', 'app_version', 'VARCHAR(40) NULL AFTER device_id');
    await addColumn('push_tokens', 'permission_status', 'VARCHAR(30) NULL AFTER app_version');
    await addColumn('push_tokens', 'disabled_at', 'TIMESTAMP NULL AFTER is_active');
    await addColumn('push_tokens', 'last_error', 'TEXT NULL AFTER disabled_at');
    await addColumn('notification_campaigns', 'delivered_count', 'INT NOT NULL DEFAULT 0 AFTER failed_count');
    await addColumn('notification_campaigns', 'opened_count', 'INT NOT NULL DEFAULT 0 AFTER delivered_count');
    await addColumn('notifications', 'read_at', 'TIMESTAMP NULL AFTER is_read');
    await addColumn('notifications', 'opened_at', 'TIMESTAMP NULL AFTER read_at');
    await addColumn('notifications', 'deep_link', 'VARCHAR(255) NULL AFTER opened_at');
    await addColumn('notifications', 'priority', "VARCHAR(20) NOT NULL DEFAULT 'normal' AFTER deep_link");
    await addColumn('notifications', 'channel', "VARCHAR(50) NOT NULL DEFAULT 'default' AFTER priority");

    await db.execute(`
        CREATE TABLE IF NOT EXISTS notification_deliveries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            notification_id INT NOT NULL,
            push_token_id INT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'pending',
            expo_ticket_id VARCHAR(120),
            expo_receipt_id VARCHAR(120),
            error_code VARCHAR(120),
            error_message TEXT,
            sent_at TIMESTAMP NULL,
            received_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
            FOREIGN KEY (push_token_id) REFERENCES push_tokens(id) ON DELETE SET NULL,
            INDEX idx_notification_deliveries_notification (notification_id),
            INDEX idx_notification_deliveries_token_status (push_token_id, status),
            INDEX idx_notification_deliveries_ticket (expo_ticket_id)
        )
    `);

    await addIndex('push_tokens', 'idx_push_tokens_user_active', 'user_id, is_active');
    await addIndex('notifications', 'idx_notifications_user_created', 'user_id, created_at');
    await addIndex('notifications', 'idx_notifications_user_read', 'user_id, is_read');
    await addIndex('notification_deliveries', 'idx_notification_deliveries_notification', 'notification_id');
    await addIndex('notification_deliveries', 'idx_notification_deliveries_token_status', 'push_token_id, status');
    await addIndex('notification_deliveries', 'idx_notification_deliveries_ticket', 'expo_ticket_id');

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

function normalizeString(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    const trimmed = String(value).trim();
    return trimmed || fallback;
}

function buildDeepLink(notification) {
    return normalizeString(
        notification.deep_link || notification.deepLink || notification.url || notification.data?.deepLink || notification.data?.url
    );
}

function serializeNotification(row) {
    return {
        id: Number(row.id),
        title: row.title,
        body: row.body,
        type: row.type,
        data: parseJson(row.data_json),
        unread: !row.is_read,
        read_at: row.read_at,
        opened_at: row.opened_at,
        deep_link: row.deep_link,
        priority: row.priority || 'normal',
        channel: row.channel || DEFAULT_CHANNEL,
        created_at: row.created_at,
    };
}

export async function registerPushToken(userId, payload = {}) {
    await ensureNotificationTables();

    const token = payload.expo_push_token || payload.expoPushToken;
    if (!isExpoPushToken(token)) {
        const error = new Error('Expo push token khong hop le.');
        error.status = 400;
        throw error;
    }

    const values = [
        userId,
        token,
        normalizeString(payload.provider, 'expo'),
        normalizeString(payload.expo_project_id || payload.expoProjectId),
        normalizeString(payload.platform),
        normalizeString(payload.device_id || payload.deviceId),
        normalizeString(payload.app_version || payload.appVersion),
        normalizeString(payload.permission_status || payload.permissionStatus),
    ];

    await db.execute(
        `INSERT INTO push_tokens (
            user_id, expo_push_token, provider, expo_project_id, platform, device_id,
            app_version, permission_status, is_active, disabled_at, last_error
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NULL, NULL)
         ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            provider = VALUES(provider),
            expo_project_id = VALUES(expo_project_id),
            platform = VALUES(platform),
            device_id = VALUES(device_id),
            app_version = VALUES(app_version),
            permission_status = VALUES(permission_status),
            is_active = TRUE,
            disabled_at = NULL,
            last_error = NULL,
            last_seen_at = CURRENT_TIMESTAMP`,
        values
    );

    return { expo_push_token: token };
}

export async function unregisterPushToken(userId, token) {
    await ensureNotificationTables();
    if (!token) return;

    await db.execute(
        `UPDATE push_tokens
         SET is_active = FALSE,
             disabled_at = CURRENT_TIMESTAMP,
             permission_status = COALESCE(permission_status, 'disabled')
         WHERE user_id = ? AND expo_push_token = ?`,
        [userId, token]
    );
}

export async function listNotifications(userId) {
    await ensureNotificationTables();

    const [rows] = await db.execute(
        `SELECT id, title, body, type, data_json, is_read, read_at, opened_at,
                deep_link, priority, channel, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
    );
    const [[countRow]] = await db.execute(
        'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
    );

    return {
        notifications: rows.map(serializeNotification),
        unread_count: Number(countRow?.unread_count || 0),
    };
}

export async function markNotificationsRead(userId, ids = []) {
    await ensureNotificationTables();

    const cleanIds = Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];
    if (cleanIds.length > 0) {
        const placeholders = cleanIds.map(() => '?').join(',');
        await db.execute(
            `UPDATE notifications
             SET is_read = TRUE,
                 read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
             WHERE user_id = ? AND id IN (${placeholders})`,
            [userId, ...cleanIds]
        );
        return;
    }

    await db.execute(
        `UPDATE notifications
         SET is_read = TRUE,
             read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
         WHERE user_id = ?`,
        [userId]
    );
}

export async function markNotificationOpened(userId, notificationId) {
    await ensureNotificationTables();

    const cleanId = Number(notificationId);
    if (!cleanId) {
        const error = new Error('notificationId khong hop le.');
        error.status = 400;
        throw error;
    }

    const [rows] = await db.execute(
        'SELECT id, campaign_id, opened_at FROM notifications WHERE user_id = ? AND id = ?',
        [userId, cleanId]
    );
    const notification = rows[0];
    if (!notification) {
        const error = new Error('Thong bao khong ton tai.');
        error.status = 404;
        throw error;
    }

    await db.execute(
        `UPDATE notifications
         SET is_read = TRUE,
             read_at = COALESCE(read_at, CURRENT_TIMESTAMP),
             opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP)
         WHERE user_id = ? AND id = ?`,
        [userId, cleanId]
    );

    if (!notification.opened_at && notification.campaign_id) {
        await db.execute(
            'UPDATE notification_campaigns SET opened_count = opened_count + 1 WHERE id = ?',
            [notification.campaign_id]
        );
    }
}

async function getActiveTokens(userIds) {
    if (!userIds.length) return [];

    const placeholders = userIds.map(() => '?').join(',');
    const [tokens] = await db.execute(
        `SELECT id, user_id, expo_push_token, platform
         FROM push_tokens
         WHERE is_active = TRUE AND user_id IN (${placeholders})`,
        userIds
    );

    const validTokens = [];
    await Promise.all(tokens.map(async (row) => {
        if (isExpoPushToken(row.expo_push_token)) {
            validTokens.push(row);
            return;
        }
        await deactivateToken(row.expo_push_token, 'InvalidExpoPushToken');
    }));
    return validTokens;
}

async function deactivateToken(token, reason = 'DeviceNotRegistered') {
    await db.execute(
        `UPDATE push_tokens
         SET is_active = FALSE,
             disabled_at = CURRENT_TIMESTAMP,
             last_error = ?
         WHERE expo_push_token = ?`,
        [reason, token]
    );
}

async function updateDelivery(deliveryId, patch) {
    if (!deliveryId) return;
    const fields = [];
    const values = [];

    Object.entries(patch).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
    });
    if (!fields.length) return;

    values.push(deliveryId);
    await db.execute(`UPDATE notification_deliveries SET ${fields.join(', ')} WHERE id = ?`, values);
}

async function sendExpoMessages(messages) {
    if (!messages.length) return { sent: 0, failed: 0, push_errors: [] };

    let sent = 0;
    let failed = 0;
    const pushErrors = [];

    for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        const payload = chunk.map(({ deliveryId, pushTokenId, token, ...message }) => message);
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
                body: JSON.stringify(payload),
            });
            const result = await response.json().catch(() => ({}));
            const tickets = Array.isArray(result.data) ? result.data : [];

            await Promise.all(chunk.map(async (message, index) => {
                const ticket = tickets[index];
                if (ticket?.status === 'ok') {
                    sent += 1;
                    await updateDelivery(message.deliveryId, {
                        status: 'ticketed',
                        expo_ticket_id: ticket.id || null,
                        sent_at: new Date(),
                    });
                    return;
                }

                failed += 1;
                const errorCode = ticket?.details?.error || ticket?.status || `ExpoHTTP${response.status}`;
                const errorMessage = ticket?.message || result.errors?.[0]?.message || result.message || 'Expo push ticket failed.';
                pushErrors.push({ error: errorCode, message: errorMessage });
                await updateDelivery(message.deliveryId, {
                    status: 'failed',
                    error_code: errorCode,
                    error_message: errorMessage,
                    sent_at: new Date(),
                });
                if (errorCode === 'DeviceNotRegistered') {
                    await deactivateToken(message.token, errorCode);
                }
            }));

            if (!response.ok || result.errors) {
                pushErrors.push({
                    error: `ExpoHTTP${response.status}`,
                    message: result.errors?.[0]?.message || result.message || response.statusText || 'Expo push request failed.',
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('[push] Expo send failed:', err);
            failed += chunk.length;
            pushErrors.push({ error: 'NetworkError', message: errorMessage });
            await Promise.all(chunk.map((message) => updateDelivery(message.deliveryId, {
                status: 'failed',
                error_code: 'NetworkError',
                error_message: errorMessage,
                sent_at: new Date(),
            })));
        }
    }

    return { sent, failed, push_errors: pushErrors.slice(0, 5) };
}

export async function createNotificationForUsers(userIds, notification) {
    await ensureNotificationTables();

    const uniqueUserIds = [...new Set(userIds.map(Number).filter(Boolean))];
    if (!uniqueUserIds.length) {
        return { sent: 0, failed: 0, recipients: 0, push_tokens: 0, push_errors: [] };
    }

    const data = notification.data || {};
    const deepLink = buildDeepLink(notification);
    const type = normalizeString(notification.type, 'general');
    const priority = normalizeString(notification.priority, 'normal');
    const channel = normalizeString(notification.channel, DEFAULT_CHANNEL);
    const title = normalizeString(notification.title, 'Aoklevart');
    const body = normalizeString(notification.body, '');

    const values = uniqueUserIds.map((userId) => [
        userId,
        notification.campaign_id || null,
        title,
        body,
        type,
        safeJson(data),
        deepLink,
        priority,
        channel,
        notification.sent_by || null,
    ]);

    const [insertResult] = await db.query(
        `INSERT INTO notifications (
            user_id, campaign_id, title, body, type, data_json, deep_link, priority, channel, sent_by
         )
         VALUES ?`,
        [values]
    );

    const notificationRows = uniqueUserIds.map((userId, index) => ({
        id: insertResult.insertId + index,
        userId,
    }));
    const notificationByUserId = new Map(notificationRows.map((row) => [row.userId, row]));
    const tokens = await getActiveTokens(uniqueUserIds);
    const tokenTargets = tokens
        .map((tokenRow) => ({
            tokenRow,
            notificationRow: notificationByUserId.get(Number(tokenRow.user_id)),
        }))
        .filter((target) => target.notificationRow);
    const deliveryValues = tokenTargets.map((target) => [
        target.notificationRow.id,
        target.tokenRow.id,
        'pending',
    ]);

    let deliveryRows = [];
    if (deliveryValues.length) {
        const [deliveryResult] = await db.query(
            `INSERT INTO notification_deliveries (notification_id, push_token_id, status)
             VALUES ?`,
            [deliveryValues]
        );
        deliveryRows = deliveryValues.map((value, index) => ({
            deliveryId: deliveryResult.insertId + index,
            notificationId: value[0],
            pushTokenId: value[1],
        }));
    }

    const deliveryByTokenId = new Map(deliveryRows.map((row) => [row.pushTokenId, row]));
    const messages = tokenTargets.map(({ tokenRow: row }) => {
        const notifRow = notificationByUserId.get(Number(row.user_id));
        const delivery = deliveryByTokenId.get(row.id);
        const pushData = {
            ...data,
            notificationId: notifRow?.id,
            type,
            deepLink,
            url: deepLink,
        };

        return {
            to: row.expo_push_token,
            sound: 'default',
            title,
            body,
            data: pushData,
            channelId: channel,
            deliveryId: delivery?.deliveryId,
            pushTokenId: row.id,
            token: row.expo_push_token,
        };
    });
    const result = await sendExpoMessages(messages);

    if (global.io) {
        notificationRows.forEach((row) => {
            global.io.to(`user_${row.userId}`).emit('notificationCreated', {
                id: row.id,
                title,
                body,
                type,
                data,
                deep_link: deepLink,
            });
        });
    }

    return {
        ...result,
        recipients: uniqueUserIds.length,
        push_tokens: tokens.length,
    };
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
        deep_link: 'aoklevart://trips',
        channel: 'bookings',
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
        deep_link: 'aoklevart://notifications',
        channel: 'promotions',
        sent_by: sentBy,
    });

    await db.execute(
        `UPDATE notification_campaigns
         SET sent_count = ?,
             failed_count = ?,
             delivered_count = ?
         WHERE id = ?`,
        [result.recipients, result.failed, result.sent, campaign.insertId]
    );

    return { ...result, campaign_id: campaign.insertId };
}
