import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId
} from '../models/categories.js';

const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

export const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.render('categories', { title: 'Service Project Categories', categories });
    } catch (error) {
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
