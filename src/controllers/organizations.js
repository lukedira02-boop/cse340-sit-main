import { getAllOrganizations, getOrganizationById } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

export const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', { title: 'Partner Organizations', organizations });
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
