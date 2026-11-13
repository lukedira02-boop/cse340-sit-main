import pool from './database.js';

export const getUpcomingProjects = async (numberOfProjects) => {
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
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.schedule >= CURRENT_DATE
        ORDER BY p.schedule, p.name
        LIMIT $1
    `, [numberOfProjects]);
    return result.rows;
};

export const getProjectDetails = async (id) => {
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
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.project_id = $1
    `, [id]);
    return result.rows[0] ?? null;
};

export const getProjectsByOrganizationId = async (organizationId) => {
    const result = await pool.query(`
        SELECT
            project_id AS id,
            name,
            description,
            location,
            schedule
        FROM project
        WHERE organization_id = $1
        ORDER BY schedule, name
    `, [organizationId]);
    return result.rows;
};

export const getAllProjects = async () => {
    const result = await pool.query(`
        SELECT
            p.project_id AS id,
            p.name,
            p.description,
            p.location,
            p.schedule,
            p.organization_id AS "organizationId",
            o.name AS organization,
            COALESCE(
                array_agg(DISTINCT c.name) FILTER (WHERE c.category_id IS NOT NULL),
                ARRAY[]::varchar[]
            ) AS categories
        FROM project p
        JOIN organization o ON o.organization_id = p.organization_id
        LEFT JOIN project_categories pc ON pc.project_id = p.project_id
        LEFT JOIN categories c ON c.category_id = pc.category_id
        GROUP BY p.project_id, o.name
        ORDER BY p.schedule, p.name
    `);
    return result.rows;
};

export const getProjects = getAllProjects;
