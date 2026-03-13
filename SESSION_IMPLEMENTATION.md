# Express-Session Implementation Guide

## What Was Updated

This implementation adds proper session-based authentication to replace the stateless URL query parameter approach.

### Changes Made

#### 1. **Dependencies Added** (package.json)
```json
"express-session": "^1.17.3"
```

#### 2. **Server Configuration** (server.js)
```javascript
const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET || 'animo-labs-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true // Prevent client-side JS from accessing session cookie
    }
}));
```

#### 3. **Auth Controller Updates** (src/controllers/auth_controller.js)
- **postLogin**: Stores `userId`, `username`, and `role` in session
- **getProfile**: Retrieves user from `req.session.userId` instead of URL query param
- **postProfile**: Uses session instead of form data
- **getLogout**: Destroys session and clears cookies

#### 4. **Admin Controller Updates** (src/controllers/admin_controller.js)
- **postAdminLogin**: Stores admin session information

#### 5. **Reservation Controller Updates** (src/controllers/reservation_controller.js)
- **postStudentReservation**: Uses `req.session.userId` instead of `req.body.userId`

#### 6. **Authentication Middleware** (src/middleware/auth.js)
New file with reusable middleware functions:
- `requireLogin`: Checks if user is logged in
- `requireAdmin`: Checks if user is an admin
- `requireStudent`: Checks if user is a student
- `sessionToView`: Makes session data available to templates

#### 7. **Views Updates**
- **student_reservation.hbs**: Removed userId hidden field (server handles it)
- **public/js/reservation.js**: Removed URL userId extraction (sessions handle it)

---

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install express-session
```

### Step 2: Create .env File
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/animo-labs
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=development
```

### Step 3: Database Setup
Make sure MongoDB is running:
```bash
# On Windows with MongoDB installed
mongod

# Or if using MongoDB Atlas, update MONGODB_URI in .env
```

### Step 4: Seed Database
```bash
node seed.js
```

### Step 5: Start Server
```bash
npm run dev
```

---

## Testing the Authentication Flow

### Test 1: Student Login & Reservation
1. Visit `http://localhost:3000`
2. Click **Sign In**
3. Login with credentials:
   - Username: `lpavino`
   - Password: `lpavino121`
4. Should redirect to `/reservation`
5. Navigate to **Slots Overview** → Make a reservation
6. Check: userId should be stored in session (verify in dev tools)

### Test 2: Student Logout
1. After login, click **My Profile** in navbar
2. Click **Logout** button
3. Session should be destroyed
4. Attempting to access `/reservation` should redirect to login

### Test 3: Admin Login & Logout
1. Visit `http://localhost:3000`
2. Click **Admin Entry**
3. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
4. Should redirect to `/admin`
5. Click **Logout** in navbar
6. Session destroyed, redirect to login

### Test 4: Session Persistence
1. Login as student
2. Navigate between pages (reservation, profile, search)
3. Session userId should remain until logout
4. Refresh page - session persists (check browser cookies)
5. Close and reopen browser - session may persist depending on cookie settings

### Test 5: Unauthorized Access
1. Logout completely
2. Try to directly access `/auth/profile`
3. Should see error: "Please log in to view your profile."
4. Attempting to POST to protected routes should fail with 401

---

## How Sessions Work Now

### Before (Stateless with URL params):
```javascript
// Old way - insecure
/auth/login → /reservation?userId=<ID>
// User ID in URL - anyone can change it in address bar
```

### After (Session-based):
```javascript
// New way - secure
/auth/login → creates session → /reservation
// Session stored server-side, client gets httpOnly cookie
// Cannot be modified from client-side JavaScript
```

---

## Security Features Implemented

✅ **httpOnly Cookies**: Client-side JavaScript cannot access session cookie
✅ **Session Secret**: Unique signing key prevents session tampering
✅ **24-Hour Expiration**: Sessions expire after 24 hours of inactivity
✅ **Secure Flag**: Can be enabled for HTTPS deployments
✅ **Server-Side Validation**: All userId lookups verified on server

---

## Middleware Usage (Optional - For Advanced Protection)

You can now protect routes with authentication middleware:

```javascript
const { requireLogin, requireAdmin } = require('./src/middleware/auth');

// In your routes:
router.get('/reservation', requireLogin, ctrl.getReservationOverview);
router.get('/admin', requireAdmin, ctrl.getAdminHome);
```

### Available Middleware:
- `requireLogin`: User must be logged in (student or admin)
- `requireAdmin`: User must be logged in as admin
- `requireStudent`: User must be logged in as student
- `sessionToView`: Make session data available in views (res.locals.userId, etc.)

---

## Troubleshooting

### Issue: Session not persisting after page reload
**Solution**: 
- Check that httpOnly cookie is being set (DevTools → Application → Cookies)
- Verify SESSION_SECRET is set in .env
- Check browser privacy settings aren't blocking cookies

### Issue: Cannot login - redirects back to login page
**Solution**:
- Verify credentials in seed.js
- Check console for errors
- Ensure MongoDB is running

### Issue: "sessionToView is not set up"
**Solution**:
- Add this to server.js after session middleware:
```javascript
const { sessionToView } = require('./src/middleware/auth');
app.use(sessionToView);
```
- Then in views, access with: `{{#if isLoggedIn}}...{{/if}}`

### Issue: Session data not available in controllers
**Solution**:
- Confirm express-session middleware is loaded BEFORE routes
- Session data accessible as: `req.session.userId`, `req.session.role`

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| PORT | 3000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/animo-labs | MongoDB connection |
| SESSION_SECRET | animo-labs-secret-key | Session encryption |
| NODE_ENV | development | Environment type |

---

## Next Steps

1. ✅ Implement password hashing (bcrypt) - for Phase 2
2. ✅ Add CSRF protection (csurf middleware) - for production
3. ✅ Move session store to MongoDB (connect-mongo) - for scalability
4. ✅ Add rate limiting on login - for security

---

## Files Modified

- ✅ `package.json` - Added express-session
- ✅ `server.js` - Configured session middleware
- ✅ `src/controllers/auth_controller.js` - Session in login/logout
- ✅ `src/controllers/admin_controller.js` - Session in admin login
- ✅ `src/controllers/reservation_controller.js` - Session for userId
- ✅ `src/views/student_reservation.hbs` - Removed userId field
- ✅ `public/js/reservation.js` - Removed URL param extraction
- ✨ `src/middleware/auth.js` - NEW authentication middleware
- ✨ `.env.example` - NEW environment template

---

## Support

For issues with express-session:
- Official Docs: https://github.com/expressjs/session
- NPM Package: https://www.npmjs.com/package/express-session
