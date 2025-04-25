const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth'); // Import authentication middleware

const router = express.Router();

// --- Configuration for File Upload ---

// Define storage settings for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        // Create the directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Set the destination folder for uploads
    },
    filename: function (req, file, cb) {
        // Always name the uploaded file 'cv.pdf' to overwrite the existing one
        cb(null, 'cv.pdf');
    }
});

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only PDF files are allowed!'), false); // Reject file
    }
};

// Initialize Multer with storage and file filter settings
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size (e.g., 5MB)
    }
});

// --- Route Definitions ---

// GET route for the main portfolio page
router.get('/', (req, res) => {
    // Send the main HTML page
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// GET route for the login page
router.get('/login', (req, res) => {
    // Render the login form view
    // Pass any flash messages (e.g., error messages) from the session
    res.render('login', { message: req.session.message });
    delete req.session.message; // Clear the message after displaying it
});

// POST route to handle login attempts
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
        console.error("Admin credentials are not set in environment variables.");
        req.session.message = 'Server configuration error.';
        return res.redirect('/login');
    }

    // Basic authentication check (compare with environment variables)
    // For production, consider using password hashing (e.g., bcrypt)
    if (username === adminUsername && password === adminPassword) {
        // Authentication successful: store user info in session
        req.session.isAuthenticated = true;
        req.session.username = username; // Store username if needed later
        console.log(`User '${username}' logged in successfully.`);
        // Redirect to the upload form page upon successful login
        res.redirect('/upload');
    } else {
        // Authentication failed: set error message and redirect back to login
        console.warn(`Failed login attempt for username: '${username}'`);
        req.session.message = 'Invalid username or password.';
        res.redirect('/login');
    }
});

// GET route for the CV upload form page
// Apply the authentication middleware: only authenticated users can access this page
router.get('/upload', authMiddleware, (req, res) => {
    // Render the upload form view
    res.render('upload_form', { message: req.session.message });
     delete req.session.message; // Clear message
});

// POST route to handle CV file upload
// Apply authentication middleware and Multer middleware for file handling
router.post('/upload', authMiddleware, upload.single('cvFile'), (req, res, next) => {
    // Check if a file was actually uploaded
    if (!req.file) {
        req.session.message = 'No file selected for upload.';
        return res.redirect('/upload'); // Redirect back if no file
    }

    // File uploaded successfully by Multer middleware
    console.log(`CV file uploaded successfully by user '${req.session.username}'.`);
    // Render the success page view
    res.render('upload_success');

}, (error, req, res, next) => {
    // --- Multer Error Handling ---
    // Handle potential errors from Multer (e.g., file size limit, wrong file type)
    if (error instanceof multer.MulterError) {
        console.error("Multer error during upload:", error);
        req.session.message = `Upload error: ${error.message}`;
    } else if (error) {
        // Handle other errors (e.g., the file filter error)
        console.error("Non-Multer error during upload:", error);
        req.session.message = `Upload error: ${error.message || 'Could not process file.'}`;
    }
     res.redirect('/upload'); // Redirect back to upload form on error
});


// POST route for logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect('/'); // Redirect home even if error occurs
        }
        console.log("User logged out.");
        res.redirect('/login'); // Redirect to login page after logout
    });
});


module.exports = router;
