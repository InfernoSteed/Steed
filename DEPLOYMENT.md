# Deployment Guide - Steed Video Editor

This guide explains how to deploy Steed Video Editor to various hosting platforms.

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/InfernoSteed/Steed)

### Manual Deployment Steps

#### 1. Prerequisites

- Vercel account ([sign up here](https://vercel.com/signup))
- GitHub repository pushed with latest changes
- Gemini API key (for AI features)

#### 2. Import Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`InfernoSteed/Steed`)
4. Click "Import"

#### 3. Configure Build Settings

Vercel should automatically detect the configuration from `vercel.json`, but verify these settings:

**Framework Preset:** `Other`

**Build & Development Settings:**
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `cd frontend && npm install`

**Root Directory:** Leave as `.` (root)

#### 4. Environment Variables

Add your environment variables in the Vercel dashboard:

1. In your project settings, go to "Environment Variables"
2. Add the following:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important:** Add this for all environments (Production, Preview, Development)

#### 5. Deploy

Click "Deploy" and wait for the build to complete (usually 2-3 minutes).

### Troubleshooting Common Issues

#### 404 Error After Deployment

**Problem:** Getting 404 NOT_FOUND error when accessing the site.

**Solution:** This has been fixed with the `vercel.json` configuration. If you still see this:

1. Check that `vercel.json` exists in the root directory
2. Verify the rewrites configuration is present
3. Redeploy the project

#### Build Failures

**Problem:** Build fails during deployment.

**Possible Causes:**
1. **Missing dependencies:** Ensure all dependencies are in `frontend/package.json`
2. **TypeScript errors:** Fix any TypeScript compilation errors
3. **Environment variables:** Make sure `GEMINI_API_KEY` is set

**Solution:**
```bash
# Test build locally first
cd frontend
npm install
npm run build
```

#### Environment Variables Not Working

**Problem:** API calls failing due to missing environment variables.

**Solution:**
1. Go to Project Settings → Environment Variables
2. Ensure `GEMINI_API_KEY` is set for all environments
3. Redeploy after adding variables (variables only apply to new deployments)

### Vercel Configuration Files

#### vercel.json (Root Directory)

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Points:**
- `buildCommand`: Navigates to frontend directory and builds
- `outputDirectory`: Points to the built files in `frontend/dist`
- `rewrites`: Ensures SPA routing works (all routes go to index.html)

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

### Automatic Deployments

Vercel automatically deploys:
- **Production:** When you push to your main branch
- **Preview:** When you create a pull request or push to other branches

Configure in: Project Settings → Git

## Alternative Deployment Options

### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build the project:
   ```bash
   cd frontend
   npm run build
   ```
3. Deploy:
   ```bash
   netlify deploy --dir=frontend/dist --prod
   ```

**Create `netlify.toml` in root:**
```toml
[build]
  command = "cd frontend && npm install && npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### GitHub Pages

1. Install gh-pages:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. Update `frontend/package.json`:
   ```json
   {
     "homepage": "https://infernosteed.github.io/Steed",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `frontend/vite.config.ts` base:
   ```typescript
   base: '/Steed/',  // Change from '/' to '/Steed/'
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Docker Deployment

**Dockerfile (in frontend directory):**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and run:**
```bash
cd frontend
docker build -t steed-video-editor .
docker run -p 80:80 steed-video-editor
```

## Performance Optimization

### Build Size Optimization

Already configured in `vite.config.ts`:
- Code splitting for React
- Asset optimization
- Tree shaking enabled

### CDN & Caching

Vercel automatically:
- Serves assets from global CDN
- Adds cache headers for static assets
- Compresses files with gzip/brotli

### Environment-Specific Builds

**Production:** Full optimizations, no source maps
**Development:** Fast builds, source maps enabled

## Monitoring & Analytics

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. View real-time performance metrics

### Adding Google Analytics

1. Add to `frontend/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

## Security

### Environment Variables

- Never commit `.env.local` files
- Use Vercel's environment variables for secrets
- Rotate API keys regularly

### HTTPS

- Vercel provides automatic HTTPS
- All deployments are served over HTTPS
- HTTP automatically redirects to HTTPS

## Support

If you encounter issues:

1. Check the [Vercel Logs](https://vercel.com/docs/deployments/logs) in your deployment
2. Review the [Vercel Documentation](https://vercel.com/docs)
3. Open an issue on [GitHub](https://github.com/InfernoSteed/Steed/issues)

---

**Last Updated:** December 2025
