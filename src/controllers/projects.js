import { body, validationResult } from 'express-validator';
import {
    createProject,
    getProjectDetails,
    getUpcomingProjects,
    updateProject
} from '../models/projects.js';
import { getAllOrganizations, getOrganizationById } from '../models/organizations.js';
import { getCategoriesByProjectId } from '../models/categories.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;
const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

export const projectValidation = [
    body('name').trim().notEmpty().withMessage('Project name is required.')
        .isLength({ min: 3, max: 150 }).withMessage('Project name must be between 3 and 150 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('location').trim().notEmpty().withMessage('Location is required.')
        .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters.'),
    body('schedule').notEmpty().withMessage('Project date is required.')
        .isISO8601({ strict: true }).withMessage('Enter a valid project date.'),
    body('organizationId').isInt({ min: 1 }).withMessage('Select a valid organization.')
        .bail()
        .custom(async (value) => {
            const organization = await getOrganizationById(Number(value));
            if (!organization) {
                throw new Error('Select an existing organization.');
            }
        })
];

export const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        res.render('projects', { title: 'Upcoming Service Projects', projects });
    } catch (error) {
        next(error);
    }
};

export const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('new-project', { title: 'Add a Service Project', organizations });
    } catch (error) {
        next(error);
    }
};

export const processNewProjectForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect('/new-project');
    }

    const { name, description, location, schedule, organizationId } = req.body;
    try {
        const id = await createProject(name, description, location, schedule, Number(organizationId));
        req.flash('success', 'Service project created successfully.');
        res.redirect(`/project/${id}`);
    } catch (error) {
        next(error);
    }
};

export const showEditProjectForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const project = await getProjectDetails(Number(req.params.id));
        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }
        const organizations = await getAllOrganizations();
        res.render('edit-project', { title: 'Edit Service Project', project, organizations });
    } catch (error) {
        next(error);
    }
};

export const processEditProjectForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect(`/edit-project/${req.params.id}`);
    }

    const { name, description, location, schedule, organizationId } = req.body;
    try {
        const project = await getProjectDetails(Number(req.params.id));
        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        await updateProject(
            Number(req.params.id),
            name,
            description,
            location,
            schedule,
            Number(organizationId)
        );
        req.flash('success', 'Service project updated successfully.');
        res.redirect(`/project/${req.params.id}`);
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
