import 'dotenv/config';
import express from 'express';
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
