import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.use(session({
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

app.use(routes);

app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((error, req, res, next) => {
    console.error('Request failed:', error);
    if (res.headersSent) {
        return next(error);
    }
    res.status(500).render('500', { title: 'Server Error' });
});

app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});
