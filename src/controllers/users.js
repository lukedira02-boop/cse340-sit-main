import { body, validationResult } from 'express-validator';
import { authenticateUser, createUser, getAllUsers } from '../models/users.js';

export const registrationValidation = [
    body('name').trim().notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.')
        .isLength({ max: 100 }).withMessage('Email must be 100 characters or fewer.'),
    body('password').isLength({ min: 6, max: 72 })
        .withMessage('Password must be between 6 and 72 characters.')
];

export const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Create an Account' });
};

export const processUserRegistrationForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(({ msg }) => req.flash('error', msg));
        return res.redirect('/register');
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    try {
        await createUser(name, email, req.body.password);
        req.flash('success', 'Your account was created. You can now log in.');
        res.redirect('/login');
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'An account with that email already exists.');
            return res.redirect('/register');
        }
        next(error);
    }
};

export const showLoginForm = (req, res) => {
    const messages = req.query.loggedOut
        ? { success: ['You have logged out.'], error: [] }
        : undefined;
    res.render('login', { title: 'Log In', ...(messages ? { messages } : {}) });
};

export const processLoginForm = async (req, res, next) => {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    try {
        const user = await authenticateUser(email, password);
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        req.session.regenerate((error) => {
            if (error) return next(error);
            req.session.user = user;
            req.flash('success', 'Login successful.');
            res.redirect('/dashboard');
        });
    } catch (error) {
        next(error);
    }
};

export const processLogout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie('connect.sid');
        res.redirect('/login?loggedOut=1');
    });
};

export const requireLogin = (req, res, next) => {
    if (!req.session?.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

export const requireRole = (role) => (req, res, next) => {
    if (!req.session?.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    if (req.session.user.role_name !== role) {
        req.flash('error', 'You do not have permission to access that page.');
        return res.redirect('/dashboard');
    }
    next();
};

export const showDashboard = (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        name: req.session.user.name,
        email: req.session.user.email
    });
};

export const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('users', { title: 'Registered Users', users });
    } catch (error) {
        next(error);
    }
};
