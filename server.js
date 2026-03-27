require('dotenv').config();
const MongoStore = require('connect-mongo');
const express = require('express');
const session = require('express-session');
const { engine } = require('express-handlebars');
const path = require('path');
const connectDB = require('./src/config/db');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

connectDB();

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials'),
    helpers: {
        formatDate: (date) => date ? new Date(date).toLocaleDateString() : ''
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.userId || null;
    next();
});

app.use('/', require('./src/routes/index_routes'));
app.use('/auth', require('./src/routes/auth_routes'));
app.use('/reservation', require('./src/routes/reservation_routes'));
app.use('/lab', require('./src/routes/lab_routes'));
app.use('/admin', require('./src/routes/admin_routes'));

app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found.' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).render('error', { message: 'An internal error occurred.' });
});

app.listen(PORT, () =>  {
    console.log(`Server running at http://localhost:${PORT}`);
});