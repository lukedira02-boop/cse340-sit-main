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

export const createOrganization = async (name, description, email, logo) => {
    const result = await pool.query(`
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id AS id
    `, [name, description, email, logo]);

    if (!result.rows[0]) {
        throw new Error('Failed to create organization');
    }

    return result.rows[0].id;
};

export const updateOrganization = async (id, name, description, email, logo) => {
    const result = await pool.query(`
        UPDATE organization
        SET name = $2, description = $3, contact_email = $4, logo_filename = $5
        WHERE organization_id = $1
        RETURNING organization_id
    `, [id, name, description, email, logo]);

    if (!result.rows[0]) {
        throw new Error('Organization not found');
    }
};

export const getOrganizations = getAllOrganizations;
