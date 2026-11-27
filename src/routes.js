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
import {
    processLoginForm,
    processLogout,
    processUserRegistrationForm,
    registrationValidation,
    requireLogin,
    requireRole,
    showDashboard,
    showLoginForm,
    showUserRegistrationForm,
    showUsersPage
} from './controllers/users.js';

const router = Router();

router.get('/', showHomePage);
router.get('/register', showUserRegistrationForm);
router.post('/register', registrationValidation, processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);
router.get('/users', requireRole('admin'), showUsersPage);
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidation, processEditOrganizationForm);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/projects', showProjectsPage);
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);
router.get('/project/:id', showProjectDetailsPage);
router.get('/assign-categories/:projectId', requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);
router.get('/categories', showCategoriesPage);
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, processEditCategoryForm);
router.get('/category/:id', showCategoryDetailsPage);

export default router;
