# portfolio-site

A small Node.js and Express site that shows the CV of Igors Volohovs as a
portfolio page, displays the CV's PDF with PDF.js, and lets its owner replace
that PDF after logging in.

## What is here

- `app.js` starts the server on `PORT`, 3001 by default. It serves `public/`,
  serves PDF.js from `node_modules/pdfjs-dist`, keeps a session, and mounts the
  routes.
- `routes/cvRoutes.js` holds the routes: `GET /` sends `public/index.html`,
  `GET` and `POST /login` check the name and password against
  `ADMIN_USERNAME` and `ADMIN_PASSWORD`, `GET` and `POST /upload` accept one PDF
  of up to 5 MB and save it as `public/uploads/cv.pdf`, and `POST /logout` ends
  the session.
- `middleware/auth.js` sends a visitor without a session to `/login`.
- `public/index.html` is the portfolio page, styled with Tailwind from its CDN.
  `public/js/pdfjs/build/` is a copy of PDF.js, and `public/images/photo.jpg`
  the portrait.
- `views/` holds the EJS pages for login, the upload form and the upload
  result, with older HTML versions of the last two beside them.
- `package.json` and `package-lock.json` name the dependencies: express,
  express-session, ejs, multer, dotenv and pdfjs-dist, and nodemon for
  development. `package.json` still says ISC, while `LICENSE` is MIT.

The settings come from a `.env` file that is never committed: `ADMIN_USERNAME`,
`ADMIN_PASSWORD`, `SESSION_SECRET` and `PORT`. Without `SESSION_SECRET` the
server makes a random one at each start.

```
npm install
npm start
```

## Working on it

This repository ships no program under the lab's kinds: it is a small site and
its three short scripts, with no installer and no tests. Nothing here runs or
checks the JavaScript. The Node.js CI and CD workflows from GitHub are not
carried over, because this server has no runner for them.

`.\recipe.ps1` is still the repository's whole interface: `.\recipe.ps1 test`
runs pytest and ruff over `.claude`, and `.\recipe.ps1 info` prints the
metadata. The other verbs print `nothing to <verb>`. `CLAUDE.md` holds the
rules.

## License

MIT. See [LICENSE](LICENSE).

## Lab requirements

This repository complies with [revision 4.0.0](http://127.0.0.1:3000/igors-lab/software-requirements/src/tag/v4.0.0/BEST_REQUIREMENTS.md) of the lab requirements, except R-02 (#7), R-09 (#8), R-37 (#9), R-41 (#10), R-42 (#11).
