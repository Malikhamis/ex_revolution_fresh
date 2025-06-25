# ex_revolution_fresh

A Netlify-deployable admin panel and backend for Ex Revolution, featuring serverless functions, static site build, and GitHub/Netlify integration.

## Features
- Admin panel (authentication, contact, quote, newsletter, blog management)
- Netlify Functions for backend logic
- Static site build for fast, secure hosting
- GitHub and Netlify CI/CD integration

## Getting Started

### Prerequisites
- Node.js & npm
- Netlify CLI (for local testing)
- Git

### Local Development
1. Clone the repo:
   ```sh
   git clone https://github.com/Malikhamis/ex_revolution_fresh.git
   cd ex_revolution_fresh
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the static site:
   ```sh
   npm run build
   ```
4. Serve locally with Netlify CLI:
   ```sh
   netlify dev
   ```

### Deployment
- Push to GitHub. Netlify will auto-deploy if connected.
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## License
See [LICENSE](LICENSE).
