
import { Pool } from '@neondatabase/serverless';

// WARNING: Storing connection strings with credentials in client-side code is insecure.
// In a production app, this should be an environment variable in a backend service.
const connectionString = 'postgresql://neondb_owner:npg_Pm9ODlHj4fkG@ep-gentle-dream-aerj0aq4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ connectionString });

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

// --- Contact Messages ---

export const saveContactMessageToNeon = async (data: NeonContactMessage) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const insertQuery = `
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const client = await pool.connect();
    try {
        await client.query(createTableQuery);
        const result = await client.query(insertQuery, [
            data.name, 
            data.email, 
            data.subject || '', 
            data.message, 
            data.created_at
        ]);
        console.log("Saved to Neon DB with ID:", result.rows[0].id);
        return result.rows[0];
    } finally {
        client.release();
    }
  } catch (err) {
    console.error("Error saving to Neon DB:", err);
    throw err;
  }
};

export const getContactMessagesFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);

            const result = await client.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching from Neon:", err);
        return [];
    }
};

// --- Users ---

export const saveUserToNeon = async (user: NeonUser) => {
  try {
    const createTableQuery = `
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
    `;
    
    // Attempt to add columns if they don't exist (migration-like behavior)
    const alterTableQuery = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status TEXT;
    `;
    
    const insertQuery = `
      INSERT INTO users (id, name, email, role, avatar, bio, availability_status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        email = EXCLUDED.email, 
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar,
        bio = EXCLUDED.bio,
        availability_status = EXCLUDED.availability_status;
    `;

    const client = await pool.connect();
    try {
        await client.query(createTableQuery);
        await client.query(alterTableQuery); // Ensure columns exist
        await client.query(insertQuery, [
            user.id, 
            user.name, 
            user.email, 
            user.role, 
            user.avatar, 
            user.bio || '',
            user.availability_status || 'ONLINE',
            user.created_at
        ]);
        console.log("User saved to Neon DB:", user.id);
    } finally {
        client.release();
    }
  } catch (err) {
    console.error("Error saving user to Neon DB:", err);
  }
};

export const getUsersFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
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
            // Try to select all columns, might fail if schema old, but we tried creating
            const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching users from Neon:", err);
        return [];
    }
};

export const getFixersFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            // Ensure table exists
            await client.query(`
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
            const result = await client.query("SELECT * FROM users WHERE role = 'FIXER'");
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching fixers from Neon:", err);
        return [];
    }
};

export const getUserFromNeon = async (id: string): Promise<NeonUser | null> => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    } catch (err) {
        // Table might not exist yet if this is the first call ever
        return null;
    }
}

// --- Repair Jobs ---

export const saveRepairToNeon = async (repair: NeonRepairJob) => {
    try {
        const createTableQuery = `
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
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const insertQuery = `
            INSERT INTO repairs (id, device_id, device_type, issue_description, status, customer_id, fixer_id, date_booked, estimated_cost, ai_diagnosis)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                fixer_id = EXCLUDED.fixer_id,
                estimated_cost = EXCLUDED.estimated_cost,
                ai_diagnosis = EXCLUDED.ai_diagnosis;
        `;

        const client = await pool.connect();
        try {
            await client.query(createTableQuery);
            await client.query(insertQuery, [
                repair.id,
                repair.device_id,
                repair.device_type,
                repair.issue_description,
                repair.status,
                repair.customer_id,
                repair.fixer_id || null,
                repair.date_booked,
                repair.estimated_cost,
                repair.ai_diagnosis || null
            ]);
            console.log("Repair saved to Neon:", repair.id);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error saving repair to Neon:", err);
    }
};

export const getRepairsFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
             await client.query(`
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
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            const result = await client.query('SELECT * FROM repairs ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching repairs from Neon:", err);
        return [];
    }
};

// --- Orders ---

export const saveOrderToNeon = async (order: NeonOrder) => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                total NUMERIC NOT NULL,
                status TEXT NOT NULL,
                items TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const insertQuery = `
            INSERT INTO orders (id, date, total, status, items)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status;
        `;

        const client = await pool.connect();
        try {
            await client.query(createTableQuery);
            await client.query(insertQuery, [
                order.id,
                order.date,
                order.total,
                order.status,
                order.items
            ]);
            console.log("Order saved to Neon:", order.id);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error saving order to Neon:", err);
    }
};

export const getOrdersFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    total NUMERIC NOT NULL,
                    status TEXT NOT NULL,
                    items TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            const result = await client.query('SELECT * FROM orders ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching orders from Neon:", err);
        return [];
    }
};

// --- Products ---

export const saveProductToNeon = async (product: NeonProduct) => {
    try {
        const createTableQuery = `
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
        `;

        const insertQuery = `
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
        `;

        const client = await pool.connect();
        try {
            await client.query(createTableQuery);
            await client.query(insertQuery, [
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
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error saving product to Neon:", err);
    }
};

export const deleteProductFromNeon = async (id: string) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM products WHERE id = $1', [id]);
            console.log("Product deleted from Neon:", id);
        } finally {
            client.release();
        }
    } catch (err) {
         console.error("Error deleting product from Neon:", err);
    }
}

export const getProductsFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            // Ensure table exists (for first run)
            await client.query(`
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
            const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching products from Neon:", err);
        return [];
    }
};

// --- Chat Sessions ---

export const saveChatSessionToNeon = async (session: NeonChatSession) => {
    try {
        const createTableQuery = `
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
        `;

        const insertQuery = `
            INSERT INTO chat_sessions (id, user_id, user_name, user_avatar, messages, unread_count, last_message, last_message_time, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
                messages = EXCLUDED.messages,
                unread_count = EXCLUDED.unread_count,
                last_message = EXCLUDED.last_message,
                last_message_time = EXCLUDED.last_message_time,
                status = EXCLUDED.status;
        `;

        const client = await pool.connect();
        try {
            await client.query(createTableQuery);
            await client.query(insertQuery, [
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
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error saving chat session to Neon:", err);
    }
};

export const getChatSessionsFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
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
            const result = await client.query('SELECT * FROM chat_sessions ORDER BY last_message_time DESC');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching chat sessions from Neon:", err);
        return [];
    }
};

// --- Repair Chats (Customer <-> Fixer) ---

export const saveRepairChatToNeon = async (chat: NeonRepairChat) => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS repair_chats (
                repair_id TEXT PRIMARY KEY,
                messages TEXT NOT NULL,
                last_message_at TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const insertQuery = `
            INSERT INTO repair_chats (repair_id, messages, last_message_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (repair_id) DO UPDATE SET
                messages = EXCLUDED.messages,
                last_message_at = EXCLUDED.last_message_at;
        `;

        const client = await pool.connect();
        try {
            await client.query(createTableQuery);
            await client.query(insertQuery, [
                chat.repair_id,
                chat.messages,
                chat.last_message_at
            ]);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error saving repair chat to Neon:", err);
    }
};

export const getRepairChatsFromNeon = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                 CREATE TABLE IF NOT EXISTS repair_chats (
                    repair_id TEXT PRIMARY KEY,
                    messages TEXT NOT NULL,
                    last_message_at TIMESTAMP,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            const result = await client.query('SELECT * FROM repair_chats');
            return result.rows;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching repair chats from Neon:", err);
        return [];
    }
};
