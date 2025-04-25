# Portfolio Site - CV Viewer & Uploader

This is a simple Node.js/Express web application designed to display a professional portfolio based on a CV and allow the owner to update the CV file securely.

## Features

* **Professional Portfolio Display:** Presents information extracted from a CV (About Me, Experience, Skills, Education, Contact) in a clean, responsive HTML format using Tailwind CSS.
* **PDF CV Viewer:** Integrates PDF.js to allow visitors to view the original CV document directly on the website.
* **Secure CV Upload:** Provides a password-protected route (`/upload`) for the site owner to upload a new `cv.pdf` file, replacing the existing one. Uses session-based authentication.
* **Environment Variable Configuration:** Uses a `.env` file for sensitive information like login credentials and session secrets.
* **Responsive Design:** Built with Tailwind CSS for optimal viewing on various devices.

## Project Structure

```
portfolio-site/
│
├── public/                 # Static assets served to the client
│   ├── uploads/            # Directory for the CV PDF file
│   │   └── cv.pdf          # The CV file displayed and replaced
│   ├── js/                 # Frontend JavaScript (if any besides PDF viewer)
│   │   └── (main.js - if needed)
│   └── index.html          # Main portfolio page HTML
│
├── views/                  # EJS (or other engine) view templates
│   ├── login.ejs           # Login form page
│   ├── upload_form.ejs     # CV upload form page
│   └── upload_success.ejs  # Success message page after upload
│
├── routes/                 # Express route definitions
│   └── cvRoutes.js         # Handles all application routes
│
├── middleware/             # Custom Express middleware
│   └── auth.js             # Authentication check middleware
│
├── node_modules/           # Node.js dependencies (created by npm install)
│   └── pdfjs-dist/         # PDF.js library files
│
├── .env                    # Environment variables (MUST be created)
├── .gitignore              # Specifies intentionally untracked files
├── app.js                  # Main application entry point
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Exact dependency versions
└── README.md               # This file
```

## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd portfolio-site
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    This will install Express, Multer, PDF.js, EJS, dotenv, express-session, and other necessary packages.

3.  **Create Environment File:**
    Create a file named `.env` in the root directory of the project and add the following variables

4.  **Place Initial CV:**
    Place your CV file named `cv.pdf` inside the `public/uploads/` directory. If the directory doesn't exist, create it.

5.  **Add Your Photo (Optional but Recommended):**
    Replace the placeholder image link in `public/index.html` with the path to your actual photo. For example, if you place `photo.jpg` in a new `public/images/` folder:
    * Create `public/images/` directory.
    * Add your `photo.jpg` file there.
    * Change the `<img>` tag's `src` in `public/index.html` from the `placehold.co` URL to `/images/photo.jpg`.

## Running the Application

1.  **Development Mode (with automatic restart on file changes):**
    ```bash
    npm run dev
    ```
    Requires `nodemon` installed (`npm install -g nodemon` or use `npx nodemon app.js`).

2.  **Production Mode:**
    ```bash
    npm start
    ```

The application will be accessible at `http://localhost:3001` (or the port specified in your `.env` file).

## Usage

* **View Portfolio:** Navigate to the root URL (`/`).
* **View Full CV:** Click the "CV (PDF)" link or scroll down to the PDF viewer section. You can also download the PDF.
* **Update CV:**
    1.  Navigate to `/login`.
    2.  Upon successful login, you will be redirected to `/upload`.
    3.  Choose your new CV file (must be a PDF).
    4.  Click "Upload CV". The file will replace `public/uploads/cv.pdf`.
    5.  You can log out using the "Log Out" link/button.

## Key Technologies Used

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js.
* **Tailwind CSS:** Utility-first CSS framework for styling.
* **PDF.js:** Library by Mozilla for rendering PDF files in the browser using HTML5 Canvas.
* **Multer:** Middleware for handling `multipart/form-data`, used for file uploads.
* **Express Session:** Middleware for session management (authentication).
* **EJS:** Templating engine (used for login/upload/success pages).
* **dotenv:** Module to load environment variables from a `.env` file.

## Notes

* **Security:** Ensure your `ADMIN_PASSWORD` and `SESSION_SECRET` in the `.env` file are strong and kept private. Do not commit the `.env` file to version control (it should be listed in `.gitignore`). For production deployments, always use HTTPS to protect session cookies and login credentials.
* **PDF Content:** The HTML sections (About, Experience, etc.) are currently hardcoded based on the initial CV provided. If you upload a new CV with significantly different content, you will need to manually update the content within `public/index.html` to reflect the changes accurately. The PDF viewer will always show the content of the currently uploaded `cv.pdf`.
* **Error Handling:** Basic error handling is implemented, but can be further enhanced for production environments.
