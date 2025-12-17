
import { Client } from '@neondatabase/serverless';

// WARNING: Storing connection strings with credentials in client-side code is insecure.
// In a production app, this should be an environment variable in a backend service.
// Removed sslmode=require as the serverless driver handles encryption via WebSocket automatically.
const connectionString = 'postgresql://neondb_owner:npg_Pm9ODlHj4fkG@ep-gentle-dream-aerj0aq4-pooler.c-2.us-east-2.aws.neon.tech/neondb';

// Centralized query wrapper using Client for single-use connections to avoid pool termination issues in browser
// Includes retry logic for robustness against "Connection terminated unexpectedly" errors.
const sql = async (text: string, params: any[] = []) => {
    let lastError;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
        const client = new Client({ connectionString });
        try {
            await client.connect();
            const result = await client.query(text, params);
            await client.end();
            return result;
        } catch (error: any) {
            lastError = error;
            // Ensure client is closed
            try { await client.end(); } catch (e) { /* ignore cleanup error */ }

            // Log the attempt
            console.warn(`Neon SQL Attempt ${i + 1}/${maxRetries} failed:`, error.message || error);

            // If it's a connection error, wait and retry
            const isConnectionError = error.message?.includes('terminated') || 
                                      error.message?.includes('network') || 
                                      error.message?.includes('57P01') ||
                                      error.code === '57P01';

            if (isConnectionError && i < maxRetries - 1) {
                const backoff = 500 * Math.pow(2, i); // 500ms, 1000ms, 2000ms
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }

            // If it's not a connection error (e.g., syntax error), throw immediately
            if (!isConnectionError) {
                console.error("Neon SQL Error (Non-retryable):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
                throw error;
            }
        }
    }

    // If we exhausted retries
    console.error("Neon SQL Error (Final):", JSON.stringify(lastError, Object.getOwnPropertyNames(lastError)));
    throw lastError;
};

export interface NeonContactMessage {
    id?: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export interface NeonUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    bio?: string;
    availability_status?: string;
    created_at: string;
    phone?: string;
    address?: string;
}

export interface NeonRepairJob {
    id: string;
    device_id: string;
    device_type: string;
    issue_description: string;
    status: string;
    customer_id: string;
    fixer_id?: string;
    date_booked: string;
    estimated_cost: number;
    ai_diagnosis?: string;
    delivery_method?: string;
    pickup_address?: string;
    contact_phone?: string;
    courier?: string;
    tracking_number?: string;
    timeline?: string; // JSON string
    is_paid?: boolean;
    images?: string; // JSON string of urls
}

export interface NeonOrder {
    id: string;
    date: string;
    total: number;
    status: string;
    items: string; // JSON string
    created_at?: string;
}

export interface NeonProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    rating: number;
    reviews: number;
    description: string;
    specs: string; // JSON string
    status: string;
    is_best_seller: boolean;
    created_at?: string;
}

export interface NeonChatSession {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    messages: string; // JSON string
    unread_count: number;
    last_message: string;
    last_message_time: string;
    status: string;
    created_at?: string;
}

export interface NeonRepairChat {
    repair_id: string;
    messages: string; // JSON string
    last_message_at: string;
    created_at?: string;
}

export interface NeonUserSession {
    id: string;
    user_id: string;
    device_name: string;
    location: string;
    last_active: string;
}

// --- Contact Messages ---

export const saveContactMessageToNeon = async (data: NeonContactMessage) => {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const result = await sql(`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [data.name, data.email, data.subject || '', data.message, data.created_at]);

    console.log("Saved to Neon DB with ID:", result.rows[0].id);
    return result.rows[0];
  } catch (err: any) {
    console.error("Error saving contact message:", err.message || err);
    throw err;
  }
};

export const getContactMessagesFromNeon = async () => {
    try {
        await sql(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const result = await sql('SELECT * FROM contact_messages ORDER BY created_at DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching contact messages:", err.message || err);
        return [];
    }
};

// --- Users ---

const ensureUsersTable = async () => {
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        availability_status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Ensure columns exist (Migrations)
    try { await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`); } catch (e) {}
};

export const saveUserToNeon = async (user: NeonUser) => {
  try {
    await ensureUsersTable();
    await sql(`
      INSERT INTO users (id, name, email, role, avatar, bio, availability_status, created_at, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        email = EXCLUDED.email, 
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar,
        bio = EXCLUDED.bio,
        availability_status = EXCLUDED.availability_status,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address;
    `, [
        user.id, 
        user.name, 
        user.email, 
        user.role, 
        user.avatar, 
        user.bio || '',
        user.availability_status || 'ONLINE',
        user.created_at,
        user.phone || null,
        user.address || null
    ]);
    console.log("User saved to Neon DB:", user.id);
  } catch (err: any) {
    console.error("Error saving user:", err.message || err);
  }
};

export const getUsersFromNeon = async () => {
    try {
        await ensureUsersTable();
        const result = await sql('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching users:", err.message || err);
        return [];
    }
};

export const getFixersFromNeon = async () => {
    try {
        await ensureUsersTable();
        const result = await sql("SELECT * FROM users WHERE role = 'FIXER'");
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching fixers:", err.message || err);
        return [];
    }
};

export const getUserFromNeon = async (id: string): Promise<NeonUser | null> => {
    try {
        const result = await sql('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        // Table might not exist yet
        return null;
    }
}

// --- User Sessions ---

const ensureUserSessionsTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            device_name TEXT,
            location TEXT,
            last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export const saveUserSessionToNeon = async (session: NeonUserSession) => {
    try {
        await ensureUserSessionsTable();
        await sql(`
            INSERT INTO user_sessions (id, user_id, device_name, location, last_active)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                last_active = EXCLUDED.last_active;
        `, [session.id, session.user_id, session.device_name, session.location, session.last_active]);
    } catch (e) { console.error("Error saving session", e); }
}

export const getUserSessionsFromNeon = async (userId: string) => {
    try {
        await ensureUserSessionsTable();
        const res = await sql('SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY last_active DESC', [userId]);
        return res.rows;
    } catch (e) { return []; }
}

export const deleteUserSessionFromNeon = async (sessionId: string) => {
    try {
        await sql('DELETE FROM user_sessions WHERE id = $1', [sessionId]);
    } catch (e) { console.error("Error deleting session", e); }
}

export const deleteAllUserSessionsFromNeon = async (userId: string) => {
    try {
        await sql('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    } catch (e) { console.error("Error deleting all sessions", e); }
}

// --- Repair Jobs ---

const ensureRepairsTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS repairs (
            id TEXT PRIMARY KEY,
            device_id TEXT,
            device_type TEXT NOT NULL,
            issue_description TEXT,
            status TEXT NOT NULL,
            customer_id TEXT NOT NULL,
            fixer_id TEXT,
            date_booked TEXT,
            estimated_cost NUMERIC,
            ai_diagnosis TEXT,
            delivery_method TEXT,
            pickup_address TEXT,
            contact_phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    // Add columns if they don't exist (migrations)
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS delivery_method TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS pickup_address TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS contact_phone TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS courier TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS tracking_number TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS timeline TEXT;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;`); } catch (e) {}
    try { await sql(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS images TEXT;`); } catch (e) {}
}

export const saveRepairToNeon = async (repair: NeonRepairJob) => {
    try {
        await ensureRepairsTable();
        await sql(`
            INSERT INTO repairs (id, device_id, device_type, issue_description, status, customer_id, fixer_id, date_booked, estimated_cost, ai_diagnosis, delivery_method, pickup_address, contact_phone, courier, tracking_number, timeline, is_paid, images)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                fixer_id = EXCLUDED.fixer_id,
                estimated_cost = EXCLUDED.estimated_cost,
                ai_diagnosis = EXCLUDED.ai_diagnosis,
                delivery_method = EXCLUDED.delivery_method,
                pickup_address = EXCLUDED.pickup_address,
                contact_phone = EXCLUDED.contact_phone,
                courier = EXCLUDED.courier,
                tracking_number = EXCLUDED.tracking_number,
                timeline = EXCLUDED.timeline,
                is_paid = EXCLUDED.is_paid,
                images = EXCLUDED.images;
        `, [
            repair.id,
            repair.device_id,
            repair.device_type,
            repair.issue_description,
            repair.status,
            repair.customer_id,
            repair.fixer_id || null,
            repair.date_booked,
            repair.estimated_cost,
            repair.ai_diagnosis || null,
            repair.delivery_method || 'PICKUP',
            repair.pickup_address || null,
            repair.contact_phone || null,
            repair.courier || null,
            repair.tracking_number || null,
            repair.timeline || '[]',
            repair.is_paid || false,
            repair.images || '[]'
        ]);
        console.log("Repair saved to Neon:", repair.id);
    } catch (err: any) {
        console.error("Error saving repair:", err.message || err);
    }
};

export const getRepairsFromNeon = async () => {
    try {
        await ensureRepairsTable();
        const result = await sql('SELECT * FROM repairs ORDER BY created_at DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching repairs:", err.message || err);
        return [];
    }
};

// --- Orders ---

const ensureOrdersTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            total NUMERIC NOT NULL,
            status TEXT NOT NULL,
            items TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export const saveOrderToNeon = async (order: NeonOrder) => {
    try {
        await ensureOrdersTable();
        await sql(`
            INSERT INTO orders (id, date, total, status, items)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status;
        `, [
            order.id,
            order.date,
            order.total,
            order.status,
            order.items
        ]);
        console.log("Order saved to Neon:", order.id);
    } catch (err: any) {
        console.error("Error saving order:", err.message || err);
    }
};

export const getOrdersFromNeon = async () => {
    try {
        await ensureOrdersTable();
        const result = await sql('SELECT * FROM orders ORDER BY created_at DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching orders:", err.message || err);
        return [];
    }
};

// --- Products ---

const ensureProductsTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            rating NUMERIC,
            reviews INTEGER,
            description TEXT,
            specs TEXT,
            status TEXT NOT NULL,
            is_best_seller BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export const saveProductToNeon = async (product: NeonProduct) => {
    try {
        await ensureProductsTable();
        await sql(`
            INSERT INTO products (id, name, price, category, image, rating, reviews, description, specs, status, is_best_seller)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                rating = EXCLUDED.rating,
                reviews = EXCLUDED.reviews,
                description = EXCLUDED.description,
                specs = EXCLUDED.specs,
                status = EXCLUDED.status,
                is_best_seller = EXCLUDED.is_best_seller;
        `, [
            product.id,
            product.name,
            product.price,
            product.category,
            product.image,
            product.rating || 0,
            product.reviews || 0,
            product.description || '',
            product.specs,
            product.status,
            product.is_best_seller || false
        ]);
        console.log("Product saved to Neon:", product.id);
    } catch (err: any) {
        console.error("Error saving product:", err.message || err);
    }
};

export const deleteProductFromNeon = async (id: string) => {
    try {
        await sql('DELETE FROM products WHERE id = $1', [id]);
        console.log("Product deleted from Neon:", id);
    } catch (err: any) {
         console.error("Error deleting product:", err.message || err);
    }
}

export const getProductsFromNeon = async () => {
    try {
        await ensureProductsTable();
        const result = await sql('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching products:", err.message || err);
        return [];
    }
};

// --- Chat Sessions ---

const ensureChatSessionsTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_name TEXT,
            user_avatar TEXT,
            messages TEXT NOT NULL,
            unread_count INTEGER,
            last_message TEXT,
            last_message_time TEXT,
            status TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export const saveChatSessionToNeon = async (session: NeonChatSession) => {
    try {
        await ensureChatSessionsTable();
        await sql(`
            INSERT INTO chat_sessions (id, user_id, user_name, user_avatar, messages, unread_count, last_message, last_message_time, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
                messages = EXCLUDED.messages,
                unread_count = EXCLUDED.unread_count,
                last_message = EXCLUDED.last_message,
                last_message_time = EXCLUDED.last_message_time,
                status = EXCLUDED.status;
        `, [
            session.id,
            session.user_id,
            session.user_name,
            session.user_avatar,
            session.messages,
            session.unread_count,
            session.last_message,
            session.last_message_time,
            session.status
        ]);
    } catch (err: any) {
        console.error("Error saving chat session:", err.message || err);
    }
};

export const getChatSessionsFromNeon = async () => {
    try {
        await ensureChatSessionsTable();
        const result = await sql('SELECT * FROM chat_sessions ORDER BY last_message_time DESC');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching chat sessions:", err.message || err);
        return [];
    }
};

// --- Repair Chats (Customer <-> Fixer) ---

const ensureRepairChatsTable = async () => {
    await sql(`
        CREATE TABLE IF NOT EXISTS repair_chats (
            repair_id TEXT PRIMARY KEY,
            messages TEXT NOT NULL,
            last_message_at TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export const saveRepairChatToNeon = async (chat: NeonRepairChat) => {
    try {
        await ensureRepairChatsTable();
        await sql(`
            INSERT INTO repair_chats (repair_id, messages, last_message_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (repair_id) DO UPDATE SET
                messages = EXCLUDED.messages,
                last_message_at = EXCLUDED.last_message_at;
        `, [
            chat.repair_id,
            chat.messages,
            chat.last_message_at
        ]);
    } catch (err: any) {
        console.error("Error saving repair chat:", err.message || err);
    }
};

export const getRepairChatsFromNeon = async () => {
    try {
        await ensureRepairChatsTable();
        const result = await sql('SELECT * FROM repair_chats');
        return result.rows;
    } catch (err: any) {
        console.error("Error fetching repair chats:", err.message || err);
        return [];
    }
};
