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

export const createCategory = async (name) => {
    const result = await pool.query(`
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING category_id AS id
    `, [name]);

    if (!result.rows[0]) {
        throw new Error('Failed to create category');
    }

    return result.rows[0].id;
};

export const updateCategory = async (id, name) => {
    const result = await pool.query(`
        UPDATE categories
        SET name = $2
        WHERE category_id = $1
        RETURNING category_id
    `, [id, name]);

    if (!result.rows[0]) {
        throw new Error('Category not found');
    }
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

export const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const validCategories = await client.query(`
            SELECT category_id
            FROM categories
            WHERE category_id = ANY($1::integer[])
        `, [categoryIds]);
        if (validCategories.rowCount !== categoryIds.length) {
            const error = new Error('One or more selected categories do not exist');
            error.code = 'INVALID_CATEGORY_ASSIGNMENT';
            throw error;
        }

        await client.query('DELETE FROM project_categories WHERE project_id = $1', [projectId]);

        for (const categoryId of categoryIds) {
            await client.query(`
                INSERT INTO project_categories (project_id, category_id)
                VALUES ($1, $2)
            `, [projectId, categoryId]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
