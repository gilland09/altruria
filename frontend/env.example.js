// Example runtime configuration you can drop into the published frontend
// -- For demo deployments: set the backend URL your frontend should talk to.
// Save as env.js (or commit env.example.js and copy to env.js at deploy time).

// Backend origin (no trailing /api) - used by some pages
window.__API_BASE__ = 'https://your-backend-host.example';

// Full API path (optional) - overrides __API_BASE__ if set
// window.__API_BASE_URL__ = 'https://your-backend-host.example/api';

// Example:
// window.__API_BASE__ = 'https://altruria-demo.fly.dev';
// window.__API_BASE_URL__ = 'https://altruria-demo.fly.dev/api';

// Put this file at the site root and include it BEFORE js/config.js in your HTML
