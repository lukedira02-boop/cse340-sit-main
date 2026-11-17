import { body, validationResult } from 'express-validator';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoriesByProjectId,
    getProjectsByCategoryId,
    updateCategory,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

export const categoryValidation = [
    body('name').trim().notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters.')
];

export const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.render('categories', { title: 'Service Project Categories', categories });
    } catch (error) {
        next(error);
    }
};

export const showNewCategoryForm = (req, res) => {
    res.render('new-category', { title: 'Add a Category' });
};

export const processNewCategoryForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect('/new-category');
    }

    try {
        const id = await createCategory(req.body.name);
        req.flash('success', 'Category created successfully.');
        res.redirect(`/category/${id}`);
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'A category with that name already exists.');
            return res.redirect('/new-category');
        }
        next(error);
    }
};

export const showEditCategoryForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const category = await getCategoryById(Number(req.params.id));
        if (!category) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }
        res.render('edit-category', { title: 'Edit Category', category });
    } catch (error) {
        next(error);
    }
};

export const processEditCategoryForm = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect(`/edit-category/${req.params.id}`);
    }

    try {
        const category = await getCategoryById(Number(req.params.id));
        if (!category) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        await updateCategory(Number(req.params.id), req.body.name);
        req.flash('success', 'Category updated successfully.');
        res.redirect(`/category/${req.params.id}`);
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'A category with that name already exists.');
            return res.redirect(`/edit-category/${req.params.id}`);
        }
        next(error);
    }
};

export const showAssignCategoriesForm = async (req, res, next) => {
    if (!isValidId(req.params.projectId)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const project = await getProjectDetails(Number(req.params.projectId));
        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const [categories, assignedCategories] = await Promise.all([
            getAllCategories(),
            getCategoriesByProjectId(Number(req.params.projectId))
        ]);
        res.render('assign-categories', {
            title: 'Assign Categories',
            project,
            categories,
            assignedCategories
        });
    } catch (error) {
        next(error);
    }
};

export const processAssignCategoriesForm = async (req, res, next) => {
    if (!isValidId(req.params.projectId)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    const selected = req.body.categoryIds;
    const categoryIds = selected === undefined ? [] : Array.isArray(selected) ? selected : [selected];
    if (
        categoryIds.some((id) => !/^\d+$/.test(id) || Number(id) < 1)
        || new Set(categoryIds).size !== categoryIds.length
    ) {
        req.flash('error', 'Select valid categories.');
        return res.redirect(`/assign-categories/${req.params.projectId}`);
    }

    try {
        const projectId = Number(req.params.projectId);
        const project = await getProjectDetails(projectId);
        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }
        await updateCategoryAssignments(projectId, categoryIds.map(Number));
        req.flash('success', 'Project categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        if (error.code === 'INVALID_CATEGORY_ASSIGNMENT') {
            req.flash('error', 'One or more selected categories are no longer available.');
            return res.redirect(`/assign-categories/${req.params.projectId}`);
        }
        next(error);
    }
};

export const showCategoryDetailsPage = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    try {
        const category = await getCategoryById(Number(req.params.id));
        if (!category) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const projects = await getProjectsByCategoryId(category.id);
        res.render('category', { title: category.name, category, projects });
    } catch (error) {
        next(error);
    }
};
