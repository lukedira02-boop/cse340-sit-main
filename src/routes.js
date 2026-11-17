import { Router } from 'express';
import {
    organizationValidation,
    processEditOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    showNewOrganizationForm,
    showOrganizationDetailsPage,
    showOrganizationsPage
} from './controllers/organizations.js';
import {
    processEditProjectForm,
    processNewProjectForm,
    projectValidation,
    showEditProjectForm,
    showNewProjectForm,
    showProjectDetailsPage,
    showProjectsPage
} from './controllers/projects.js';
import {
    categoryValidation,
    processAssignCategoriesForm,
    processEditCategoryForm,
    processNewCategoryForm,
    showAssignCategoriesForm,
    showCategoriesPage,
    showCategoryDetailsPage,
    showEditCategoryForm,
    showNewCategoryForm
} from './controllers/categories.js';
import { showHomePage } from './controllers/home.js';

const router = Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/projects', showProjectsPage);
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);
router.get('/project/:id', showProjectDetailsPage);
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);
router.get('/categories', showCategoriesPage);
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);
router.get('/category/:id', showCategoryDetailsPage);

export default router;
