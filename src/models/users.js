import bcrypt from 'bcrypt';
import pool from './database.js';

const SALT_ROUNDS = 10;

export const createUser = async (name, email, password) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(`
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
        RETURNING user_id
    `, [name, email, passwordHash]);

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const result = await pool.query(`
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `, [email]);

    return result.rows[0] ?? null;
};

export const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
};

export const getAllUsers = async () => {
    const result = await pool.query(`
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name, u.email
    `);
    return result.rows;
};
