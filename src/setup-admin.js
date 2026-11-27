import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from './models/database.js';

const email = 'admin@example.com';
const passwordHash = await bcrypt.hash('cse340!', 10);

try {
    const result = await pool.query(`
        INSERT INTO users (name, email, password_hash, role_id)
        SELECT 'admin', $1, $2, role_id
        FROM roles
        WHERE role_name = 'admin'
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            role_id = EXCLUDED.role_id
    `, [email, passwordHash]);
    if (result.rowCount !== 1) {
        throw new Error('The admin role is missing. Run npm run db:setup first.');
    }
    console.log(`Course admin account is ready: ${email}`);
} finally {
    await pool.end();
}
