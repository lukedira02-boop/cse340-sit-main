import 'dotenv/config';
import pool from './models/database.js';

const client = await pool.connect();

try {
    await client.query('BEGIN');
    await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
            role_id SERIAL PRIMARY KEY,
            role_name VARCHAR(50) NOT NULL UNIQUE,
            role_description TEXT
        )
    `);
    await client.query(`
        INSERT INTO roles (role_name, role_description) VALUES
            ('user', 'Standard user with basic access'),
            ('admin', 'Administrator with full system access')
        ON CONFLICT (role_name) DO NOTHING
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role_id INTEGER REFERENCES roles(role_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await client.query('COMMIT');
    console.log('Authentication tables and roles are ready.');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
    await pool.end();
}
