import pool from './database.js';

export const getAllCategories = async () => {
    const result = await pool.query(`
        SELECT category_id AS id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
};

export const getCategoryById = async (id) => {
    const result = await pool.query(`
        SELECT category_id AS id, name
        FROM categories
        WHERE category_id = $1
    `, [id]);
    return result.rows[0] ?? null;
};

export const getCategoriesByProjectId = async (projectId) => {
    const result = await pool.query(`
        SELECT c.category_id AS id, c.name
        FROM categories c
        JOIN project_categories pc ON pc.category_id = c.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name
    `, [projectId]);
    return result.rows;
};

export const getProjectsByCategoryId = async (categoryId) => {
    const result = await pool.query(`
        SELECT
            p.project_id AS id,
            p.name,
            p.description,
            p.location,
            p.schedule,
            p.organization_id AS "organizationId",
            o.name AS organization
        FROM project p
        JOIN project_categories pc ON pc.project_id = p.project_id
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.schedule, p.name
    `, [categoryId]);
    return result.rows;
};

export const getCategories = getAllCategories;
