# CCAPDEV-S14A-G01

A lab seat reservation system developed for CCAPDEV Term 2 AY 2025-2026. The system allows students to browse available computer laboratory slots and make, edit, or cancel reservations. Administrators can manage lab slot availability and view all student reservations.

##
https://ccapdev-s14a-g01.onrender.com

## Group Members
- COLCOL, Llandro Massimo B.
- MAJOR, Justine Aniko P.
- PAVINO, Leon Gabriel C.
- SESE, Alphonse Juanito T.

## Project Description
**animo.labs** is a web-based lab reservation system built for DLSU students and lab administrators.

**Student features:**
- Register and log in with a DLSU email (@dlsu.edu.ph)
- Browse available lab slots by room, date, and time
- Make, edit, and cancel seat reservations
- Option to reserve anonymously
- View personal reservation history and profile

**Admin features:**
- Log in to a separate admin dashboard
- View all reservations and search by student ID
- Add and remove lab slot reservations on behalf of students
- View seat occupancy per lab, date, and time slot

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Template Engine**: Handlebars (express-handlebars)
- **Authentication**: express-session, connect-mongo, bcrypt
- **Validation**: express-validator

## NPM Packages
| Packages | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | Web application framework |
| `mongoose` | ^8.2.0 | MongoDB object modeling (ODM) |
| `express-handlebars` | ^7.1.2 | Handlebars template engine integration |
| `express-session` | ^1.19.0 | Session-based user authentication |
| `connect-mongo` | latest | Persistent MongoDB-backed session store |
| `bcrypt` | latest | Password hashing |
| `express-validator` | latest | Back-end form validation |
| `dotenv` | ^16.4.1 | Environment variable management |
| `nodemon` | ^3.1.0 | Auto-restart during development |

## File Structure
```
CCAPDEV-S14A-G01/
├── node_modules/     # Dependencies
├── public/           # Static files served to client
|   ├── css/          # Stylesheets
|   ├── images/       # Image assets
|   ├── js/           # Client-side JavaScript
├── src/              # Source code
|   ├── config/       # Configuration files
|   ├── controllers/  # Business logic & request handlers
|   ├── middleware/   # Authentication middleware
|   ├── models/       # MongoDB schemas (Mongoose)
|   ├── routes/       # Express route definitions
|   ├── views/        # Handlebars templates
│       ├── admin/    # Admin-specific views
│       ├── layouts/  # Page layout templates
│       ├── partials/ # Reusable template partials
├── .env              # Environment variables (NOT in Git)
├── .gitignore        # Files to exclude from Git
├── package.json      # Project dependencies and scripts
├── package-lock.json # Locked dependency versions
├── README.md         # This file (documentation)
├── seed.js           # Hard-coded data values for demonstration
├── server.js         # Main application entry point
```

## Setup Instructions

### Prerequisites
- Node.js (v24.14.0 or higher)
- MongoDB Community Server OR a MongoDB Atlas account
- MongoDB Compass (optional, for GUI)
- Git

### Installation
1. **Clone the repository**
```bash
git clone https://github.com/dayview/CCAPDEV-S14A-G01.git
cd CCAPDEV-S14A-G01
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
MONGODB_URI=mongodb://localhost:27017/your-database-name <- or replace with your Atlas connection string
SESSION_SECRET=your-secure-random-secret
NODE_ENV=development
```

4. **Seed the database with sample data**
```bash
node seed.js
```

5. **Run the application**
```bash
npm start
```

or for development with auto-restart:
```bash
npm run dev
```

6. **Access the application**
- Open your browser and navigate to `http://localhost:<PORT NUMBER>` or `http://localhost:3000`

## Sample Accounts (after seeding)
| Role | Username | Password |
|---|---|---|
| Admin | `dcheng` | `dcheng123`|
| Student | `lpavino` | `lpavino121` |
| Student | `jmajor` | `jmajor121` |
| Student | `asese` | `asese123` |
| Student | `mcolcol` | `mcolcol123` |

## Development Workflow

### Branch Naming Convention
- `main` - Production-ready code
- `dev` - Development branch
- `feature/[member-feature-name]` - New features
- `member-branch` - Assigned branch

### Git Workflow
1. Pull latest changes: `git pull origin main`
2. Create your branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "add: description"`
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
