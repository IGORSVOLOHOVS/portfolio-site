// Import necessary modules
const express = require('express');
const path = require('path');
const session = require('express-session'); // For session management
const crypto = require('crypto'); // For generating session secret
require('dotenv').config(); // Load environment variables

// Import routes
const cvRoutes = require('./routes/cvRoutes');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001; // Use port from env or default to 3001

// --- Middleware Setup ---

// Serve static files (HTML, CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve PDF.js build files specifically needed for the viewer
app.use('/pdfjs', express.static(path.join(__dirname, 'node_modules/pdfjs-dist/build')));
app.use('/pdfjs/web', express.static(path.join(__dirname, 'node_modules/pdfjs-dist/web')));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Session middleware configuration
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'); // Use env secret or generate a random one
app.use(session({
    secret: sessionSecret, // Secret used to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiry time (e.g., 1 day)
    }
}));

// Set view engine to EJS (or your preferred engine if different)
// If you are using plain HTML files rendered via res.sendFile, you might not need a view engine.
// However, for login/success pages, a view engine can be convenient.
// Let's assume you might want to use EJS for simplicity with session messages, etc.
app.set('view engine', 'ejs'); // Using EJS as an example
app.set('views', path.join(__dirname, 'views')); // Specify the directory for view templates

// --- Routes ---

// Mount the CV routes (handles /, /login, /upload, /logout)
app.use('/', cvRoutes);

// --- Server Startup ---

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    if (sessionSecret.length < 32 && process.env.NODE_ENV !== 'production') {
        console.warn('Warning: Using a weak or default session secret. Set a strong SESSION_SECRET environment variable for production.');
    }
     if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
        console.warn('Warning: ADMIN_USERNAME or ADMIN_PASSWORD environment variables are not set. Login will not function correctly.');
    }
});

// Basic 404 handler for routes not found
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
