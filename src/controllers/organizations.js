import { body, validationResult } from 'express-validator';
import { getAllOrganizations, getOrganizationById } from '../models/organizations.js';
import { createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;
const DEFAULT_ORGANIZATION_LOGO = '/images/organization-placeholder.svg';

export const organizationValidation = [
    body('name').trim().notEmpty().withMessage('Organization name is required.')
        .isLength({ min: 3, max: 150 }).withMessage('Organization name must be between 3 and 150 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
    body('contactEmail').trim().notEmpty().withMessage('Contact email is required.')
        .isEmail().withMessage('Enter a valid contact email.')
        .isLength({ max: 255 }).withMessage('Contact email cannot exceed 255 characters.'),
    body('logoFilename').optional({ values: 'falsy' }).trim()
        .isLength({ max: 255 }).withMessage('Logo path cannot exceed 255 characters.')
];

export const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', { title: 'Partner Organizations', organizations });
    } catch (error) {
        next(error);
    }
};

export const showNewOrganizationForm = (req, res) => {
    res.render('new-organization', { title: 'Add an Organization' });
};

export const processNewOrganizationForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    try {
        const id = await createOrganization(name, description, contactEmail, DEFAULT_ORGANIZATION_LOGO);
        req.flash('success', 'Organization created successfully.');
        res.redirect(`/organization/${id}`);
    } catch (error) {
        next(error);
    }
};

export const showEditOrganizationForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const organization = await getOrganizationById(Number(req.params.id));
        if (!organization) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }
        res.render('edit-organization', { title: 'Edit Organization', organization });
    } catch (error) {
        next(error);
    }
};

export const processEditOrganizationForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    const { name, description, contactEmail, logoFilename } = req.body;
    try {
        const organization = await getOrganizationById(Number(req.params.id));
        if (!organization) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const logo = typeof logoFilename === 'string' && logoFilename.trim()
            ? logoFilename.trim()
            : organization.logo || DEFAULT_ORGANIZATION_LOGO;
        await updateOrganization(Number(req.params.id), name, description, contactEmail, logo);
        req.flash('success', 'Organization updated successfully.');
        res.redirect(`/organization/${req.params.id}`);
    } catch (error) {
        next(error);
    }
};

export const showOrganizationDetailsPage = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const organization = await getOrganizationById(Number(req.params.id));
        if (!organization) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const projects = await getProjectsByOrganizationId(organization.id);
        res.render('organization', {
            title: organization.name,
            organization,
            projects
        });
    } catch (error) {
        next(error);
    }
};
