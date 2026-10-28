# Forma Studio — Portfolio Website Generator

A polished portfolio maker for students and early-career creatives. Write your story, show selected projects, list skills, and share a personal page. This project uses HTML, CSS, browser JavaScript, Node.js, Express, and Supabase PostgreSQL.

## Features
- Responsive editorial-style design with hero section and a live portfolio preview.
- Profile details, skills, project list, location, email, website, GitHub, and LinkedIn links.
- Public portfolio URLs, one-time private edit token, update and confirmed deletion.
- Supabase persistence; server-side field validation; RLS; security headers; JSON size limit; API rate limiting.
- Content uses safe text rendering, and only validated HTTP(S) links are rendered.
- No account service, paid API, frontend framework, or external image dependency.

Owners need the same browser's local data to edit. If browser data is cleared, the edit key cannot be recovered in this MVP. Public pages are visible to anyone with their link; do not publish private details.

## Folder structure
portfolio-website-generator/
- frontend/index.html
- frontend/styles.css
- frontend/app.js
- backend/server.js
- backend/supabase.js
- backend/routes/portfolios.js
- backend/package.json and package-lock.json
- backend/.env.example and .gitignore
- database/schema.sql
- .gitignore
- README.md

## Architecture and security
The browser talks to the same-origin Express REST API; Express accesses Supabase PostgreSQL. The service-role key exists only in backend/.env. RLS is enabled and direct table access for anon/authenticated roles is revoked; the server uses its privileged client only after checking edit authorization. At creation, the server returns a random 256-bit edit token once and stores only its SHA-256 hash. Browser local storage retains the raw key. Never put credentials in frontend files or GitHub.

## Prerequisites
Install [Visual Studio Code](https://code.visualstudio.com/), [Node.js LTS 20+](https://nodejs.org/), and [Git](https://git-scm.com/downloads). Create a free project at [Supabase](https://supabase.com/).

## Setup on Windows
1. Extract the ZIP and open the portfolio-website-generator folder in VS Code (File → Open Folder).
2. Open Terminal → New Terminal at the project root. Run node --version, npm --version, and git --version. Install missing tools and reopen VS Code if not found.
3. In Supabase, create a project. Open SQL Editor → New query, paste the full database/schema.sql, and select Run. In Table Editor, confirm forma_portfolios exists and RLS is on.
4. Open Supabase project settings and copy the Project URL and server-side service role/secret key. Treat the key as a password.
5. From project root, run: Copy-Item backend/.env.example backend/.env
6. Edit backend/.env: replace the sample URL and secret with your project values. Do not commit this file.
7. In terminal run cd backend, then npm install, then npm start. Expected output: Forma Studio running at http://localhost:3000.
8. Open http://localhost:3000. Check http://localhost:3000/api/health returns {"status":"ok"}. Create a portfolio and open its /p/ link in another tab.
9. Stop the server with Ctrl+C. On macOS/Linux, use cp backend/.env.example backend/.env.

## Configuration
PORT chooses the server port (default 3000). SUPABASE_URL identifies your Supabase project. SUPABASE_SERVICE_ROLE_KEY gives server-side database access and must remain secret. .env.example is a placeholder template; backend/.env contains your private values and is excluded from Git.

## API
- GET /api/health — public health check; 200 JSON status.
- POST /api/portfolios — validate and create; 201 portfolio plus one-time editToken; 400 invalid form.
- GET /api/portfolios/:slug — public display data; 200 or 404.
- PUT /api/portfolios/:slug — Authorization: Bearer token; 200, 400 invalid data, 401 missing token, 403 wrong token.
- DELETE /api/portfolios/:slug — same authorization; 204, 401, or 403.
Errors use JSON with an error property. Request payload maximum is 32 KB; API is rate limited.

## Manual verification
Create a portfolio and confirm the row in Supabase; open the share URL; update a field and refresh public view; try blank required fields and malformed email; test wrong/missing edit token; delete and verify link is gone; resize to phone width; check health endpoint. The actual Supabase connection requires credentials from your own project.

## Troubleshooting
- Missing environment settings: check backend/.env name/path, then restart the server.
- Database errors: confirm URL and key belong to the same project and schema.sql ran.
- Port occupied: set PORT=3001 and open that port.
- Cannot edit: retain local browser storage; token recovery is not included.
- Never commit service-role key, real .env, portfolio tokens, or private data.

## Push to GitHub
1. Create a new empty repository on GitHub. Do not add README or .gitignore there, because this project already has them.
2. Open terminal in the extracted project root and run:
   git init
   git status
   git add .
   git status
   git commit -m "Build Forma portfolio website"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
3. Replace YOUR_GITHUB_REPOSITORY_URL with the URL GitHub shows, such as https://github.com/your-name/your-repository.git.
4. Check the repository page contains frontend, backend, database, and README. Confirm backend/.env and node_modules are not uploaded. If a secret was committed, rotate it immediately; .gitignore does not erase past commits.

## Limits and next steps
Links are public to anyone who has them. Edit access depends on a browser-held token. Possible future work: verified accounts, token recovery, optional themes, and image upload. Deploy behind HTTPS and keep service keys server-side.
