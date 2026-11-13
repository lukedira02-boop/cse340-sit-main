import 'dotenv/config';
import pool from './models/database.js';

try {
    const result = await pool.query(`
        WITH upcoming_projects AS (
            SELECT COUNT(*) AS count
            FROM project
            WHERE schedule >= CURRENT_DATE
        ),
        ordered_projects AS (
            SELECT
                project_id,
                ROW_NUMBER() OVER (ORDER BY schedule, project_id)::integer AS day_offset
            FROM project
        )
        UPDATE project AS p
        SET schedule = CURRENT_DATE + ordered_projects.day_offset
        FROM ordered_projects
        WHERE p.project_id = ordered_projects.project_id
          AND (SELECT count FROM upcoming_projects) = 0
        RETURNING p.project_id
    `);

    console.log(`Updated ${result.rowCount} project dates.`);
} finally {
    await pool.end();
}
