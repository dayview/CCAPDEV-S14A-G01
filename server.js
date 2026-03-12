require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./src/routes/index_routes'));
app.use('/auth', require('./src/routes/auth_routes'));
app.use('/reservation', require('./src/routes/reservation_routes'));
app.use('/lab', require('./src/routes/lab_routes'));
app.use('/admin', require('./src/routes/admin_routes'));

app.listen(PORT, () =>  {
    console.log(`Server running at http://localhost:${PORT}`);
});

/* Checklist before testing 
1. npm install
2. Seed the database
3. Rename views
4. Create server.js
5. Stub routes
6. npm run dev
*/