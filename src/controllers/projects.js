import { getProjectDetails, getUpcomingProjects } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;
const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

export const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        res.render('projects', { title: 'Upcoming Service Projects', projects });
    } catch (error) {
        next(error);
    }
};

export const showProjectDetailsPage = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const project = await getProjectDetails(Number(req.params.id));
        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const categories = await getCategoriesByProjectId(project.id);
        res.render('project', { title: project.name, project, categories });
    } catch (error) {
        next(error);
    }
};
