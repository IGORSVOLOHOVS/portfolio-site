// Middleware to check if the user is authenticated

const isAuthenticated = (req, res, next) => {
    // Check if the user session exists and has the isAuthenticated flag set to true
    if (req.session && req.session.isAuthenticated) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, set a message and redirect to the login page
        console.log("Authentication required. Redirecting to login.");
        req.session.message = 'Please log in to access this page.';
        res.redirect('/login');
    }
};

module.exports = isAuthenticated;
