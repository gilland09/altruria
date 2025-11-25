# PHASE 2 — FREE / QUICK DEMO: Frontend (GitHub Pages / Netlify) + Backend (Fly.io / PythonAnywhere)

Goal
- Provide a fast, low-friction way to demo the app for free using static hosting for the frontend (GitHub Pages or Netlify) and a small managed deployment for the backend (Fly.io or PythonAnywhere free tier).

Assumptions / Requirements
- Frontend is static HTML/CSS/JS — ready to serve on GitHub Pages or Netlify as-is.
- Backend is a Django REST app — we provide a minimal Dockerfile for Fly.io and instructions for PythonAnywhere (no Docker required there).
- CORS must be configured on the backend to allow the frontend domain (Netlify/GitHub Pages domain).
- The frontend is configured to use a runtime-overridable API base so you can point it to whichever backend host runs the API.

What I did already in this repo
- Centralized API config in `frontend/js/config.js` (supports runtime overrides with `window.__API_BASE__` or `window.__API_BASE_URL__`).
- Frontend pages (login, signup, profile, checkout, main scripts) updated to read `window.API_BASE_URL` / `window.API_BASE` so you can deploy the frontend on a static host and point it to the external backend.
- Verified `collectstatic` ran successfully and staticfiles are ready in `backend/staticfiles` for any server that needs them.

High-level options (pick one)
- Option A — GitHub Pages + Fly.io backend (recommended free/demo flow)
- Option B — Netlify + Fly.io backend (also recommended; Netlify allows simple environment variable injection at build time)
- Option C — GitHub Pages or Netlify + PythonAnywhere backend (easy for small demos, no Docker required)

Detailed steps — Option A (GitHub Pages + Fly.io)

1) Prepare backend on Fly.io
  - Make sure you have a Fly.io account and installed the `flyctl` CLI.
  - Create app on fly.io: `flyctl launch` (choose a region; keep app name meaningful)
  - Add secrets (in fly.io app settings) from your `.env` file: SECRET_KEY, DB_URL or DB_* (for a demo you can use SQLite via Dockerfile; but keep it secure), DEBUG=False, ALLOWED_HOSTS, CORS_ALLOWED.
  - Recommended: For quick demo, keep DB as SQLite (in Docker image) or configure some managed DB on Fly.
  - Example `Dockerfile` is provided in `backend/Dockerfile` (see below). The sample `fly.toml` is in `backend/fly.toml.example` — edit it and run `flyctl deploy`.

2) Deploy backend to Fly.io
  - In `backend/` directory: `flyctl deploy --config fly.toml` (or after `flyctl launch` follow instructions Fly shows).
  - Confirm API is reachable: `https://your-app.fly.dev/api/products/` (or your custom domain if set).
  - Set `CORS_ALLOWED` in your Fly environment to include the frontend domain (e.g., `https://username.github.io` or Netlify domain). Example with flyctl:

    ```powershell
    flyctl secrets set CORS_ALLOWED="https://username.github.io,https://your-netlify-app.netlify.app"
    flyctl secrets set ALLOWED_HOSTS="your-app.fly.dev"
    flyctl secrets set DEBUG=False
    ```

3) Prepare frontend on GitHub Pages
  - Build the static frontend files (the repo already contains static files). If you want to adjust the API target for GitHub Pages, set a small script in the root of your pages that sets `window.__API_BASE_URL__` to the Fly.io host.
  - For example, create a file `frontend/env.js` with:
    ```js
    window.__API_BASE_URL__ = 'https://your-app.fly.dev/api';
    window.__API_BASE = 'https://your-app.fly.dev';
    ```
    Commit that file (or configure GitHub Pages to serve it). Include it on your pages before `js/config.js` so the runtime override kicks in.
  - Alternatively, edit `frontend/js/config.js` and replace the default with the Fly URL before publishing.

4) Publish frontend to GitHub Pages
  - Create a new branch `gh-pages` that serves static content or use GitHub Actions to build/publish `frontend/` content to the `gh-pages` branch.
  - The simplest: create a repository and in GitHub repo settings enable Pages to serve from `/frontend` or `gh-pages` branch.

5) Verify the demo
  - Visit your GitHub Pages URL: `https://username.github.io/your-repo/` and ensure the app reaches the Fly.io backend (check browser network tab and API requests).

Detailed steps — Option B (Netlify + Fly.io)
- Steps 1 & 2: Same as Fly.io backend above.
- Deploy frontend to Netlify:
  - Drag-and-drop the `frontend/` folder in Netlify's site UI or connect the repo and configure build settings.
  - Set a build-time environment variable approach only if you have a build process; otherwise publish `env.js` (as above) into `frontend/` on the repo so it sets `window.__API_BASE_URL__` at runtime (Netlify will serve it as static asset).
  - Netlify will give you a domain `*.netlify.app`. Add that domain to backend `CORS_ALLOWED`.

Detailed steps — Option C (GitHub Pages / Netlify + PythonAnywhere)
1) For PythonAnywhere: Create an account and a web app
  - Upload repo files or push to your GitHub and let PythonAnywhere pull them.
  - Create a virtualenv on PythonAnywhere and install `requirements.txt`.
  - Configure the PythonAnywhere web app to use Django WSGI configuration file.
  - Map static files: configure the static files path to point to the `backend/staticfiles` folder after running `collectstatic` in your PythonAnywhere environment.
  - Set environment variables via the PythonAnywhere web UI (SECRET_KEY, DEBUG=False, CORS_ALLOWED, ALLOWED_HOSTS, DB settings).
  - Confirm `https://your-pythonanywhere-username.pythonanywhere.com/api/products/` returns results.
2) Frontend: same steps as Option A/B — add a small `env.js` to point to PythonAnywhere domain.

Important hosting notes and fixes I made already
- Central config: `frontend/js/config.js` supports runtime overrides (window.__API_BASE__ / window.__API_BASE_URL__). Use an `env.js` or edit `config.js` before publishing for the simplest setup.
- CORS: Add your frontend domain(s) to `CORS_ALLOWED` in the backend `.env` or Fly secrets.
- Cookies/CSRF / Authentication: This app uses token-based JWT auth. Since the frontend and backend will be on different domains in demo setups, ensure `CORS_ALLOW_CREDENTIALS=True` is set (already in settings). You may need to keep cookies disabled and rely on localStorage + Authorization header — the current frontend uses JWT in localStorage.
- Static files: For quick demo we rely on GitHub Pages / Netlify to serve frontend assets and Fly.io/PythonAnywhere to serve backend and uploaded media.

Files I added
- `backend/Dockerfile` (minimal Django + Gunicorn image for Fly.io)
- `backend/fly.toml.example` (example Fly configuration to deploy the backend)

Next actions I recommend (pick one set to follow and I’ll prepare deploy-specific files & scripts)
- "Deploy to Fly.io + GitHub Pages" — I'll provide exact Dockerfile tuned to this repo, an example `fly.toml` with environment placeholders, and a short GitHub Pages instruction for adding `env.js`.
- "Deploy to PythonAnywhere + GitHub Pages" — I’ll give a step-by-step PythonAnywhere-specific checklist and a sample `env.js` and `collectstatic` instructions.
- "Set up Netlify instead of GitHub Pages" — I’ll provide Netlify-friendly suggestions (env.js or a small build script) and a simple Netlify deploy configuration if you want CI.

Security reminder
- Never commit production secrets to Git; use Fly secrets, PythonAnywhere environment variables, Netlify build env vars, or GitHub Actions secrets.

Status: Free-demo doc added. If you want to proceed, pick which backend (Fly.io or PythonAnywhere) you'd like me to generate the exact deploy files for and I will create them next.
