# CCAPDEV-S14A-G01

A lab reservation (DLSU Lab Reservation) system developed for CCAPDEV Term 2 AY 2025-2026.

## Group Members
- COLCOL, Llandro Massimo B.
- MAJOR, Justine Aniko P.
- PAVINO, Leon Gabriel C.
- SESE, Alphonse Juanito T.

## Project Description


## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js, Bootstrap
- **Database**: MongoDB with Mongoose
- **Template Engine**: Handlebars
- **Other Tools**: [Insert any additional libraries/frameworks]

## File Structure
```
CCAPDEV-S14A-G01/
├── node_modules/     # Dependencies
├── public/           # Static files served to client
|   ├── assets/       # Other static files
|   ├── css/          # Stylesheets
|   ├── images/       # Image assets
|   ├── js/           # Client-side JavaScript
├── src/              # Source code
|   ├── config/       # Configuration files
|   ├── controllers/  # Business logic & request handlers
|   ├── middleware/   # Customer middleware (auth, validation)
|   ├── models/       # MongoDB schemas (Mongoose)
|   ├── routes/       # Express route definitions
|   ├── utils/        # Helper functions
|   ├── views/        # Handlebars templates
├── .env              # Environment variables (NOT in Git)
├── .gitignore        # Files to exclude from Git
├── package.json      # Project dependencies and scripts
├── package-lock.json # Locked dependency versions
├── server.js         # Main application entry point
├── README.md         # This file (documentation)
```

### Folder Descriptions

#### `public/`
Contains all **static assets** that are directly served to the client:
- **css/**: Place all stylesheets here
- **js/**: Client-side JavaScript for DOM manipulation and AJAX
- **images/**: Store all image files

#### `src/`
Contains all **server-side source code**:
- **controllers/**: Handle business logic and coordinate between models and views
    - Example: `userController.js`, `reservationController.js`

- **models/**: Define MongoDB schemas using Mongoose
    - Example: `User.js`, `Reservation.js`

- **routes/**: Define Express routes using `express.Router()`
    - Example: `userRoutes.js`, `reservationRoutes.js`

- **views/**: Handlebars template files (`.hbs`)
    - **layouts/**: Main page layouts
    - **partials/**: Reusable components (header, footer, navigation)

- **middleware/**: Custom middleware functions
    - Example: Authentication, input validation, error handling

- **config/**: Configuration files
    - Example: `db.config.js` for database connection

- **utils/**: Reusable helper functions

## Setup Instructions

### Prerequisites
- Node.js (version [not yet listed] or higher)
- MongoDB Community Server
- MongoDB Compass (optional, for GUI)
- Git

### Installation
1. **Clone the repository**
```bash
git clone [repository-url]
cd [project-folder]
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
- Create a `.env` file in the root directory
- Add the following variables:
```text
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database-name
SESSION_SECRET=your-secret-key
```

4. **Start MongoDB**
- Make sure MongoDB is running on your machine

5. **Run the application**
```bash
npm start
```
or for development with auto-restart:
```bash
npm run dev
```

6. **Access the application**
- Open your browser and navigate to `http://localhost:3000`

## Development Workflow

### Branch Naming Convention
- `main` - Production-ready code
- `dev` - Development branch
- `feature/[member-feature-name]` - New features
- `member-branch` - Assigned branch

### Git Workflow
1. Pull latest changes: `git pull origin main`
2. Create your branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "add: description"
4. Push to remote: `git push origin feature/your-feature`
5. Create a pull request for review

### Commit Message Format
- `add:` - new feature or file
- `upd:` - modify existing feature
- `fix:` - bug fix
- `rmv:` - delete feature or file
- `ref:` - code restructuring

### Available Scripts
```bash
npm start       # Start the application
npm run dev     # Start with nodemon (auto-restart)
npm test        # Run tests (Phase 3)
```