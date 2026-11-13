import pool from './database.js';

export const getAllOrganizations = async () => {
    const result = await pool.query(`
        SELECT
            organization_id AS id,
            name,
            description,
            contact_email AS email,
            logo_filename AS logo
        FROM organization
        ORDER BY name
    `);
    return result.rows;
};

export const getOrganizationById = async (id) => {
    const result = await pool.query(`
        SELECT
            organization_id AS id,
            name,
            description,
            contact_email AS email,
            logo_filename AS logo
        FROM organization
        WHERE organization_id = $1
    `, [id]);
    return result.rows[0] ?? null;
};

export const getOrganizations = getAllOrganizations;
